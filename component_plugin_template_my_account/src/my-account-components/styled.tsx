import { Box, Paper, styled } from '@mui/material';

export const StyledMyCustomAccountPage = styled(Box, {
    name: 'MyAccountComponents',
    slot: 'myCustomAccountPage',
})(({ theme }) => {
    return {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    };
});

export const StyledMyAccountInfoComponent = styled(Paper, {
    name: 'MyAccountComponents',
    slot: 'root',
})(({ theme }) => {
    return {
        padding: theme.spacing(2),
    };
});
