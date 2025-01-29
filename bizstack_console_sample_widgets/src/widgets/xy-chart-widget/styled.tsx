import { Box, styled } from '@mui/material';

export const Root = styled(Box, {
    name: 'StyledXYChartEWidget',
    slot: 'root',
})(({ theme }) => {
    return {
        width: '100%',
        height: 500,
    };
});

export const NoDataContainer = styled(Box, {
    name: 'StyledXYChartEWidget',
    slot: 'noDataContainer',
})(({ theme }) => {
    return {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    };
});
