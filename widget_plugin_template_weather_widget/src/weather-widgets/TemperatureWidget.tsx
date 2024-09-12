import React, { useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { CircularProgress } from '@mui/material';
import * as StyledWeatherWidget from './styled';
import {
    APIError,
    BaseDataConsumerContext,
    CustomDataRequestResponse,
    DataConsumer,
    DataConsumerRequestResponse,
    DataConsumerRequests,
    EntityViewCompProps,
    FETCHING_DATA_STATUS,
    FetchingData,
    GenericEntityViewCompSettings,
    NotReady,
    processOneComponentDataRequests,
    TypeNotReady,
} from '@moderepo/bizstack-console-sdk';
import { TEMPERATURE_UNIT, TemperatureWidgetCustomSettings, createInitialTemperatureWidgetCustomSettings } from './models';
import { createWeatherDataRequests, WeatherWidgetRequestData, WeatherWidgetRequestParams } from './utils';

export interface TemperatureWidgetProps extends EntityViewCompProps {
    readonly compSettings: GenericEntityViewCompSettings<TemperatureWidgetCustomSettings>;
}

export const TemperatureWidget = React.forwardRef<DataConsumer<BaseDataConsumerContext>, TemperatureWidgetProps>(
    ({ className, style, sx, id, projectId, compSettings }, ref) => {
        const customSettings = useMemo(() => {
            return compSettings.customSettings ?? createInitialTemperatureWidgetCustomSettings();
        }, [compSettings.customSettings]);

        // Combine the component's style created by the parent container with the "style" from customSettings. The styles from "customSettings"
        // takes precedent
        const combinedStyle = useMemo(() => {
            return {
                ...sx,
                ...customSettings.style,
            };
        }, [customSettings.style, sx]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [temperature, setTemperature] = useState<number | FetchingData | undefined>(FETCHING_DATA_STATUS);

        /**
         * Helper function to create data request objects
         */
        const getDataRequestsHandler = useCallback((): DataConsumerRequests<BaseDataConsumerContext> | TypeNotReady | undefined => {
            return {
                requests: createWeatherDataRequests(projectId, 'temperature_2m', customSettings.location.lng, customSettings.location.lat),
                context: {},
            };
        }, [customSettings.location.lat, customSettings.location.lng, projectId]);

        /**
         * Helper function to handle data request response
         */
        const onDataReadyHandler = useCallback(
            (dataRequestResponses: DataConsumerRequestResponse<BaseDataConsumerContext>) => {
                if (dataRequestResponses.responses.length > 0) {
                    const data = (
                        dataRequestResponses.responses[0] as CustomDataRequestResponse<WeatherWidgetRequestParams, WeatherWidgetRequestData>
                    ).data;

                    if (!(data instanceof APIError)) {
                        const value = data.value;
                        if (customSettings.unit === TEMPERATURE_UNIT.FAHRENHEIT) {
                            // temperature value is in Celsius so if the unit is set to Fahrenheit, we need to convert it
                            setTemperature((value * 9) / 5 + 32);
                        } else {
                            setTemperature(value);
                        }
                        return;
                    }
                    setTemperature(undefined);
                }
            },
            [customSettings.unit]
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

                /**
                 * NOTE: When the dashboard manager calls this function, `getDataRequest`, it will pass 2 parameters to the function
                 * `getDataRequests (timeParams: TimeRangeParams | undefined, selectionRange: TimeRangeParams | undefined)`. It is up to the widget
                 * implementation to do what it needs to do with these params. Some widget ignore these params and some widgets use these params to
                 * fetch data.
                 *   - timeParams is an Object with start/end timestamps of the selected time range from the global time control. The widget can
                 *     use this time range to fetch data for.
                 *   - selectionRange is also an Object with start/end timestamps. However, the selectionRange is a sub range of the timeRange. This
                 *     range is based on the range the user selected from one of the widgets. For example, the XY Chart allows the user to select
                 *     an area to Zoom in. When the user does this, the selectionRange will be the time range of the area the user selected. It is up to
                 *     the widget implementation to use this info to fetch detailed data for the selection range if it needs to.
                 */
                getDataRequests: getDataRequestsHandler,
                onDataReady: onDataReadyHandler,
            };
        }, [getDataRequestsHandler, id, onDataReadyHandler]);

        useEffect(() => {
            if (temperature === FETCHING_DATA_STATUS || temperature === undefined) {
                const dataRequests = getDataRequestsHandler();
                if (dataRequests === undefined || dataRequests === NotReady) {
                    return;
                }

                processOneComponentDataRequests({
                    componentId: id,
                    requestsInfo: dataRequests,
                }).then((comRequestResponse) => {
                    onDataReadyHandler(comRequestResponse.responsesInfo);
                });
            }
        }, [compSettings, getDataRequestsHandler, id, onDataReadyHandler, temperature]);

        if (temperature === FETCHING_DATA_STATUS) {
            return <CircularProgress />;
        }

        return (
            <StyledWeatherWidget.Root id={id} className={className} style={style} sx={combinedStyle}>
                <StyledWeatherWidget.Title>{customSettings.title}</StyledWeatherWidget.Title>
                <StyledWeatherWidget.Value>
                    {temperature !== undefined ? (
                        <>
                            {temperature.toFixed(1)}°{customSettings.unit ?? TEMPERATURE_UNIT.CELSIUS}
                        </>
                    ) : (
                        <>Unknown</>
                    )}
                </StyledWeatherWidget.Value>
            </StyledWeatherWidget.Root>
        );
    }
);
TemperatureWidget.displayName = 'TemperatureWidget';
