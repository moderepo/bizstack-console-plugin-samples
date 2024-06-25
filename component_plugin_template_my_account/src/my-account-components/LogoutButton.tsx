/* eslint-disable react-refresh/only-export-components */
import React, { useCallback } from 'react';
import { Button } from '@mui/material';
import { Icons, BaseBizConsoleCompProps, isValidObjectValue, SubSettingsErrorsLogger } from '@moderepo/biz-console';
import { useNavigate } from 'react-router-dom';

export interface LogoutButtonProps extends BaseBizConsoleCompProps {}

/**
 * Type guard function to check if the given obj is an instance of LogoutButtonProps.
 */
export const isLogoutButtonProps = (obj: unknown, errorLogger?: SubSettingsErrorsLogger | undefined): obj is LogoutButtonProps => {
    const settings = obj as LogoutButtonProps;

    if (!isValidObjectValue(settings, true, errorLogger)) {
        return false;
    }

    return true;
};

export const LogoutButton: React.FC<LogoutButtonProps> = ({ projectId }) => {
    const navigate = useNavigate();

    const onClick = useCallback(() => {
        navigate(`/projects/${projectId}/logout`, { replace: true });
    }, [navigate, projectId]);

    return (
        <Button variant="contained" startIcon={<Icons.LogoutOutlined />} onClick={onClick}>
            Logout
        </Button>
    );
};
LogoutButton.displayName = 'LogoutButton';
