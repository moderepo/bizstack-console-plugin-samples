/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { BaseBizConsoleCompProps, SubSettingsErrorsLogger, isValidNumberValue, isValidObjectValue } from '@moderepo/bizstack-console-sdk';
import { MyAccountInfoComponent } from './MyAccountInfoComponent';
import * as StyledMyAccountComponents from './styled';
import { Box, Typography } from '@mui/material';
import { MyAccountPrefComponent } from './MyAccountPrefComponent';

export interface MyCustomAccountPageProps extends BaseBizConsoleCompProps {
    readonly projectId: number;
}

/**
 * Type guard function to check if the given obj is an instance of MyCustomAccountPageProps.
 */
export const isMyCustomAccountPageProps = (obj: unknown, errorLogger?: SubSettingsErrorsLogger | undefined): obj is MyCustomAccountPageProps => {
    const settings = obj as MyCustomAccountPageProps;

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

export const MyCustomAccountPage: React.FC<MyCustomAccountPageProps> = ({ projectId }) => {
    return (
        <StyledMyAccountComponents.StyledMyCustomAccountPage>
            <Box sx={{ textAlign: 'center', paddingBottom: 5 }}>
                <Typography variant="h2">This is a Custom Page</Typography>
                <Typography variant="h5">Anything can go in here</Typography>
            </Box>
            <MyAccountInfoComponent />
            <MyAccountPrefComponent sx={{ marginTop: 2 }} projectId={projectId} />
        </StyledMyAccountComponents.StyledMyCustomAccountPage>
    );
};
MyCustomAccountPage.displayName = 'MyCustomAccountPage';
