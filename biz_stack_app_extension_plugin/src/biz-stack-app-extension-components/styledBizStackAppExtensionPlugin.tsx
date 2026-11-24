import { StyledPanel } from '@moderepo/bizstack-console-sdk';
import { Box, styled } from '@mui/material';

export const Root = styled(Box, {
    name: 'Root',
    slot: 'root',
})(({ theme }) => {
    return {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        gap: theme.spacing(2),
    };
});

export const ProgressComponent = styled(Box, {
    name: 'ProgressComponent',
    slot: 'progressComponentRoot',
})(({ theme }) => {
    return {
        position: 'sticky',
        top: 0,
        backgroundColor: theme.palette.misc.containerBackground1,
        padding: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
        zIndex: 3,
    };
});

export const FooterBar = styled(StyledPanel.FooterBar, {
    name: 'FooterBar',
    slot: 'footerBarRoot',
})(({ theme }) => {
    return {
        position: 'sticky',
        bottom: 0,
        padding: theme.spacing(2),
        gap: theme.spacing(2),
        backgroundColor: theme.palette.misc.containerBackground2,
        borderRadius: theme.shape.borderRadius,
        zIndex: 2,
    };
});
