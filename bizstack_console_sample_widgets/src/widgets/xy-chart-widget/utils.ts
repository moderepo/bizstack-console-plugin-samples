/* eslint-disable @typescript-eslint/indent */
/* eslint-disable indent */
import { Theme } from '@mui/material';
import {
    CHART_FULL_DATE_FORMAT,
    ChartsCursorBehavior,
    createAllYAxes,
    createChartCursor,
    createChartHorizontalScrollbar,
    createChartLegend2,
    createChartVerticalScrollbar,
    createYAxisUniqueId,
    escapeChartDisplayValue,
    ExtEntityNumericMetric,
    getAmchartsNumberFormatFromViewSettings,
    getChartSeriesColor,
    getDataPointLabelText,
    getDataStatistics,
    getEnforcedGroupYAxisBy,
    getMetricDisplayNameAndUnit,
    HorizontalPosition,
    MultiMetricsDataPoint,
    TFunction,
    TimeRangeParams,
    XYChartNumericMetricViewSettings,
    XYChartType,
    YAxesGroupByType,
} from '@moderepo/bizstack-console-sdk';
import { Bullet, Circle, Color, Label, p100, p50, percent, Rectangle, Root, Tooltip, Triangle } from '@amcharts/amcharts5';
import {
    AxisRenderer,
    AxisRendererX,
    ColumnSeries,
    DateAxis,
    ILineSeriesSettings,
    LineSeries,
    StepLineSeries,
    ValueAxis,
    XYChart,
    XYSeries,
} from '@amcharts/amcharts5/xy';
import { XYChartWidgetCustomSettings } from './models';
import { getChartBullet } from '@moderepo/bizstack-console-sdk';

/**
 * This is where all the logic for creating an Amcharts are placed
 */

/**
 * Create ONE Y Axes based on the provided settings
 */
