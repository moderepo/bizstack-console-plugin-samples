/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { Box, Typography } from '@mui/material';
import {
    isValidObjectValue,
    SubSettingsErrorsLogger,
    BaseBizStackAppExtensionComponentProps,
    isBaseBizStackAppExtensionComponentProps,
} from '@moderepo/bizstack-console-sdk';

export interface LogsPageProps extends BaseBizStackAppExtensionComponentProps {}

/**
 * Type guard function to check if the given obj is an instance of LogsPageProps.
 */
export const isLogsPageProps = (obj: unknown, errorLogger?: SubSettingsErrorsLogger | undefined): obj is LogsPageProps => {
    const settings = obj as LogsPageProps;

    if (!isValidObjectValue(settings, true, errorLogger)) {
        return false;
    }

    if (!isBaseBizStackAppExtensionComponentProps(settings, errorLogger)) {
        return false;
    }

    return true;
};

export const LogsPage: React.FC<LogsPageProps> = ({ projectId, bizstackAppId, bizstackAppInstallationId }) => {
    return (
        <Box>
            <Typography variant="h6">Logs Page</Typography>
            <Typography variant="body1">Project ID: {projectId}</Typography>
            <Typography variant="body1">BizStack App Id: {bizstackAppId}</Typography>
            <Typography variant="body1">Installation ID: {bizstackAppInstallationId}</Typography>
        </Box>
    );
};
LogsPage.displayName = 'LogsPage';
