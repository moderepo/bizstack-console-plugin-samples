/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import {
    isValidObjectValue,
    SubSettingsErrorsLogger,
    BaseBizStackAppExtensionComponentProps,
    isBaseBizStackAppExtensionComponentProps,
} from '@moderepo/bizstack-console-sdk';
import { Box, Typography } from '@mui/material';

export interface ReportPageProps extends BaseBizStackAppExtensionComponentProps {}

/**
 * Type guard function to check if the given obj is an instance of ReportPageProps.
 */
export const isReportPageProps = (obj: unknown, errorLogger?: SubSettingsErrorsLogger | undefined): obj is ReportPageProps => {
    const settings = obj as ReportPageProps;

    if (!isValidObjectValue(settings, true, errorLogger)) {
        return false;
    }

    if (!isBaseBizStackAppExtensionComponentProps(settings, errorLogger)) {
        return false;
    }

    return true;
};

export const ReportPage: React.FC<ReportPageProps> = ({ projectId, bizstackAppId, bizstackAppInstallationId }) => {
    return (
        <Box>
            <Typography variant="h6">Report Page</Typography>
            <Typography variant="body1">Project ID: {projectId}</Typography>
            <Typography variant="body1">BizStack App Id: {bizstackAppId}</Typography>
            <Typography variant="body1">Installation ID: {bizstackAppInstallationId}</Typography>
        </Box>
    );
};
ReportPage.displayName = 'ReportPage';
