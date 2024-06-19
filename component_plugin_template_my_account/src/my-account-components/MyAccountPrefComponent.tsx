/* eslint-disable react-refresh/only-export-components */
import React, { useCallback } from 'react';
import {
    BIZCONSOLE_THEME_TRANSLATION_KEY,
    BaseBizConsoleCompProps,
    BizConsoleTheme,
    SUPPORTED_LANGUAGES,
    SubSettingsErrorsLogger,
    User,
    isValidObjectValue,
    useAuthenticationStore,
    useUserPreferencesStore
} from '@moderepo/biz-console';
import * as StyledMyAccountComponents from './styled'
import { Box,  FormControl,  InputLabel,  MenuItem, Select, SelectChangeEvent, SxProps, Theme, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';


export interface MyAccountPrefComponentProps extends BaseBizConsoleCompProps {
    readonly sx?: SxProps<Theme>;
}

/**
 * Type guard function to check if the given obj is an instance of MyAccountPrefComponentProps.
 */
export const isMyAccountPrefComponentProps = (
    obj: unknown,
    errorLogger?: SubSettingsErrorsLogger | undefined
): obj is MyAccountPrefComponentProps => {
    const settings = obj as MyAccountPrefComponentProps;

    if (!isValidObjectValue(settings, true, errorLogger)) {
        return false;
    }

    return true;
};


export const MyAccountPrefComponent:React.FC<MyAccountPrefComponentProps> = ({projectId, sx}) => {

    const {t: trans} = useTranslation();

    const loggedInUser = useAuthenticationStore((store) => {
        return store.loggedInUser;
    }) as User;

    const userPreferencesActions = useUserPreferencesStore((store) => {
        return store.actions;
    });

    const userPreferences = useUserPreferencesStore((store) => {
        return store.userPreferencesByProjectIdByUserId[projectId]?.[loggedInUser.id];
    });

    const onLanguageChange = useCallback((event: SelectChangeEvent) => {
        userPreferencesActions.setUserPreferencesLanguage(projectId, loggedInUser.id, event.target.value as string)
    }, [loggedInUser.id, projectId, userPreferencesActions]);

    const onThemeChange = useCallback((event: SelectChangeEvent) => {
        userPreferencesActions.setUserPreferencesTheme(projectId, loggedInUser.id, event.target.value as BizConsoleTheme)
    }, [loggedInUser.id, projectId, userPreferencesActions]);

    return (
        <StyledMyAccountComponents.StyledMyAccountInfoComponent elevation={2} sx={sx}>
            <Typography variant='h3' sx={{paddingBottom:2}}>My Preferences</Typography>
            <Box style={{margin: "16px 0"}}>
                <FormControl fullWidth>
                    <InputLabel id="language-selector-label">Language</InputLabel>
                    <Select
                        labelId="language-selector-label"
                        value={userPreferences?.language ?? ''}
                        label="Language"
                        size="small"
                        onChange={onLanguageChange}
                    >
                        {SUPPORTED_LANGUAGES.map((language) => {
                            return (
                                <MenuItem value={language.code}>{language.name}</MenuItem>
                            )
                        })}
                    </Select>
                </FormControl>
            </Box>
            <Box style={{margin: "16px 0"}}>
                <FormControl fullWidth>
                    <InputLabel id="theme-selector-label">Theme</InputLabel>
                    <Select
                        labelId="theme-selector-label"
                        value={userPreferences?.theme ?? ''}
                        label="Theme"
                        size="small"
                        onChange={onThemeChange}
                    >
                        {Object.values(BizConsoleTheme).map((theme) => {
                            return (
                                <MenuItem value={theme}>{trans(BIZCONSOLE_THEME_TRANSLATION_KEY[theme])}</MenuItem>
                            )
                        })}
                    </Select>
                </FormControl>
            </Box>
        </StyledMyAccountComponents.StyledMyAccountInfoComponent>
    );
};
MyAccountPrefComponent.displayName = 'MyAccountPrefComponent';
