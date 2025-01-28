/* eslint-disable indent */
/* eslint-disable @typescript-eslint/indent */
import React, { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
    BaseDataConsumerContext,
    DataConsumer,
    DataConsumerRequests,
    EntityViewCompProps,
    GenericEntityViewCompSettings,
    GenericMessageBox,
    isDataStateValue,
    LoadingComponent,
    MainResourceType,
    NotReady,
    SubResourceType,
    TimeRangeParams,
    TypeNotReady,
    useSelectTranslatedEntityClasses,
    useUserLanguage,
    getTimeRangeFromTimeParams,
    createEntityMetricsDataRequests,
    MultiMetricsDataPoint,
    processAndCombineEntityMetricsDataResponse,
    useCombinedExtMetricsInfo,
    useCustomSettingsWithEntityUISettingsBasedMetricsViewSettingsOverride,
    CHART_FULL_DATE_FORMAT,
    useTranslation,
    createAndInitializeAmchartsRoot,
    useFetchRequiredEntitiesForMetricsDataSources,
    EntityViewStandaloneCompProps,
    useAuthenticationStore,
    hasReadPermission,
    Mutable,
    CHART_SELECTION_CHANGE_EVENT_DELAY_IN_MS,
    AggregationType,
    DataConsumerRequestResponse,
    getMetricsThatNeedToIncludeEntityName,
    processOneComponentDataRequests,
    isTimeRangeParams,
} from '@moderepo/bizstack-console-sdk';
import { debounce, useTheme } from '@mui/material';
import { Root } from '@amcharts/amcharts5';
import { createInitialXYChartWidgetCustomSettings, isXYChartWidgetCustomSettings, XYChartWidgetCustomSettings } from './models';
import { createXYChartWidgetChart } from './utils';
import * as StyledXYChartWidget from './styled';

/**
 * When this component create data requests to fetch data for a time range, it needs to remember the time range that was being used so
 * that when it gets the response from the data request manager, it can use this info to adjust the chart. Therefore, when this
 * component create a data requests, it will attached this context with the request.
 */
interface XYChartWidgetDataConsumerContext extends BaseDataConsumerContext {
    readonly timeRange: TimeRangeParams;
    readonly selectionRange: TimeRangeParams | undefined;
}

export interface XYChartWidgetProps extends EntityViewCompProps, EntityViewStandaloneCompProps {
    readonly compSettings: GenericEntityViewCompSettings<XYChartWidgetCustomSettings>;
}

