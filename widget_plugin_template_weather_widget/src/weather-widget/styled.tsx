import { Box, Typography, styled } from '@mui/material';

export const Root = styled(Box, {
    name: 'WeatherWidget',
    slot: 'root',
})(({ theme }) => {
    return {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(0),
    };
});

export const Title = styled(Typography, {
    name: 'WeatherWidget',
    slot: 'title',
})(() => {
    return {};
});

Title.defaultProps = {
    variant: 'h4',
};

export const Value = styled(Typography, {
    name: 'WeatherWidget',
    slot: 'value',
})(({ theme }) => {
    return {
        marginTop: theme.spacing(2),
    };
});

Value.defaultProps = {
    variant: 'h1',
};
