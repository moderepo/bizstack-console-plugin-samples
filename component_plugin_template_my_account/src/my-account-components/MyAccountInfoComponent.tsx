/* eslint-disable react-refresh/only-export-components */
import React, { FormEvent, useCallback, useState } from 'react';
import {
    APIError,
    BaseBizConsoleCompProps,
    MazeAPI,
    SubSettingsErrorsLogger,
    User,
    isValidObjectValue,
    useAuthenticationStore,
    StyledForm,
    StyledPanel,
} from '@moderepo/bizstack-console-sdk';
import { SxProps, Theme } from '@mui/material';

export interface MyAccountInfoComponentProps extends BaseBizConsoleCompProps {
    readonly sx?: SxProps<Theme>;
}

/**
 * Type guard function to check if the given obj is an instance of MyAccountInfoComponentProps.
 */
export const isMyAccountInfoComponentProps = (
    obj: unknown,
    errorLogger?: SubSettingsErrorsLogger | undefined
): obj is MyAccountInfoComponentProps => {
    const settings = obj as MyAccountInfoComponentProps;

    if (!isValidObjectValue(settings, true, errorLogger)) {
        return false;
    }

    return true;
};

export const MyAccountInfoComponent: React.FC<MyAccountInfoComponentProps> = ({ sx }) => {
    const authActions = useAuthenticationStore((store) => {
        return store.actions;
    });

    const loggedInUser = useAuthenticationStore((store) => {
        return store.loggedInUser;
    }) as User;

    const [name, setName] = useState<string | undefined>(loggedInUser.name);

    const onUserNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    }, []);

    const saveUserName = useCallback(async () => {
        const response = await MazeAPI.getInstance().updateUser(loggedInUser.id, { name });
        if (!(response instanceof APIError)) {
            // Reload user data
            const updatedLoggedInUser = await MazeAPI.getInstance().getUser(loggedInUser.id);
            if (!(updatedLoggedInUser instanceof APIError)) {
                await authActions.setLoggedInUser(updatedLoggedInUser);
            }
        } else {
            alert(`Save user failed with error "${response.errorCode}"`);
        }
    }, [authActions, loggedInUser.id, name]);

    const onFormSubmit = useCallback(async (event: FormEvent) => {
        event.preventDefault();
    }, []);

    return (
        <StyledPanel.Panel sx={sx}>
            <StyledForm.FormContainer>
                <StyledForm.Form onSubmit={onFormSubmit}>
                    <StyledPanel.HeaderBar>
                        <StyledPanel.HeaderBarLeftContent>
                            <StyledPanel.HeaderBarTitle>My Account Info</StyledPanel.HeaderBarTitle>
                        </StyledPanel.HeaderBarLeftContent>
                    </StyledPanel.HeaderBar>
                    <StyledPanel.Content>
                        <StyledForm.TextInputField label="ID" InputProps={{ readOnly: true }} value={loggedInUser.id} />
                        <StyledForm.TextInputField label="Email" InputProps={{ readOnly: true }} value={loggedInUser.email} />
                        <StyledForm.TextInputField label="Name" variant="outlined" value={name ?? ''} onChange={onUserNameChange} />
                    </StyledPanel.Content>
                    <StyledPanel.FooterBar>
                        <StyledForm.ActionsBar>
                            <StyledForm.RightActionsBar>
                                <StyledForm.ActionButton variant="contained" disabled={loggedInUser.name === name} onClick={saveUserName}>
                                    Save
                                </StyledForm.ActionButton>
                            </StyledForm.RightActionsBar>
                        </StyledForm.ActionsBar>
                    </StyledPanel.FooterBar>
                </StyledForm.Form>
            </StyledForm.FormContainer>
        </StyledPanel.Panel>
    );
};
MyAccountInfoComponent.displayName = 'MyAccountInfoComponent';
