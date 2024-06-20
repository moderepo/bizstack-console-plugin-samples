/* eslint-disable react-refresh/only-export-components */
import React, { useCallback, useState } from 'react';
import {
    APIError,
    BaseBizConsoleCompProps,
    MazeAPI,
    SubSettingsErrorsLogger,
    User,
    isValidObjectValue,
    useAuthenticationStore,
} from '@moderepo/biz-console';
import * as StyledMyAccountComponents from './styled';
import { Box, Button, SxProps, TextField, Theme, Typography } from '@mui/material';

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

    return (
        <StyledMyAccountComponents.StyledMyAccountInfoComponent elevation={2} sx={sx}>
            <Typography variant="h3" sx={{ paddingBottom: 2 }}>
                My Account Info
            </Typography>
            <Box>ID: {loggedInUser.id}</Box>
            <Box>Email: {loggedInUser.email}</Box>
            <Box sx={{ padding: '16px 0' }}>
                <TextField fullWidth label="Name" onChange={onUserNameChange} value={name ?? ''} />
            </Box>
            <Box sx={{ paddingTop: '16px', textAlign: 'end' }}>
                <Button variant="contained" disabled={loggedInUser.name === name} onClick={saveUserName}>
                    Save
                </Button>
            </Box>
        </StyledMyAccountComponents.StyledMyAccountInfoComponent>
    );
};
MyAccountInfoComponent.displayName = 'MyAccountInfoComponent';