export const XYChartWidget = React.forwardRef<DataConsumer<XYChartWidgetDataConsumerContext>, XYChartWidgetProps>(
    (
        {
            className,
            style,
            sx,
            id,
            componentsManager,
            projectId,
            entityId,
            compSettings,
            onSelectionRangeChange,
            isStandalone,
            timeParams,
            selectionRange,
        },
        ref
    ) => {
        const { t: trans } = useTranslation();
        const isLoadingData = useRef(false);

        const customSettings = useCustomSettingsWithEntityUISettingsBasedMetricsViewSettingsOverride(
            projectId,
            entityId,
            XYChartWidget.displayName,
            compSettings.customSettings ?? createInitialXYChartWidgetCustomSettings(),
            isXYChartWidgetCustomSettings
        );

        const theme = useTheme();
        const userLanguage = useUserLanguage();
        const entityClasses = useSelectTranslatedEntityClasses(projectId, userLanguage);

        // Get the user's resources permissions and use that to check if the user can view the entity's metrics
        const userResourcesPermissions = useAuthenticationStore((store) => {
            return store.userResourcesPermissions;
        });

        const canViewEntityMetrics = useMemo(() => {
            return hasReadPermission(MainResourceType.ENTITY, SubResourceType.ENTITY_METRIC, entityId, userResourcesPermissions);
        }, [entityId, userResourcesPermissions]);

        // Combine the component's style created by the parent container with the "style" from customSettings. The styles from "customSettings"
        // takes precedent
        const combinedStyle = useMemo(() => {
            return {
                ...sx,
                ...customSettings.style,
            };
        }, [customSettings.style, sx]);

        // Get all the entities required for this widget based on the dataSourcesSettings
        const dataSourcesAndTargetEntitiesPairs = useFetchRequiredEntitiesForMetricsDataSources(
            projectId,
            entityId,
            customSettings.dataSourcesSettings,
            entityClasses
        );

        /**
         * The data fetched from the back end and other information about the metrics.
         */
        const [data, setData] = useState<{
            readonly dataPoints: Array<MultiMetricsDataPoint<string | number>>;
            readonly timeRange: TimeRangeParams;
            readonly selectionRange: TimeRangeParams | undefined;
        }>();

        // We need to check if there is data in a few places so will do it here once and reuse it
        const hasData = useMemo(() => {
            return data?.dataPoints !== undefined && (data.dataPoints.length > 0 || data.selectionRange !== undefined);
        }, [data]);

        // A temp variable to store the current horizontal zoom interval before we pass it to the view manager to propagate it to the other widgets
        const horSelectionRange = useRef<Mutable<TimeRangeParams>>();

        // A temp variable to store the current vertical zoom interval. For vertical range, we don't need to make API call. And the value we will
        // store will be in % relative to the global range. Different series can have different value range, units, etc... therefore, we can't
        // store the actual value's range. We just store the amount in %.
        const vertSelectionRange = useRef<{
            min: number;
            max: number;
        }>();

        /* ----------------------------------------------------------------    FUNCTIONS    ------------------------------------------------------ */
        /**
         * When the user enter new keywords in the input field, the parent container will need to make an API call to fetch objects
         * based on the new keywords. HOWEVER, we don't want to make API call as soon as the user enter each character. We can delay
         * this until the user stopped typing for some milliseconds.
         */
        const debouncedApplyHorSelectionRangeChange = useMemo(() => {
            return debounce(() => {
                if (onSelectionRangeChange) {
                    onSelectionRangeChange(id, entityId, horSelectionRange.current);
                }

                // We can clear the selection once it is used
                horSelectionRange.current = undefined;
            }, CHART_SELECTION_CHANGE_EVENT_DELAY_IN_MS);
        }, [entityId, id, onSelectionRangeChange]);

        const onHorizontalSelectionChange = useCallback(
            (start: number, end: number) => {
                horSelectionRange.current = {
                    start,
                    end,
                };

                // Don't notify the view manager yet, debounce it and notify the view manager later
                debouncedApplyHorSelectionRangeChange();
            },
            [debouncedApplyHorSelectionRangeChange]
        );

        /**
         * Handler for when the user zoomed vertically. We will just store the zoomed area so that we can pass it back to the chart when we create
         * the chart again later.
         */
        const onVerticalSelectionChange = useCallback((min: number, max: number) => {
            vertSelectionRange.current = {
                min,
                max,
            };
        }, []);

        // To keep track of the list of hidden metrics from clicking on the Legends so that we can continue keeping them hidden
        // when we have to re-create the chart because the data changed.
        const hiddenSeriesIds = useRef<readonly string[] | undefined>();
        const onMetricsVisibilityChange = useCallback((updatedHiddenSeriesIds: readonly string[] | undefined) => {
            hiddenSeriesIds.current = updatedHiddenSeriesIds;
        }, []);

        /* ------------------------------------------------------    DATA FETCHED FROM BACKEND    ------------------------------------------------- */

        // Get view-component-friendly metrics info
        const metricsInfo = useCombinedExtMetricsInfo(dataSourcesAndTargetEntitiesPairs, entityClasses);

        /**
         * A helper function to create data request object to be passed to the dashboard manager. The manager will make API call to fetch
         * data for this component based on the request object
         */
        const getDataRequestsHandler = useCallback(
            (
                timeParams?: TimeRangeParams,
                selectionRange?: TimeRangeParams
            ): DataConsumerRequests<XYChartWidgetDataConsumerContext> | TypeNotReady | undefined => {
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
                        selectionRange ?? timeRange,
                        undefined,
                        {
                            aggregation: AggregationType.AVG,
                        }
                    ),
                    context: {
                        timeRange,
                        selectionRange,
                    },
                };
            },
            [canViewEntityMetrics, dataSourcesAndTargetEntitiesPairs, entityClasses, projectId]
        );

        /**
         * Helper function to handle the response from the dashboard manager when the data request is completed
         */
        const onDataReadyHandler = useCallback(
            (dataRequestResponses: DataConsumerRequestResponse<XYChartWidgetDataConsumerContext>) => {
                isLoadingData.current = false;

                if (!isDataStateValue(dataSourcesAndTargetEntitiesPairs)) {
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
            [dataSourcesAndTargetEntitiesPairs]
        );

        /**
         * This is how a DataConsumer component implement the DataConsumer interfaces. It needs to implement the functions defined
         * in the DataConsumer interface. The data request handler will call these functions to communicate with the component.
         */
        useImperativeHandle(ref, () => {
            return {
                getId: () => {
                    return id;
                },

                getDataRequests: getDataRequestsHandler,
                onDataReady: onDataReadyHandler,
            };
        }, [getDataRequestsHandler, onDataReadyHandler, id]);

        /**
         * This useEffect will trigger the component to load data if the component is being used as standalone component
         */
        useEffect(() => {
            if (isStandalone && !isLoadingData.current) {
                const dataRequests = getDataRequestsHandler(
                    isTimeRangeParams(timeParams) ? timeParams : undefined,
                    isTimeRangeParams(selectionRange) ? selectionRange : undefined
                );
                if (dataRequests === undefined || dataRequests === NotReady) {
                    return;
                }

                processOneComponentDataRequests({
                    componentId: id,
                    requestsInfo: dataRequests,
                }).then((comRequestResponse) => {
                    onDataReadyHandler(comRequestResponse.responsesInfo as unknown as DataConsumerRequestResponse<XYChartWidgetDataConsumerContext>);
                });
            }
        }, [getDataRequestsHandler, id, onDataReadyHandler, selectionRange, isStandalone, timeParams]);

        useLayoutEffect(() => {
            let chartRoot: Root | undefined;

            if (data?.dataPoints && hasData) {
                const metricsThatNeedToIncludeEntityName = getMetricsThatNeedToIncludeEntityName(metricsInfo, trans);

                chartRoot = createAndInitializeAmchartsRoot({ id, language: userLanguage, theme, dateFormat: CHART_FULL_DATE_FORMAT });
                const chart = createXYChartWidgetChart({
                    id,
                    root: chartRoot,
                    customSettings,
                    dataPoints: data.dataPoints,
                    extNumericMetricsInfo: metricsInfo.numericMetricsInfo,
                    timeRange: data.timeRange,
                    horizontalSelectionRange: data.selectionRange,
                    verticalSelectionRange: vertSelectionRange.current,
                    trans,
                    theme,
                    locale: userLanguage.locale,
                    metricsThatNeedToIncludeEntityName,
                    hiddenSeriesIds: hiddenSeriesIds.current,
                    onHorizontalSelectionChange,
                    onVerticalSelectionChange,
                    onMetricsVisibilityChange,
                });
                chart.appear();
            }

            return () => {
                if (chartRoot !== undefined) {
                    chartRoot.dispose();
                }
            };
        }, [
            userLanguage,
            customSettings,
            data,
            hasData,
            id,
            metricsInfo.numericMetricsInfo,
            onHorizontalSelectionChange,
            onVerticalSelectionChange,
            theme,
            trans,
            onMetricsVisibilityChange,
            metricsInfo,
        ]);

        /**
         * This useEffect monitors the component's "compSettings" change event and call the EntityViewComponentsManager to reload
         * data for this component but only when the user is in edit mode
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

        return (
            <StyledXYChartWidget.Root id={id} className={className} style={style} sx={combinedStyle}>
                {(data === undefined || !hasData) && (
                    <StyledXYChartWidget.NoDataContainer>
                        {data === undefined &&
                            (canViewEntityMetrics ? (
                                <LoadingComponent />
                            ) : (
                                /* If data is undefined because the user can't view the entity's metrics then show access defined message */
                                <GenericMessageBox title={trans('common.generic_no_permission.message')} />
                            ))}
                        {data?.dataPoints.length === 0 && (
                            <GenericMessageBox title={trans('common.generic_no_data.message', { term: trans('common.data') })} />
                        )}
                    </StyledXYChartWidget.NoDataContainer>
                )}
            </StyledXYChartWidget.Root>
        );
    }
);
XYChartWidget.displayName = 'XYChartWidget';