const createOneSeries = (params: {
    readonly id: string;
    readonly root: Root;
    readonly chart: XYChart;
    readonly xAxis: DateAxis<AxisRenderer>;
    readonly yAxis: ValueAxis<AxisRenderer>;
    readonly customSettings: XYChartWidgetCustomSettings;
    readonly extNumericMetricInfo: ExtEntityNumericMetric<XYChartNumericMetricViewSettings>;
    readonly trans: TFunction;
    readonly theme: Theme;
    readonly isStacking?: boolean;
    readonly includeEntityName: boolean;
}) => {
    const chartType = params.extNumericMetricInfo?.viewSettings?.chartType ?? params.customSettings.globalNumericMetricsViewSettings?.chartType;

    const seriesStyle = params.extNumericMetricInfo.viewSettings?.seriesStyle ?? params.customSettings.globalNumericMetricsViewSettings?.seriesStyle;

    const numberFormat = getAmchartsNumberFormatFromViewSettings(
        params.extNumericMetricInfo.viewSettings,
        params.customSettings.globalNumericMetricsViewSettings
    );

    const seriesName = getMetricDisplayNameAndUnit(
        params.extNumericMetricInfo.metricDefinition,
        params.extNumericMetricInfo,
        params.customSettings.globalNumericMetricsViewSettings,
        params.includeEntityName,
        params.trans,
        {
            entity: params.extNumericMetricInfo.entity,
        }
    );

    const seriesColor = getChartSeriesColor(params.theme.chart.colors, params.extNumericMetricInfo.id);
    const fillColor = seriesStyle?.fillColor !== undefined ? Color.fromString(seriesStyle.fillColor) : Color.fromString(seriesColor.color);
    const strokeColor = seriesStyle?.strokeColor !== undefined ? Color.fromString(seriesStyle.strokeColor) : Color.fromString(seriesColor.color);

    const tooltip = Tooltip.new(params.root, {
        pointerOrientation: 'horizontal',
        labelText: `{name}: [bold]{valueY.formatNumber("${numberFormat}")}[/]`,
    });

    // Draw horizontal target line/bar
    const targetRanges = params.extNumericMetricInfo.viewSettings?.targetRanges;
    if (targetRanges !== undefined) {
        targetRanges.forEach((targetRange, index) => {
            const targetRangeStyle = targetRange?.targetRangeStyle;
            const rangeFillColor = targetRangeStyle?.fillColor !== undefined ? Color.fromString(targetRangeStyle.fillColor) : fillColor;
            const rangeFillOpacity = targetRangeStyle?.fillOpacity ?? 0.1;
            const rangeStrokeColor = targetRangeStyle?.strokeColor !== undefined ? Color.fromString(targetRangeStyle.strokeColor) : strokeColor;
            const rangeStrokeWidth = targetRangeStyle?.strokeWidth ?? 1.5;
            const rangeStrokeOpacity = targetRangeStyle?.strokeOpacity ?? 1;

            const rangeDataItem = params.yAxis.makeDataItem({
                value: targetRange.value,
                endValue: targetRange.endValue,
                above: true,
            });
            const range = params.yAxis.createAxisRange(rangeDataItem);

            let defaultLabel: string;
            if (targetRange.endValue !== undefined) {
                defaultLabel = `${targetRange.value} - ${targetRange.endValue}`;
                range.get('axisFill')?.setAll({
                    stroke: rangeStrokeColor,
                    strokeOpacity: rangeStrokeOpacity,
                    strokeWidth: rangeStrokeWidth,
                    strokeDasharray: targetRangeStyle?.strokeDasharray !== undefined ? [...targetRangeStyle.strokeDasharray] : undefined,
                    fill: rangeFillColor,
                    fillOpacity: rangeFillOpacity,
                    visible: true,
                });
            } else {
                defaultLabel = `${targetRange.value}`;
                range.get('grid')?.setAll({
                    stroke: rangeStrokeColor,
                    strokeOpacity: rangeStrokeOpacity,
                    strokeWidth: rangeStrokeWidth,
                    strokeDasharray: targetRangeStyle?.strokeDasharray !== undefined ? [...targetRangeStyle.strokeDasharray] : undefined,
                    location: 1,
                });
            }

            range.get('label')?.setAll({
                location: 1,
                text: targetRange.label ?? defaultLabel,
                inside: true,
                centerX: 0,
                centerY: p100,
                fontWeight: 'bold',
                layer: 100 + index, // set a large number to put in front of others
            });
        });
    }

    switch (chartType) {
        case XYChartType.BAR:
        case XYChartType.STACKED_BAR: {
            const series = params.chart.series.push(
                ColumnSeries.new(params.root, {
                    id: `${params.id}::${params.extNumericMetricInfo.id}`,
                    locationX: 0,
                    name: escapeChartDisplayValue(seriesName),
                    xAxis: params.xAxis,
                    yAxis: params.yAxis,
                    valueXField: 'timestamp',
                    valueYField: params.extNumericMetricInfo.id,
                    stacked: chartType === XYChartType.STACKED_BAR && params.isStacking,
                    tooltip,
                    fill: fillColor,
                    stroke: strokeColor,
                })
            );
            series.columns.template.setAll({
                width: percent(80),
                fillOpacity: seriesStyle?.fillOpacity ?? 0.8,
                strokeWidth: seriesStyle?.strokeWidth ?? 2,
                strokeOpacity: seriesStyle?.strokeOpacity ?? 1,
                strokeDasharray: seriesStyle?.strokeDasharray !== undefined ? [...seriesStyle.strokeDasharray] : undefined,
            });

            // If "showDataLabels" set to true, add bullets to show values of data
            // ref. https://www.amcharts.com/docs/v5/concepts/common-elements/bullets/#Stacked_bullets
            const dataLabelTemplate = params.extNumericMetricInfo.viewSettings?.dataLabelTemplate;
            if (params.customSettings.chartViewSettings?.showDataLabels === true || dataLabelTemplate !== undefined) {
                series.bullets.push(function (root, series, dataItem) {
                    return Bullet.new(root, {
                        locationX: 0.5,
                        locationY: 0.5,
                        sprite: Label.new(root, {
                            text:
                                getDataPointLabelText(params.extNumericMetricInfo.id, dataLabelTemplate, dataItem.dataContext) ??
                                `{valueY.formatNumber("${numberFormat}")}`,
                            textAlign: 'center',
                            centerX: p50,
                            centerY: p50,
                            populateText: true,
                        }),
                    });
                });
            }

            return series;
        }
        default: {
            const settings: ILineSeriesSettings = {
                id: `${params.id}::${params.extNumericMetricInfo.id}`,
                locationX: 0,
                connect: params.customSettings.chartViewSettings?.connectDataGap === true,
                name: escapeChartDisplayValue(seriesName),
                xAxis: params.xAxis,
                yAxis: params.yAxis,
                valueXField: 'timestamp',
                valueYField: params.extNumericMetricInfo.id,
                stroke: strokeColor,
                fill: fillColor,
                tooltip,
            };
            const series = params.chart.series.push(
                chartType === XYChartType.STEPPED_LINE ? StepLineSeries.new(params.root, settings) : LineSeries.new(params.root, settings)
            );

            // Set series' stroke style
            if (chartType === XYChartType.SCATTER) {
                // For Scatter chart, don't display the line
                series.strokes.template.setAll({
                    strokeWidth: 0,
                    strokeOpacity: 0,
                });
            } else {
                // For Line and Area chart
                series.strokes.template.setAll({
                    strokeWidth: seriesStyle?.strokeWidth ?? 2,
                    strokeOpacity: seriesStyle?.strokeOpacity ?? 1,
                    strokeDasharray: seriesStyle?.strokeDasharray !== undefined ? [...seriesStyle.strokeDasharray] : undefined,
                });
            }

            // Set fill style which only apply to AREA charts
            if (chartType === XYChartType.AREA) {
                series.fills.template.setAll({
                    fillOpacity: seriesStyle?.fillOpacity ?? 0.1,
                    visible: true,
                });
            }

            // For Scatter chart of Line and Area Chart with "showBullets" set to true, add Bullets
            if (chartType === XYChartType.SCATTER || params.customSettings.chartViewSettings?.showBullets === true) {
                const bulletShape = getChartBullet(params.extNumericMetricInfo.id);

                switch (bulletShape) {
                    case Circle:
                        series.bullets.push(function () {
                            return Bullet.new(params.root, {
                                locationX: 0,
                                sprite: Circle.new(params.root, {
                                    fill:
                                        seriesStyle?.strokeColor !== undefined
                                            ? Color.fromString(seriesStyle.strokeColor)
                                            : Color.fromString(seriesColor.color),
                                    strokeWidth: 2,
                                    stroke: Color.fromString(params.theme.palette.background.paper),
                                    fillOpacity: 1,
                                    radius: 5,
                                }),
                            });
                        });
                        break;
                    case Rectangle:
                        series.bullets.push(function () {
                            return Bullet.new(params.root, {
                                locationX: 0,
                                sprite: Rectangle.new(params.root, {
                                    fill:
                                        seriesStyle?.strokeColor !== undefined
                                            ? Color.fromString(seriesStyle.strokeColor)
                                            : Color.fromString(seriesColor.color),
                                    strokeWidth: 2,
                                    stroke: Color.fromString(params.theme.palette.background.paper),
                                    fillOpacity: 1,
                                    width: 8,
                                    height: 8,
                                    dx: -4,
                                    dy: -4,
                                }),
                            });
                        });
                        break;
                    case Triangle:
                        series.bullets.push(function () {
                            return Bullet.new(params.root, {
                                locationX: 0,
                                sprite: Triangle.new(params.root, {
                                    fill:
                                        seriesStyle?.strokeColor !== undefined
                                            ? Color.fromString(seriesStyle.strokeColor)
                                            : Color.fromString(seriesColor.color),
                                    strokeWidth: 2,
                                    stroke: Color.fromString(params.theme.palette.background.paper),
                                    fillOpacity: 1,
                                    width: 10,
                                    height: 10,
                                }),
                            });
                        });
                        break;
                }
            }

            // If "showDataLabels" set to true, add bullets to show values of data
            // ref. https://www.amcharts.com/docs/v5/concepts/common-elements/bullets/#Stacked_bullets
            const dataLabelTemplate = params.extNumericMetricInfo.viewSettings?.dataLabelTemplate;
            if (params.customSettings.chartViewSettings?.showDataLabels === true || dataLabelTemplate !== undefined) {
                series.bullets.push(function (root, series, dataItem) {
                    return Bullet.new(root, {
                        locationX: 0,
                        locationY: 0.5,
                        stacked: 'auto',
                        sprite: Label.new(root, {
                            text:
                                getDataPointLabelText(params.extNumericMetricInfo.id, dataLabelTemplate, dataItem.dataContext) ??
                                `{valueY.formatNumber("${numberFormat}")}`,
                            textAlign: 'center',
                            centerX: p50,
                            centerY: p100,
                            populateText: true,
                        }),
                    });
                });
            }

            return series;
        }
    }
};

