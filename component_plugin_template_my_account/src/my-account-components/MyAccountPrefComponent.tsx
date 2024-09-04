/* eslint-disable react-refresh/only-export-components */
import React, { FormEvent, useCallback } from 'react';
import {
    BIZCONSOLE_THEME_TRANSLATION_KEY,
    BaseBizConsoleCompProps,
    BizConsoleTheme,
    SubSettingsErrorsLogger,
    User,
    isValidObjectValue,
    useAuthenticationStore,
    useUserPreferencesStore,
    StyledPanel,
    StyledForm,
    isValidNumberValue,
    useSupportedLanguage,
} from '@moderepo/bizstack-console-sdk';
import { MenuItem, OutlinedInput, SelectChangeEvent, SxProps, Theme } from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface MyAccountPrefComponentProps extends BaseBizConsoleCompProps {
    readonly sx?: SxProps<Theme>;
    readonly projectId: number;
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

    if (
        !isValidNumberValue(
            settings.projectId,
            true,
            false,
            undefined,
            undefined,
            undefined,
            new SubSettingsErrorsLogger(errorLogger, 'projectId', settings.projectId)
        )
    ) {
        return false;
    }

    return true;
};

export const MyAccountPrefComponent: React.FC<MyAccountPrefComponentProps> = ({ projectId, sx }) => {
    const { t: trans } = useTranslation();
    const { supportedLanguages } = useSupportedLanguage();

    const loggedInUser = useAuthenticationStore((store) => {
        return store.loggedInUser;
    }) as User;

    const userPreferencesActions = useUserPreferencesStore((store) => {
        return store.actions;
    });

    const userPreferences = useUserPreferencesStore((store) => {
        return store.userPreferencesByProjectIdByUserId[projectId]?.[loggedInUser.id];
    });

    const onLanguageChange = useCallback(
        (event: SelectChangeEvent) => {
            userPreferencesActions.setUserPreferencesLanguage(projectId, loggedInUser.id, event.target.value as string);
        },
        [loggedInUser.id, projectId, userPreferencesActions]
    );

    const onThemeChange = useCallback(
        (event: SelectChangeEvent) => {
            userPreferencesActions.setUserPreferencesTheme(projectId, loggedInUser.id, event.target.value as BizConsoleTheme);
        },
        [loggedInUser.id, projectId, userPreferencesActions]
    );

    const onFormSubmit = useCallback(async (event: FormEvent) => {
        event.preventDefault();
    }, []);

    return (
        <StyledPanel.Panel sx={sx}>
            <StyledForm.FormContainer>
                <StyledForm.Form onSubmit={onFormSubmit}>
                    <StyledPanel.HeaderBar>
                        <StyledPanel.HeaderBarLeftContent>
                            <StyledPanel.HeaderBarTitle> My Preferences</StyledPanel.HeaderBarTitle>
                        </StyledPanel.HeaderBarLeftContent>
                    </StyledPanel.HeaderBar>
                    <StyledPanel.Content>
                        <StyledForm.StyledFormControl fullWidth variant="outlined" required={true}>
                            <StyledForm.StyledInputLabel>Language</StyledForm.StyledInputLabel>
                            <StyledForm.SelectInputField
                                label="Language"
                                input={<OutlinedInput notched label="Language" />}
                                type={'number'}
                                value={userPreferences?.language ?? ''}
                                onChange={onLanguageChange}
                            >
                                {supportedLanguages.map((language) => {
                                    return (
                                        <MenuItem key={language.code} value={language.code} selected={language.code === userPreferences?.language}>
                                            {language.name}
                                        </MenuItem>
                                    );
                                })}
                            </StyledForm.SelectInputField>
                        </StyledForm.StyledFormControl>
                        <StyledForm.StyledFormControl fullWidth variant="outlined" required={true}>
                            <StyledForm.StyledInputLabel>Theme</StyledForm.StyledInputLabel>
                            <StyledForm.SelectInputField
                                label="Theme"
                                input={<OutlinedInput notched label="Theme" />}
                                type={'number'}
                                value={userPreferences?.theme ?? ''}
                                onChange={onThemeChange}
                            >
                                {Object.values(BizConsoleTheme).map((theme) => {
                                    return (
                                        <MenuItem key={theme} value={theme} selected={theme === userPreferences?.theme}>
                                            {trans(BIZCONSOLE_THEME_TRANSLATION_KEY[theme])}
                                        </MenuItem>
                                    );
                                })}
                            </StyledForm.SelectInputField>
                        </StyledForm.StyledFormControl>
                    </StyledPanel.Content>
                </StyledForm.Form>
            </StyledForm.FormContainer>
        </StyledPanel.Panel>
    );
};
MyAccountPrefComponent.displayName = 'MyAccountPrefComponent';
