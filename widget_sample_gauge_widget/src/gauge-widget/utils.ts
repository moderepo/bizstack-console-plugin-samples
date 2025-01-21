/* eslint-disable @typescript-eslint/indent */
/* eslint-disable indent */
import { Root } from '@amcharts/amcharts5';
import { DEFAULT_GAUGE_CHART_BAND_WIDTH, GaugeWidgetCustomSettings, GaugeWidgetNumericMetricViewSettings } from './models';
import { Theme } from '@mui/material';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5radar from '@amcharts/amcharts5/radar';
import { EntityNumericMetric, ExtEntityNumericMetric } from '@moderepo/bizstack-console-sdk';

export const createGaugeChart = (params: {
    readonly id: string;
    readonly root: Root;
    readonly customSettings: GaugeWidgetCustomSettings;
    readonly value: number | undefined;
    readonly numericMetricInfo?: EntityNumericMetric;
    readonly extNumericMetricInfo: ExtEntityNumericMetric<GaugeWidgetNumericMetricViewSettings>;
    readonly theme: Theme;
}): am5radar.RadarChart => {
    /** ******************************************************** PREPARE DATA ***************************************************/

    // If there are no min/max settings in the numeric metrics info, double the value to create the min/max so that the handle point to
    // the center. But if value is 0 then set the min/max to -100/100
    // So if value=5 then min/max will be 0/10
    // If value=-15 then min/max will be -30/0
    // If value=0 then min/max will be -100/100
    const defaultMin = typeof params.value === 'number' ? (params.value !== 0 ? params.value - Math.abs(params.value) : -100) : 0;
    const defaultMax = typeof params.value === 'number' ? (params.value !== 0 ? params.value + Math.abs(params.value) : 100) : 100;
    const disableRangeSettings =
        params.extNumericMetricInfo.viewSettings?.disableRange ?? params.customSettings.globalNumericMetricsViewSettings?.disableRange;
    const minValue = disableRangeSettings
        ? defaultMin
        : params.extNumericMetricInfo.viewSettings?.range?.min ?? params.numericMetricInfo?.range?.min ?? defaultMin;
    const maxValue = disableRangeSettings
        ? defaultMax
        : params.extNumericMetricInfo.viewSettings?.range?.max ?? params.numericMetricInfo?.range?.max ?? defaultMax;

    // Get the threshold settings
    const lowValueDangerThreshold = params.extNumericMetricInfo.viewSettings?.lowValueDangerThreshold;
    const lowValueWarningThreshold = params.extNumericMetricInfo.viewSettings?.lowValueWarningThreshold;
    const highValueWarningThreshold = params.extNumericMetricInfo.viewSettings?.highValueWarningThreshold;
    const highValueDangerThreshold = params.extNumericMetricInfo.viewSettings?.highValueDangerThreshold;

    const hasThresholdSettings =
        lowValueDangerThreshold !== undefined ||
        lowValueWarningThreshold !== undefined ||
        highValueWarningThreshold !== undefined ||
        highValueDangerThreshold !== undefined;

    // Create Bands/Segments for the gauge based on the threshold settings. For example: If there is a lowValueDangerThreshold value,
    // we will create a band from the minValue to the lowValueDangerThreshold value. If there is a lowValueWarningThreshold value,
    // we will create a band from lowValueDangerThreshold to lowValueWarningThreshold UNLESS there is no lowValueDangerThreshold
    // then we create a band from minValue to lowValueWarningThreshold.
    // The tricky part is that threshold values are optional so we must handle creating the band properly.
    const allBands: Array<{
        readonly color: string;
        readonly fromValue: number;
        readonly toValue: number;
    }> = [];

    const customColors = params.extNumericMetricInfo.viewSettings?.metricThresholdColorMapping;
    if (hasThresholdSettings) {
        const lowValueDangerColor = customColors?.lowValueDangerColor ?? params.theme.palette.thresholdColors.lowValueDanger;
        const lowValueWarningColor = customColors?.lowValueWarningColor ?? params.theme.palette.thresholdColors.lowValueWarning;
        const highValueDangerColor = customColors?.highValueDangerColor ?? params.theme.palette.thresholdColors.highValueDanger;
        const highValueWarningColor = customColors?.highValueWarningColor ?? params.theme.palette.thresholdColors.highValueWarning;
        const normalColor = customColors?.normalValueColor ?? params.theme.palette.thresholdColors.normal;

        // Create the bands for the LOW threshold settings. We will add bands to the END of the array
        const lowThresholdBands: Array<{
            readonly color: string;
            readonly fromValue: number;
            readonly toValue: number;
        }> = [];

        // Start with the minValue
        let startValuePointer = minValue;

        // Push a new band to the array if there is a lowValueDangerThreshold settings
        if (lowValueDangerThreshold !== undefined && lowValueDangerThreshold >= minValue) {
            lowThresholdBands.push({
                color: lowValueDangerColor,
                fromValue: startValuePointer,
                toValue: lowValueDangerThreshold,
            });
            startValuePointer = lowValueDangerThreshold;
        }

        // Push a new band to the array if there is a lowValueWarningThreshold settings
        if (lowValueWarningThreshold !== undefined) {
            lowThresholdBands.push({
                color: lowValueWarningColor,
                fromValue: startValuePointer,
                toValue: lowValueWarningThreshold,
            });
            startValuePointer = lowValueWarningThreshold;
        }

        // Create the bands for the HIGH threshold settings. We will be pushing the bands to the FRONT of the array
        const highThresholdBands: Array<{
            readonly color: string;
            readonly fromValue: number;
            readonly toValue: number;
        }> = [];

        let endValuePointer = maxValue;

        if (highValueDangerThreshold !== undefined) {
            highThresholdBands.unshift({
                color: highValueDangerColor,
                fromValue: highValueDangerThreshold,
                toValue: endValuePointer,
            });
            endValuePointer = highValueDangerThreshold;
        }

        if (highValueWarningThreshold !== undefined) {
            highThresholdBands.unshift({
                color: highValueWarningColor,
                fromValue: highValueWarningThreshold,
                toValue: endValuePointer,
            });
            endValuePointer = highValueWarningThreshold;
        }

        // Merge the 2 arrays and add the normal color band in the middle
        allBands.push(
            ...lowThresholdBands,
            {
                color: normalColor,
                fromValue: startValuePointer,
                toValue: endValuePointer,
            },
            ...highThresholdBands
        );
    } else {
        // If there are no threshold settings then create just 1 band from the minValue to maxValue
        allBands.push({
            color: customColors?.unknownValueColor ?? params.theme.palette.text.secondary,
            fromValue: minValue,
            toValue: maxValue,
        });
    }

    /** ******************************************************** CREATE CHART ***************************************************/

    const bandWidth = params.customSettings.chartViewSettings?.bandWidth ?? DEFAULT_GAUGE_CHART_BAND_WIDTH;

    // Create chart
    const chart = params.root.container.children.push(
        am5radar.RadarChart.new(params.root, {
            id: params.id,
            panX: false,
            panY: false,
            startAngle: 180,
            endAngle: 360,
            paddingLeft: 0,
            paddingRight: 0,
            paddingBottom: 0,
        })
    );

    const axisRenderer = am5radar.AxisRendererCircular.new(params.root, {
        radius: am5.percent(100),
        innerRadius: -bandWidth,
        strokeOpacity: 0,
        strokeWidth: 0,
        minGridDistance: 50,
    });

    axisRenderer.ticks.template.setAll({
        visible: true,
        strokeOpacity: 1,
        strokeWidth: 1,
        stroke: params.root.interfaceColors.get('background'),
        length: bandWidth,
        inside: true,
    });

    const axis = chart.xAxes.push(
        am5xy.ValueAxis.new(params.root, {
            maxDeviation: 0,
            min: minValue,
            max: maxValue,
            strictMinMax: true,
            renderer: axisRenderer,
        })
    );

    // Add the metric's value to the axis
    const rangeDataItem = axis.makeDataItem({
        value: typeof params.value === 'number' ? params.value : minValue,
    });
    axis.createAxisRange(rangeDataItem);

    // Create the bands
    am5.array.each(allBands, function (data) {
        const axisRange = axis.createAxisRange(axis.makeDataItem({}));

        axisRange.setAll({
            value: data.fromValue,
            endValue: data.toValue,
        });

        const axisFill = axisRange.get('axisFill');
        // NOTE: As of March 2024, amCharts5 Color class cannot parse hex color string with alpha like "#aabbccff".
        const [colorString, opacity] =
            data.color.startsWith('#') && data.color.length === 9
                ? [data.color.slice(0, 7), parseInt(data.color.slice(-2), 16) / 0xff]
                : [data.color, 0.8];
        axisFill?.setAll({
            visible: true,
            fill: am5.color(colorString),
            fillOpacity: opacity,
        });
    });

    // Create the Hand pointer
    const clockHand = am5radar.ClockHand.new(params.root, {
        pinRadius: 10,
        innerRadius: 12,
        bottomWidth: 10,
        radius: -bandWidth - 2,
    });
    clockHand.pin.setAll({
        fill: am5.color(params.theme.palette.text.secondary),
    });
    clockHand.hand.setAll({
        fill: am5.color(params.theme.palette.text.secondary),
    });

    rangeDataItem.set(
        'bullet',
        am5xy.AxisBullet.new(params.root, {
            sprite: clockHand,
        })
    );

    return chart;
};