interface SeriesConfig {
    readonly id: string;
    readonly root: Root;
    readonly chart: XYChart;
    readonly xAxis: DateAxis<AxisRenderer>;
    readonly yAxis: ValueAxis<AxisRenderer>;
    readonly customSettings: XYChartWidgetCustomSettings;
    readonly metricsInfo: ExtEntityNumericMetric<XYChartNumericMetricViewSettings>;
    readonly dataPoints: Array<MultiMetricsDataPoint<number | string>>;
    readonly trans: TFunction;
    readonly theme: Theme;
}

/**
 * Create ALL the Series, 1 for each numeric metric, for the chart based on the provided settings
 */
const createAllSeries = (params: {
    readonly id: string;
    readonly root: Root;
    readonly chart: XYChart;
    readonly chartId: string;
    readonly xAxis: DateAxis<AxisRenderer>;
    readonly customSettings: XYChartWidgetCustomSettings;
    readonly extNumericMetricsInfo: ReadonlyArray<ExtEntityNumericMetric<XYChartNumericMetricViewSettings>>;
    readonly dataPoints: Array<MultiMetricsDataPoint<number | string>>;
    readonly trans: TFunction;
    readonly theme: Theme;
    readonly metricsThatNeedToIncludeEntityName: readonly string[];
}) => {
    const deferredStackedBarSeriesGrouped = new Map<string, SeriesConfig[]>();

    params.extNumericMetricsInfo.forEach((metricInfo, index) => {
        const groupYAxesBy = getEnforcedGroupYAxisBy(
            metricInfo.viewSettings?.chartType ?? params.customSettings?.globalNumericMetricsViewSettings?.chartType,
            params.customSettings.chartViewSettings?.groupYAxesBy
        );

        // Find the Y axis the series belongs to
        const yAxisKey = createYAxisUniqueId({
            chartId: params.chartId,
            groupBy: groupYAxesBy,
            extNumericMetricInfo: metricInfo,
            metricIndex: index,
        });
        const yAxis = params.chart.yAxes.values.find((yAxis) => {
            return yAxis.get('id') === yAxisKey;
        });
        const isStackedBarChart =
            (metricInfo.viewSettings?.chartType ?? params.customSettings.globalNumericMetricsViewSettings?.chartType) === XYChartType.STACKED_BAR;

        if (yAxis) {
            if (!isStackedBarChart) {
                // immediately create series for all chart types except stacked bar
                const series = createOneSeries({
                    id: params.id,
                    root: params.root,
                    chart: params.chart,
                    xAxis: params.xAxis,
                    yAxis: yAxis as ValueAxis<AxisRenderer>,
                    customSettings: params.customSettings,
                    extNumericMetricInfo: metricInfo,
                    trans: params.trans,
                    theme: params.theme,
                    includeEntityName: params.metricsThatNeedToIncludeEntityName.includes(metricInfo.id),
                });

                series.data.setAll(params.dataPoints);
            } else {
                // for stacked bar charts, each stack of bars (grouped by y axis, or grouped all together if no y axes grouping is set),
                // must be processed in order for the stacking property to group the correct bars together. Therefore, we defer the creation
                // of stacked bar chart series until they are grouped
                let groupKey = '';

                switch (groupYAxesBy) {
                    case YAxesGroupByType.UNIT:
                        groupKey =
                            metricInfo.viewSettings?.unit ??
                            params.customSettings.globalNumericMetricsViewSettings?.unit ??
                            metricInfo.metricDefinition?.unit ??
                            'no_unit';
                        break;
                    case YAxesGroupByType.METRICS_DEFINITION:
                        groupKey = metricInfo.metricsDefinitionId ?? `metric_${index}`;
                        break;
                    case YAxesGroupByType.ENTITY:
                        groupKey = metricInfo.entityId ?? `entity_${index}`;
                        break;
                    case YAxesGroupByType.GROUP_NAME:
                        groupKey = metricInfo.viewSettings?.groupName ?? '';
                        break;
                    case YAxesGroupByType.ALL:
                    case undefined:
                    default:
                        groupKey = 'all_metrics';
                        break;
                }

                const config: SeriesConfig = {
                    id: params.id,
                    root: params.root,
                    chart: params.chart,
                    xAxis: params.xAxis,
                    yAxis: yAxis as ValueAxis<AxisRenderer>,
                    customSettings: params.customSettings,
                    metricsInfo: metricInfo,
                    dataPoints: params.dataPoints,
                    trans: params.trans,
                    theme: params.theme,
                };

                if (!deferredStackedBarSeriesGrouped.has(groupKey)) {
                    deferredStackedBarSeriesGrouped.set(groupKey, []);
                }
                deferredStackedBarSeriesGrouped.get(groupKey)?.push(config);
            }
        }
    });

    Array.from(deferredStackedBarSeriesGrouped.values()).forEach((configsInGroup: SeriesConfig[]) => {
        configsInGroup?.forEach((config: SeriesConfig, index) => {
            // the first series of each group should not be stacked, the rest should be stacked
            const series = createOneSeries({
                id: params.id,
                root: config.root,
                chart: config.chart,
                xAxis: config.xAxis,
                yAxis: config.yAxis,
                customSettings: config.customSettings,
                extNumericMetricInfo: config.metricsInfo,
                trans: config.trans,
                theme: config.theme,
                isStacking: index !== 0,
                includeEntityName: params.metricsThatNeedToIncludeEntityName.includes(config.metricsInfo.id),
            });
            series.data.setAll(config.dataPoints);
        });
    });
};

