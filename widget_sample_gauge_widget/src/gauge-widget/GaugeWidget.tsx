/* eslint-disable indent */
/* eslint-disable @typescript-eslint/indent */
import React, { Fragment, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
    AccessPermission,
    BaseDataConsumerContext,
    COMPONENTS_SPACING,
    DataConsumer,
    DataConsumerRequests,
    DEFAULT_DECIMAL_PLACES,
    EntityViewCompProps,
    GenericEntityViewCompSettings,
    GenericMessageBox,
    getNumberFormatter,
    getTranslatedValue,
    isDataStateValue,
    LoadingComponent,
    MainResourceType,
    MAX_RAW_DATA_COUNT,
    NO_VALUE,
    NoneValue,
    NotReady,
    SortOrder,
    SubResourceType,
    TimeRangeParams,
    TypeNotReady,
    useHasAccessPermission,
    useSelectEntity,
    useSelectTranslatedEntityClass,
    useSelectTranslatedEntityClasses,
    useUserLanguage,
    VALUE_TO_DISPLAY_TYPE_AGGREGATION_MAP,
    ValueToDisplayType,
    getTimeRangeFromTimeParams,
    createEntityMetricsDataRequests,
    getMetricDisplayDefaultValue,
    getMetricDisplayName,
    getMetricDisplayUnit,
    getMetricValuesFromDataPoints,
    MultiMetricsDataPoint,
    processAndCombineEntityMetricsDataResponse,
    useCombinedExtMetricsInfo,
    useCustomSettingsWithEntityUISettingsBasedMetricsViewSettingsOverride,
    CHART_FULL_DATE_FORMAT,
    formatDate,
    translateEntityClasses,
    useTranslation,
    createAndInitializeAmchartsRoot,
    useFetchRequiredEntitiesForMetricsDataSources,
} from '@moderepo/bizstack-console-sdk';
import * as StyledGaugeWidget from './styled';
import { Grid, useTheme } from '@mui/material';
import { createGaugeChart } from './utils';
import { Root } from '@amcharts/amcharts5';
import { createInitialGaugeWidgetCustomSettings, GaugeWidgetCustomSettings, isGaugeWidgetCustomSettings } from './models';
import { GaugeWidgetContainer } from './GaugeWidgetContainer';

interface GaugeWidgetDataConsumerContext extends BaseDataConsumerContext {
    readonly timeRange: TimeRangeParams;
    readonly selectionRange: TimeRangeParams | undefined;
}

export interface GaugeWidgetProps extends EntityViewCompProps {
    readonly compSettings: GenericEntityViewCompSettings<GaugeWidgetCustomSettings>;
}

