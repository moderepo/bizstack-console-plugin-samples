import React, { useCallback, useImperativeHandle, useMemo } from 'react';
import { GenericMessageBox } from '@moderepo/bizstack-console-sdk';
import {
    BaseDataConsumerContext,
    DataConsumer,
    DataConsumerRequestResponse,
    DataConsumerRequests,
    EntityViewCompProps,
    GenericEntityViewCompSettings,
    TypeNotReady,
} from '@moderepo/bizstack-console-sdk';
import { SampleMetricDataWidgetCustomSettings, createInitialSampleMetricDataWidgetCustomSettings } from './models';

export interface SampleMetricDataWidgetProps extends EntityViewCompProps {
    readonly compSettings: GenericEntityViewCompSettings<SampleMetricDataWidgetCustomSettings>;
}

/**
 * This sample shows how to create widget settings for widgets that fetch metric data.
 */
export const SampleMetricDataWidget = React.forwardRef<DataConsumer<BaseDataConsumerContext>, SampleMetricDataWidgetProps>(
    ({ id, compSettings }, ref) => {
        const customSettings = useMemo(() => {
            return compSettings.customSettings ?? createInitialSampleMetricDataWidgetCustomSettings();
        }, [compSettings.customSettings]);

        /**
         * Helper function to create data request objects
         */
        const getDataRequestsHandler = useCallback((): DataConsumerRequests<BaseDataConsumerContext> | TypeNotReady | undefined => {
            // See TemperatureWidget for information on how to make data requests. You can make data requests using the dataSourcesSettings.
            console.log(customSettings.dataSourcesSettings[0]?.numericMetrics);
            return undefined;
        }, [customSettings.dataSourcesSettings]);

        /**
         * Helper function to handle data request response
         */
        const onDataReadyHandler = useCallback((dataRequestResponses: DataConsumerRequestResponse<BaseDataConsumerContext>) => {
            // See TemperatureWidget for information on how to handle the response data for requests.
            console.log(dataRequestResponses);
        }, []);

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
        }, [getDataRequestsHandler, id, onDataReadyHandler]);

        return <GenericMessageBox message={JSON.stringify(compSettings.customSettings, null, 2)} />;
    }
);
SampleMetricDataWidget.displayName = 'SampleMetricDataWidget';
