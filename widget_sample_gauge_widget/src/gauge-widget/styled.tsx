/* eslint-disable @typescript-eslint/no-unused-vars */
import { GenericIcon, MetricThresholdColorMapping, MetricValueStatus, StyledPanel } from '@moderepo/bizstack-console-sdk';
import { Box, Card, CardContent, styled, Typography } from '@mui/material';

export const StyledDefaultContainer = styled(Box, {
    name: 'GaugeWidget',
    slot: 'container',
})(({ theme }) => {
    return {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    };
});

export const StyledCardContainer = styled(Card, {
    name: 'GaugeWidget',
    slot: 'cardContainer',
})(() => {
    return {
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };
});

export const StyledCardContent = styled(CardContent, {
    name: 'GaugeWidget',
    slot: 'cardContent',
})(({ theme }) => {
    return {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
    };
});

export const StyledCardTitleAndIcon = styled(Box, {
    name: 'GaugeWidget',
    slot: 'cardTitleAndIcon',
})(({ theme }) => {
    return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        textAlign: 'center',
    };
});

export const StyledCardIcon = styled(GenericIcon, {
    name: 'GaugeWidget',
    slot: 'icon',
})(({ theme }) => {
    return {
        marginRight: theme.spacing(1),
        fontSize: '1.5em',
    };
});

export const StyledPanelContainer = styled(StyledPanel.Panel, {
    name: 'GaugeWidget',
    slot: 'panelContainer',
})(() => {
    return {
        height: '100%',
    };
});

export const StyledPanelContent = styled(StyledPanel.Content, {
    name: 'GaugeWidget',
    slot: 'panelContent',
})(({ theme }) => {
    return {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
    };
});

export const StyledTitleDisplay = styled(Typography, {
    name: 'GaugeWidget',
    slot: 'styledTitleDisplay',
})(() => {
    return {
        fontSize: '1.25em',
    };
});
StyledTitleDisplay.defaultProps = {
    variant: 'h3',
};

export const StyledDataDisplay = styled(Box, {
    name: 'GaugeWidget',
    slot: 'dataDisplay',
})(({ theme }) => {
    return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: theme.spacing(1),
    };
});

export const StyledValueAndUnitDisplay = styled(Box, {
    shouldForwardProp(prop) {
        return prop !== 'metricThresholdColorMapping';
    },
    name: 'GaugeWidget',
    slot: 'valueAndUnitDisplay',
})<{
    readonly metricThresholdColorMapping?: MetricThresholdColorMapping;
}>(({ theme, metricThresholdColorMapping }) => {
    return {
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'center',
        flexDirection: 'row',
        padding: theme.spacing(1),

        [`&.status-${MetricValueStatus.NORMAL_VALUE}`]: {
            color: metricThresholdColorMapping?.normalValueColor ?? theme.palette.thresholdColors.normal,
        },
        [`&.status-${MetricValueStatus.LOW_VALUE_WARNING}`]: {
            color: metricThresholdColorMapping?.lowValueWarningColor ?? theme.palette.thresholdColors.lowValueWarning,
        },
        [`&.status-${MetricValueStatus.LOW_VALUE_DANGER}`]: {
            color: metricThresholdColorMapping?.lowValueDangerColor ?? theme.palette.thresholdColors.lowValueDanger,
        },
        [`&.status-${MetricValueStatus.HIGH_VALUE_WARNING}`]: {
            color: metricThresholdColorMapping?.highValueWarningColor ?? theme.palette.thresholdColors.highValueWarning,
        },
        [`&.status-${MetricValueStatus.HIGH_VALUE_DANGER}`]: {
            color: metricThresholdColorMapping?.highValueDangerColor ?? theme.palette.thresholdColors.highValueDanger,
        },
        [`&.status-${MetricValueStatus.UNKNOWN_VALUE}`]: {
            color: metricThresholdColorMapping?.unknownValueColor ?? theme.palette.thresholdColors.unknown,
        },
    };
});

export const StyledValueDisplay = styled(Typography, {
    name: 'GaugeWidget',
    slot: 'valueDisplay',
})(() => {
    return {
        fontSize: '1.75em',
    };
});
StyledValueDisplay.defaultProps = {
    variant: 'h1',
};

export const StyledUnitDisplay = styled(Typography, {
    name: 'GaugeWidget',
    slot: 'unitDisplay',
})(({ theme }) => {
    return {
        fontSize: '1.5em',
        marginLeft: theme.spacing(0.5),
    };
});
StyledUnitDisplay.defaultProps = {
    variant: 'h2',
};

export const StyledDateDisplay = styled(Typography, {
    name: 'GaugeWidget',
    slot: 'dateDisplay',
})(() => {
    return {
        fontSize: '0.875em',
    };
});
StyledDateDisplay.defaultProps = {
    variant: 'body2',
};

export const Root = styled(Box, {
    name: 'GaugeWidget',
    slot: 'root',
})(() => {
    return {};
});

export const GaugeChartContainer = styled(Box, {
    name: 'GaugeWidget',
    slot: 'gaugeChartContainer',
})(() => {
    return {
        width: '100%',
        aspectRatio: '2',
    };
});