export const GaugeWidget = React.forwardRef<DataConsumer<GaugeWidgetDataConsumerContext>, GaugeWidgetProps>(
    ({ componentsManager, className, style, sx, id, projectId, entityId, compSettings }, ref) => {
        const { t: trans } = useTranslation();
        const isLoadingData = useRef(false);

        const theme = useTheme();
        const userLanguage = useUserLanguage();
        const entityClasses = useSelectTranslatedEntityClasses(projectId, userLanguage);

        const customSettings = useCustomSettingsWithEntityUISettingsBasedMetricsViewSettingsOverride(
            projectId,
            entityId,
            GaugeWidget.displayName,
            compSettings.customSettings ?? createInitialGaugeWidgetCustomSettings(),
            isGaugeWidgetCustomSettings
        );

        // Check if the user can view the entity's metrics
        const canViewEntityMetrics = useHasAccessPermission(AccessPermission.READ, MainResourceType.ENTITY, SubResourceType.ENTITY_METRIC, entityId);

        // Combine the component's style created by the parent container with the "style" from customSettings. The styles from "customSettings"
        // takes precedent
        const combinedStyle = useMemo(() => {
            return {
                ...sx,
                ...customSettings.style,
            };
        }, [customSettings.style, sx]);

        /**
         * The data fetched from the back end and other information about the metrics.
         */
        const [data, setData] = useState<{
            readonly dataPoints: Array<MultiMetricsDataPoint<string | number>>;
            readonly timeRange: TimeRangeParams;
            readonly selectionRange?: TimeRangeParams;
        }>();

        /* ------------------------------------------------------    DATA FETCHED FROM BACKEND    ------------------------------------------------- */

        // The state to keep track of the Entity data
        const entity = useSelectEntity(projectId, entityId);
        const entityClass = useSelectTranslatedEntityClass(projectId, isDataStateValue(entity) ? entity.entityClass : undefined, userLanguage);

        // Get all the entities required for this widget based on the dataSourcesSettings
        const dataSourcesAndTargetEntitiesPairs = useFetchRequiredEntitiesForMetricsDataSources(
            projectId,
            entityId,
            customSettings.dataSourcesSettings,
            entityClasses
        );

        // Get view-component-friendly metrics info
        const metricsInfo = useCombinedExtMetricsInfo(dataSourcesAndTargetEntitiesPairs, entityClasses);

        // useMemo to cache values to be displayed
        const metricValues = useMemo(() => {
            const timeRange = data?.selectionRange ?? data?.timeRange;
            return getMetricValuesFromDataPoints(data?.dataPoints, metricsInfo, customSettings.dataAgeLimit, timeRange);
        }, [customSettings.dataAgeLimit, data?.dataPoints, data?.selectionRange, data?.timeRange, metricsInfo]);

        /**
         * This is how a DataConsumer component implement the DataConsumer interfaces. It needs to implement the functions defined
         * in the DataConsumer interface. The data request handler will call these functions to communicate with the component.
         */
        useImperativeHandle(ref, () => {
            translateEntityClasses(entityClasses, trans);

            return {
                getId: () => {
                    return id;
                },

                getDataRequests: (
                    timeParams?: TimeRangeParams,
                    selectionRange?: TimeRangeParams
                ): DataConsumerRequests<GaugeWidgetDataConsumerContext> | TypeNotReady | undefined => {
                    const timeRange = getTimeRangeFromTimeParams(timeParams);
                    if (!dataSourcesAndTargetEntitiesPairs || timeRange === undefined) {
                        return NotReady;
                    }

                    if (!canViewEntityMetrics) {
                        return undefined;
                    }

                    isLoadingData.current = true;

                    return {
                        requests: createEntityMetricsDataRequests(
                            projectId,
                            entityClasses,
                            dataSourcesAndTargetEntitiesPairs,
                            (dataSourceSettings) => {
                                if (dataSourceSettings.valueToDisplay === undefined) {
                                    // In this case, ignore the time range and always fetch the latest data nearest the current time.
                                    return {
                                        start: Date.now(),
                                        end: Date.now(),
                                    };
                                } else {
                                    return selectionRange ?? timeRange;
                                }
                            },
                            // For this component, we need to control aggregation and dataCount parameters based on the valueToDisplay.
                            (dataSourceSettings) => {
                                if (
                                    dataSourceSettings.valueToDisplay === undefined ||
                                    dataSourceSettings.valueToDisplay === ValueToDisplayType.LAST
                                ) {
                                    // We need non-aggregated raw data.
                                    return {
                                        // We want the non-null metrics values. It is not always the latest data point within a range. we need to
                                        // get raw data as many as possible and skip null values after getting the result.
                                        aggregation: NoneValue,
                                        dataCount: MAX_RAW_DATA_COUNT,
                                    };
                                } else {
                                    // We need to get aggregated data
                                    return {
                                        aggregation: VALUE_TO_DISPLAY_TYPE_AGGREGATION_MAP[dataSourceSettings.valueToDisplay],
                                    };
                                }
                            },
                            undefined,
                            SortOrder.DESC // This is applied only to raw data request
                        ),
                        context: {
                            timeRange,
                            selectionRange,
                        },
                    };
                },

                onDataReady: (dataRequestResponses) => {
                    isLoadingData.current = false;

                    if (!dataSourcesAndTargetEntitiesPairs) {
                        setData(undefined);
                        return;
                    }

                    const processedResponseData = processAndCombineEntityMetricsDataResponse(
                        dataRequestResponses.responses,
                        dataSourcesAndTargetEntitiesPairs
                    );

                    setData({
                        dataPoints: processedResponseData.dataPoints,
                        timeRange: dataRequestResponses.context.timeRange,
                        selectionRange: dataRequestResponses.context.selectionRange,
                    });
                },
            };
        }, [entityClasses, trans, id, dataSourcesAndTargetEntitiesPairs, canViewEntityMetrics, projectId]);

        /**
         * This useEffect monitors the component's "compSettings" change event and call the EntityViewComponentsManager to reload
         * data for this component.
         */
        useEffect(() => {
            if (compSettings && componentsManager.hasLoadedDataForAllComponents() && !isLoadingData.current) {
                componentsManager.loadDataForComponent(id);
            }
        }, [compSettings, componentsManager, id]);

        /**
         * This useEffect is used for cleaning up the component by removing the component from the "EntityViewComponentsManager"
         * so that the "EntityViewComponentsManager" won't call this component to load data anymore.
         * Only Component types that implement the "DataConsumer" need to do this
         */
        useEffect(() => {
            return () => {
                componentsManager.removeComponent(id);
            };
        }, [componentsManager, id]);

        /**
         * This useLayoutEffect is used for creating the Gauge charts when the UI is ready.
         */
        useLayoutEffect(() => {
            const chartRoots: Root[] = [];

            if (metricValues !== undefined && entityClass !== undefined) {
                (metricsInfo.numericMetricsInfo ?? []).forEach((metricInfo, metricIndex) => {
                    if (metricInfo.viewSettings?.hidden === true) {
                        return;
                    }

                    // Get the data point value for the metric info
                    const { metricValue } = metricValues[metricInfo.id] ?? { metricValue: undefined };
                    const value = typeof metricValue === 'number' ? metricValue : undefined;

                    const chartElementId = `${id}-${metricInfo.id}-${metricIndex}`;

                    const chartRoot = createAndInitializeAmchartsRoot({
                        root: Root.new(chartElementId),
                        id: chartElementId,
                        language: userLanguage,
                        theme,
                        dateFormat: CHART_FULL_DATE_FORMAT,
                    });

                    chartRoots.push(chartRoot);
                    createGaugeChart({
                        customSettings,
                        value,
                        numericMetricInfo: metricInfo.metricDefinition,
                        extNumericMetricInfo: metricInfo,
                        id: chartElementId,
                        root: chartRoot,
                        theme: theme,
                    });
                });
            }

            return () => {
                chartRoots.forEach((chartRoot) => {
                    chartRoot.dispose();
                });
            };
        }, [customSettings, entityClass, id, metricValues, metricsInfo.numericMetricsInfo, theme, userLanguage]);

        if (data === undefined && !canViewEntityMetrics) {
            return <GenericMessageBox messageVariant="body2" message={trans('common.generic_no_permission.message')} />;
        }

        if (metricValues === undefined) {
            return <LoadingComponent />;
        }

        return (
            <StyledGaugeWidget.Root className={className} style={style} sx={combinedStyle}>
                <Grid container spacing={customSettings.layoutSettings?.gridSpacing ?? COMPONENTS_SPACING}>
                    {(metricsInfo.numericMetricsInfo ?? []).map((metricInfo, metricIndex) => {
                        if (metricInfo.viewSettings?.hidden === true) {
                            return <Fragment key={`${metricInfo.id}-${metricIndex}`}></Fragment>;
                        }

                        const globalMetricViewSettings = customSettings.globalNumericMetricsViewSettings;

                        const metricsDefinition = metricInfo.metricDefinition;

                        // Get the Icon to be displayed based on the viewSettings
                        const icon = metricInfo.viewSettings?.icon ?? globalMetricViewSettings?.icon;

                        // Get the metric's display name based on the metrics definition and customSettings
                        const displayName = getMetricDisplayName(metricsDefinition, metricInfo, false, trans, {
                            entity,
                            entityClass,
                        });

                        // Get the metric's display unit based on the viewSettings
                        const displayUnit = getMetricDisplayUnit(metricsDefinition, metricInfo, globalMetricViewSettings, trans, {
                            entity,
                            entityClass,
                        });

                        // Get the default value to be displayed based on the settings
                        const displayDefaultValue = getMetricDisplayDefaultValue(metricInfo, globalMetricViewSettings, trans, {
                            entity,
                            entityClass,
                        });

                        // Get the metricValue from the dataPoint and format it based on the decimalPlaces settings if it is a number
                        const { timestamp, metricValue } = metricValues[metricInfo.id] ?? {
                            timestamp: undefined,
                            metricValue: undefined,
                        };
                        const formattedMetricValue = (() => {
                            if (typeof metricValue === 'number') {
                                const metricSettings = metricInfo.viewSettings;
                                const decimalPlacesSetting = metricSettings?.decimalPlaces ?? globalMetricViewSettings?.decimalPlaces;
                                const trimTrailingZeros = decimalPlacesSetting === undefined ? true : metricSettings?.trimTrailingZeros === true;
                                return getNumberFormatter(decimalPlacesSetting ?? DEFAULT_DECIMAL_PLACES, trimTrailingZeros).format(metricValue);
                            }

                            return undefined;
                        })();

                        // Try to use the "displayValueMapping"  to see if there is a mapping that set up for this metricValue.
                        // If there is, use the displayValue from the "displayValueMapping" settings.
                        const mappedMetricValue = (() => {
                            if (metricValue !== undefined) {
                                // Now get the "displayValueMapping" we will use to find the mapping for the value. We will use the
                                // "displayValueMapping" set in the metric first, if it is not provided, use the one defined in globalMetricsSettings
                                // Else, use the one defined in metricsDefinition
                                const displayValueMapping =
                                    metricInfo.viewSettings?.displayValueMapping ?? globalMetricViewSettings?.displayValueMapping ?? [];

                                for (let i = 0; i < displayValueMapping.length; i += 1) {
                                    const mapping = displayValueMapping[i];
                                    if (mapping.value === metricValue) {
                                        return getTranslatedValue(mapping.displayValue, trans);
                                    }
                                }
                            }
                            return undefined;
                        })();

                        // Now we can get the final display value. If there is a mappedMetricValue then use it first, If not, use the
                        // formatted value is it is available. Else, use the default value. And last, show NO_VALUE
                        const displayValue = mappedMetricValue ?? formattedMetricValue ?? displayDefaultValue ?? NO_VALUE;

                        // We need to create an HTMLElement for Amcharts to draw charts on and we need to give it a unique ID.
                        // We will create 1 gauge chart for each metric.
                        const chartElementId = `${id}-${metricInfo.id}-${metricIndex}`;

                        return (
                            <Grid item key={`${metricInfo.id}-${metricIndex}`} xs={12} {...customSettings.layoutSettings?.gridSizes}>
                                <GaugeWidgetContainer
                                    sx={customSettings.containerStyle}
                                    icon={icon}
                                    title={displayName}
                                    containerType={customSettings.containerType}
                                    hideTitle={customSettings.hideTitle}
                                >
                                    <>
                                        <StyledGaugeWidget.GaugeChartContainer id={chartElementId} />
                                        <StyledGaugeWidget.StyledDataDisplay className="data">
                                            <StyledGaugeWidget.StyledValueAndUnitDisplay className="value-and-unit">
                                                <StyledGaugeWidget.StyledValueDisplay className="value">
                                                    {displayValue}
                                                </StyledGaugeWidget.StyledValueDisplay>
                                                {displayUnit && (
                                                    <StyledGaugeWidget.StyledUnitDisplay className="unit">
                                                        {displayUnit}
                                                    </StyledGaugeWidget.StyledUnitDisplay>
                                                )}
                                            </StyledGaugeWidget.StyledValueAndUnitDisplay>
                                            {timestamp && (
                                                <StyledGaugeWidget.StyledDateDisplay className="date">
                                                    {formatDate(timestamp, userLanguage)}
                                                </StyledGaugeWidget.StyledDateDisplay>
                                            )}
                                        </StyledGaugeWidget.StyledDataDisplay>
                                    </>
                                </GaugeWidgetContainer>
                            </Grid>
                        );
                    })}
                </Grid>
            </StyledGaugeWidget.Root>
        );
    }
);
GaugeWidget.displayName = 'GaugeWidget';