export const createXYChartWidgetChart = (params: {
    readonly id: string;
    readonly root: Root;
    readonly customSettings: XYChartWidgetCustomSettings;
    readonly dataPoints: Array<MultiMetricsDataPoint<number | string>>;
    readonly extNumericMetricsInfo: ReadonlyArray<ExtEntityNumericMetric<XYChartNumericMetricViewSettings>>;
    readonly timeRange: TimeRangeParams;
    readonly horizontalSelectionRange: TimeRangeParams | undefined;
    readonly verticalSelectionRange: { min: number; max: number } | undefined;
    readonly trans: TFunction;
    readonly theme: Theme;
    readonly locale: string | undefined;
    readonly metricsThatNeedToIncludeEntityName: readonly string[];
    readonly hiddenSeriesIds: readonly string[] | undefined;
    readonly onHorizontalSelectionChange: (start: number, end: number) => void;
    readonly onVerticalSelectionChange: (min: number, max: number) => void;
    readonly onMetricsVisibilityChange?: (hiddenSeriesIds: readonly string[] | undefined) => void;
}): XYChart => {
    // Create chart
    const chart = params.root.container.children.push(
        XYChart.new(params.root, {
            id: params.id,
            pinchZoomX: true,
        })
    );

    // Get the data statistics
    const dataStats = getDataStatistics(params.dataPoints);

    const tooltip = Tooltip.new(params.root, {});

    // Create and add X Axis to the chart
    const xAxis = chart.xAxes.push(
        DateAxis.new(params.root, {
            maxDeviation: 0.1,
            baseInterval: {
                timeUnit: dataStats?.resolution.timeUnit ?? 'second',
                count: dataStats?.resolution.amount ?? 1,
            },
            strictMinMax: true,
            renderer: AxisRendererX.new(params.root, {
                strokeWidth: params.theme.chart.axisLine.strokeWidth,
                strokeOpacity: params.theme.chart.axisLine.strokeOpacity,
            }),
            tooltipDateFormat: CHART_FULL_DATE_FORMAT,
            tooltip,
            min: params.timeRange.start,
            max: params.timeRange.end,
            tooltipLocation: 0,
        })
    );

    // Style the horizontal grid lines
    xAxis.get('renderer').grid.template.setAll({
        strokeWidth: params.theme.chart.grid.strokeWidth,
        strokeOpacity: params.theme.chart.grid.strokeOpacity,
        location: 0,
    });

    // style the label
    xAxis.get('renderer').labels.template.setAll({
        location: 0,
        multiLocation: 0,
    });

    // Create cursor
    createChartCursor({
        root: params.root,
        chart,
        xAxis,
        behavior: params.customSettings.chartViewSettings?.cursorBehavior ?? ChartsCursorBehavior.ZOOM_X,
        hideLineY: true,
    });

    // Get the list of metrics that are not marked as "hidden"
    const visibleMetrics = params.extNumericMetricsInfo.filter((metricInfo) => {
        return !metricInfo.viewSettings?.hidden;
    });

    // Create and add Y Axes to the chart
    createAllYAxes({
        root: params.root,
        chart,
        chartId: params.id,
        chartViewSettings: params.customSettings.chartViewSettings,
        globalNumericMetricsViewSettings: params.customSettings.globalNumericMetricsViewSettings,
        extNumericMetricsInfo: visibleMetrics,
        trans: params.trans,
        theme: params.theme,
        metricsThatNeedToIncludeEntityName: params.metricsThatNeedToIncludeEntityName,
    });

    createAllSeries({
        id: params.id,
        root: params.root,
        chart,
        chartId: params.id,
        xAxis,
        customSettings: params.customSettings,
        extNumericMetricsInfo: visibleMetrics,
        dataPoints: params.dataPoints,
        trans: params.trans,
        theme: params.theme,
        metricsThatNeedToIncludeEntityName: params.metricsThatNeedToIncludeEntityName,
    });

    // NOTE: add scrollbars AFTER creating the Axes so that the scrollbars can be added below or on the right or of the axes
    if (params.customSettings.chartViewSettings?.showHorizontalScrollbar === true) {
        createChartHorizontalScrollbar({ chart, root: params.root });
    }

    if (params.customSettings.chartViewSettings?.showVerticalScrollbar === true) {
        createChartVerticalScrollbar({ chart, root: params.root });
    }

    // If there are "hiddenSeriesIds", hide the series associated with the metric ID.
    // IMPORTANT NOTE: We need to do this AFTER the series data has been set or else the "chart.series.get(id)" will always be undefined
    if (params.hiddenSeriesIds) {
        chart.series.each((series) => {
            const seriesId = series.get('id');
            if (seriesId && params.hiddenSeriesIds?.includes(seriesId)) {
                series.hide(0);
            }
        });
    }

    // NOTE: Add legend AFTER creating the Series because the legend depends on the series
    const { legend, legendContainer } = createChartLegend2({
        root: params.root,
        chart,
        theme: params.theme,
        legendSettings: params.customSettings.chartViewSettings?.legendSettings,
        trans: params.trans,
    }) ?? { legend: undefined, legendContainer: undefined };

    // Listen to legend on "click" event so we can remember the series' hidden/visible state and restore it later when we re-create the chart
    // IMPORTANT NOTE: We need to register the event BEFORE setting the data for the legend.
    if (params.onMetricsVisibilityChange) {
        legend?.itemContainers.template.events.on('click', (event) => {
            if (!params.onMetricsVisibilityChange) {
                return;
            }

            // Get the list of metrics in the "series" that are hidden. NOTE: this list is based on the previous state BEFORE the legend was
            // clicked. Clicking the legend will change one of the metrics in this list so we need to handle it afterward.
            const updatedHiddenSeriesIds: string[] = [];
            chart.series.each((series) => {
                const seriesId = series.get('id');
                if (seriesId && series.isHidden()) {
                    updatedHiddenSeriesIds.push(seriesId);
                }
            });

            // Add/remove the series the user just clicked on
            const seriesClicked = event.target.dataItem?.dataContext as XYSeries;

            // Get the ID of the series that was clicked on
            const seriesClickedId = seriesClicked.get('id');

            if (seriesClickedId) {
                const index = updatedHiddenSeriesIds.indexOf(seriesClickedId);
                if (index >= 0) {
                    // If the seriesClickedId is already existed in the "updatedHiddenSeriesIds" which means it was HIDDEN before. Therefore
                    // clicking on the legend would show it. So we need to remove it from the "updatedHiddenSeriesIds"
                    updatedHiddenSeriesIds.splice(index, 1);
                } else {
                    // If the seriesClickedId is not in the "updatedHiddenSeriesIds" then it means the metric was VISIBLE. Therefore we need to
                    // add it to the "updatedHiddenSeriesIds" because it should be hidden after the legend is clicked.
                    updatedHiddenSeriesIds.push(seriesClickedId);
                }
            }

            params.onMetricsVisibilityChange(updatedHiddenSeriesIds.length > 0 ? updatedHiddenSeriesIds : undefined);
        });
    }
    legend?.data.setAll(chart.series.values);

    const firstSeries = chart.series.getIndex(0);
    if (firstSeries) {
        firstSeries.events.once('datavalidated', () => {
            if (params.horizontalSelectionRange) {
                // Automatically set the X Axis zoom area to the selectionRange
                xAxis.zoomToDates(new Date(params.horizontalSelectionRange.start), new Date(params.horizontalSelectionRange.end));
            }

            // Automatically set each Y Axis zoom area to the verticalSelectionRange
            chart.yAxes.each((axis) => {
                if (params.verticalSelectionRange) {
                    (axis as ValueAxis<AxisRenderer>).zoom(params.verticalSelectionRange.min, params.verticalSelectionRange?.max);
                }
            });

            // Listen to the X Axis' start/end events and fire onHorizontalSelectionChange when the user zoomed in horizontally
            xAxis.on('start', (start) => {
                const end = xAxis.get('end');
                if (start !== undefined && end !== undefined) {
                    // "start" and "end" values are in % relative to the X Axis' range. We need to convert them to timestamps
                    const startTimestamp = xAxis.positionToDate(start).valueOf();
                    const endTimestamp = xAxis.positionToDate(end).valueOf();

                    if (Number.isFinite(startTimestamp) && Number.isFinite(endTimestamp)) {
                        params.onHorizontalSelectionChange(Math.floor(startTimestamp), Math.floor(endTimestamp));
                    }
                }
            });

            xAxis.on('end', (end) => {
                const start = xAxis.get('start');
                if (start !== undefined && end !== undefined) {
                    // "start" and "end" values are in % relative to the X Axis' range. We need to convert them to timestamps
                    const startTimestamp = xAxis.positionToDate(start).valueOf();
                    const endTimestamp = xAxis.positionToDate(end).valueOf();

                    if (Number.isFinite(startTimestamp) && Number.isFinite(endTimestamp)) {
                        params.onHorizontalSelectionChange(Math.floor(startTimestamp), Math.floor(endTimestamp));
                    }
                }
            });

            // Listen to the Y Axis' start/end events and fire onVerticalSelectionChange when the user zoomed in vertically
            const yAxis = chart.yAxes.getIndex(0);
            if (yAxis) {
                (yAxis as ValueAxis<AxisRenderer>).on('start', (start) => {
                    const end = yAxis.get('end');
                    if (start !== undefined && end !== undefined) {
                        params.onVerticalSelectionChange(start, end);
                    }
                });

                (yAxis as ValueAxis<AxisRenderer>).on('end', (end) => {
                    const start = yAxis.get('start');
                    if (start !== undefined && end !== undefined) {
                        params.onVerticalSelectionChange(start, end);
                    }
                });
            }
        });
    }

    // When the widget is really small and if the legend is displayed on the left/right, there isn't much space left to display the actual chart.
    // Therefore, we will automatically hide the legend if the widget is too small to show both the legend and the chart.
    const updateLegendVisibility = () => {
        if (
            legendContainer &&
            (params.customSettings.chartViewSettings?.legendSettings?.position === HorizontalPosition.LEFT ||
                params.customSettings.chartViewSettings?.legendSettings?.position === HorizontalPosition.RIGHT)
        ) {
            // First, we need to show the legend so that we can compute the legend's width
            legendContainer.setAll({
                forceHidden: false,
                visible: true,
            });

            // When we enable legend, it takes time for the legend to show up therefore we must wait a little bit before calculating the legend width
            setTimeout(() => {
                const widgetWidth = chart.width();
                const legendContainerWidth = legendContainer.width();
                const plotAreaWidth = chart.plotContainer.width();

                // If the legend takes up more than 50% of the widget's width or if the plot area is less than 100px then hide the legend
                if (legendContainerWidth > widgetWidth / 2 || plotAreaWidth < 100) {
                    legendContainer.setAll({
                        forceHidden: true,
                    });
                }
            }, 200);
        }
    };

    // Recompute the legend whenever the chart is resized.
    chart.events.on('boundschanged', () => {
        updateLegendVisibility();
    });

    return chart;
};
