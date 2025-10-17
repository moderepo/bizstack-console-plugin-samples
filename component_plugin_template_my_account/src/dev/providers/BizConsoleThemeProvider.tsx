import React, { PropsWithChildren, useMemo } from 'react';
import { ThemeProvider } from '@mui/material';
import {
    isDataStateValue,
    useAppSettingsStore,
    useAuthenticationStore,
    BIZCONSOLE_SUPPORTED_THEMES,
    DEFAULT_THEME,
    useUserPreferencesTheme,
} from '@moderepo/bizstack-console-sdk';

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

        return themeObject ?? DEFAULT_THEME;
    }, [appSettings?.theme, userPreferencesTheme]);

    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
