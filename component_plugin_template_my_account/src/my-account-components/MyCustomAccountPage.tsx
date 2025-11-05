/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { BaseBizConsoleCompProps, SubSettingsErrorsLogger, isValidNumberValue, isValidObjectValue } from '@moderepo/bizstack-console-sdk';
import { MyAccountInfoComponent } from './MyAccountInfoComponent';
import * as StyledMyAccountComponents from './styled';
import { Box, Typography } from '@mui/material';
import { MyAccountPrefComponent } from './MyAccountPrefComponent';
import { CustomMapComponent } from './CustomMapComponent';

export interface MyCustomAccountPageProps extends BaseBizConsoleCompProps {
    readonly projectId: number;
    readonly entityId?: number;
    readonly startTime?: number;
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

export const MyCustomAccountPage: React.FC<MyCustomAccountPageProps> = ({ projectId, entityId, startTime }) => {
    return (
        <StyledMyAccountComponents.StyledMyCustomAccountPage>
            <Box sx={{ textAlign: 'center', paddingBottom: 5 }}>
                <Typography variant="h2">This is a Custom Page</Typography>
                <Typography variant="h5">Anything can go in here</Typography>
                <Box>projectId: {projectId}</Box>
                <Box>entityId: {entityId ?? 'undefined'}</Box>
                <Box>startTime: {startTime ?? 'undefined'}</Box>
            </Box>
            <MyAccountInfoComponent />
            <MyAccountPrefComponent sx={{ marginTop: 2 }} projectId={projectId} />
            <CustomMapComponent
                latitude={35.68126027047642}
                longitude={139.76700658271713}
                zoom={10}
                sx={{ marginTop: 2, width: '100%', height: '400px' }}
            />
        </StyledMyAccountComponents.StyledMyCustomAccountPage>
    );
};
MyCustomAccountPage.displayName = 'MyCustomAccountPage';
