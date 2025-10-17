import React, { PropsWithChildren, useMemo } from 'react';
import { ThemeProvider } from '@mui/material';
import type { Theme } from '@mui/material';
import * as BizConsoleSdk from '@moderepo/bizstack-console-sdk';
import {
    isDataStateValue,
    useAppSettingsStore,
    useAuthenticationStore,
    BIZCONSOLE_SUPPORTED_THEMES,
    DEFAULT_THEME,
    useUserPreferencesTheme,
} from '@moderepo/bizstack-console-sdk';

// Note:
// For the Styled* components defined by bizstack-console-sdk,
// the variant specified on them is not applied in self-hosted environments.
// For example, the h3 variant in bizConsoleLightTheme sets fontSize to 20,
// so StyledPanel.HeaderBarTitle, which specifies the h3 variant,
// should render its title at fontSize 20, but in reality
// the fontSize falls back to MUI's default 3rem.
// To address this, we manually override the styles for any Styled* component
// provided by bizstack-console-sdk.

type TypographyComponentWithVariant = React.ComponentType & {
    defaultProps?: {
        variant?: string;
        sx?: unknown;
    };
    __bizConsoleOriginalSx__?: unknown[];
    __bizConsoleTypographyPatchedTheme__?: Theme;
};

type StyledExportSource = unknown;

const STYLED_EXPORT_SOURCES: StyledExportSource[] = Array.from(
    new Set(
        Object.entries(BizConsoleSdk)
            .filter(([key]) => key.startsWith('Styled'))
            .map(([, value]) => value)
            .filter(Boolean)
    )
);

const isTypographyComponentWithVariant = (value: unknown): value is TypographyComponentWithVariant => {
    if (!value) {
        return false;
    }

    const valueType = typeof value;
    if (valueType !== 'function' && valueType !== 'object') {
        return false;
    }

    const component = value as TypographyComponentWithVariant;
    return typeof component.defaultProps?.variant === 'string';
};

const findVariantStyle = (theme: Theme, variant: string) => {
    const variants = theme.components?.MuiTypography?.variants;
    if (!Array.isArray(variants)) {
        return undefined;
    }

    const match = variants.find(({ props }) => props && typeof props !== 'function' && props.variant === variant);
    return match?.style;
};

const ensureTypographyVariantDefaultSxForComponent = (component: TypographyComponentWithVariant, theme: Theme) => {
    if (component.__bizConsoleTypographyPatchedTheme__ === theme) {
        return;
    }

    const variant = component.defaultProps?.variant;
    if (typeof variant !== 'string') {
        return;
    }

    const variantStyle = findVariantStyle(theme, variant);
    if (!variantStyle) {
        return;
    }

    const defaultProps = component.defaultProps ?? {};
    let baseSx = component.__bizConsoleOriginalSx__;
    if (!baseSx) {
        const currentSx = defaultProps.sx;
        baseSx = Array.isArray(currentSx) ? [...currentSx] : currentSx !== undefined ? [currentSx] : [];
        component.__bizConsoleOriginalSx__ = baseSx;
    }

    const finalBaseSx = baseSx ?? [];

    component.defaultProps = {
        ...defaultProps,
        sx: [...finalBaseSx, variantStyle],
    };
    component.__bizConsoleTypographyPatchedTheme__ = theme;
};

const ensureTypographyVariantDefaults = (theme: Theme, sources: readonly StyledExportSource[]) => {
    const visited = new Set<unknown>();
    const stack = [...sources];

    while (stack.length > 0) {
        const candidate = stack.pop();
        if (!candidate || visited.has(candidate)) {
            continue;
        }
        visited.add(candidate);

        if (isTypographyComponentWithVariant(candidate)) {
            ensureTypographyVariantDefaultSxForComponent(candidate, theme);
            continue;
        }

        if (Array.isArray(candidate)) {
            stack.push(...candidate);
            continue;
        }

        if (candidate instanceof Map) {
            stack.push(...candidate.values());
            continue;
        }

        if (candidate instanceof Set) {
            stack.push(...candidate.values());
            continue;
        }

        if (typeof candidate === 'object') {
            Object.values(candidate as Record<string, unknown>).forEach((value) => {
                if (value && (typeof value === 'object' || typeof value === 'function')) {
                    stack.push(value);
                }
            });
        }
    }
};

export const BizConsoleThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
    // Get the loggedInUser's object
    const loggedInUser = useAuthenticationStore((store) => {
        return store.loggedInUser;
    });

    const { userPreferencesTheme } = useUserPreferencesTheme();

    const appSettings = useAppSettingsStore((store) => {
        if (loggedInUser) {
            const appSettings = store.appSettingsByProjectId[loggedInUser.projectId];
            if (isDataStateValue(appSettings)) {
                return appSettings;
            }
        }
        return undefined;
    });

    // Get the name of the theme from the user's userPreferences or the project's appSettings. We will use these theme if they are specified.
    // If not, we will use the default theme.
    const theme = useMemo(() => {
        const themeName = userPreferencesTheme ?? appSettings?.theme;

        // Get the theme object based on the themeName
        const themeObject = themeName && BIZCONSOLE_SUPPORTED_THEMES[themeName] ? BIZCONSOLE_SUPPORTED_THEMES[themeName] : undefined;

        const resolvedTheme = themeObject ?? DEFAULT_THEME;
        ensureTypographyVariantDefaults(resolvedTheme, STYLED_EXPORT_SOURCES);
        return resolvedTheme;
    }, [appSettings?.theme, userPreferencesTheme]);

    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
