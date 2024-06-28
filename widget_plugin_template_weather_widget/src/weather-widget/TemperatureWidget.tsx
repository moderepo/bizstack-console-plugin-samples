/* eslint-disable indent */
/* eslint-disable @typescript-eslint/indent */
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { CircularProgress } from '@mui/material';
import * as StyledWeatherWidget from './styled';
import {
    APIError,
    DataConsumer,
    DataConsumerRequests,
    EntityViewCompProps,
    ExternalAPI,
    FETCHING_DATA_STATUS,
    FetchingData,
    GenericEntityViewCompSettings,
    RequestMethod,
    TypeNotReady,
} from '@moderepo/bizstack-console-sdk';
import { TEMPERATURE_UNIT, TemperatureWidgetCustomSettings, createInitialTemperatureWidgetCustomSettings } from './models';
import { TEMPERATURE_API_URL } from './utils';

export interface TemperatureWidgetProps extends EntityViewCompProps {
    readonly compSettings: GenericEntityViewCompSettings<TemperatureWidgetCustomSettings>;
}

export const TemperatureWidget = React.forwardRef<DataConsumer, TemperatureWidgetProps>(({ className, style, sx, id, compSettings }, ref) => {
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

    const loadData = useCallback(async () => {
        const response = await ExternalAPI.getInstance().sendRequest(
            RequestMethod.GET,
            TEMPERATURE_API_URL.replace('{{LONGITUDE}}', customSettings.location.lng.toString()).replace(
                '{{LATITUDE}}',
                customSettings.location.lat.toString()
            )
        );
        if (!(response instanceof APIError)) {
            const temperature = response.data.current.temperature_2m;
            if (typeof temperature === 'number') {
                if (customSettings.unit === TEMPERATURE_UNIT.FAHRENHEIT) {
                    // temperature value is in Celsius so if the unit is set to Fahrenheit, we need to convert it
                    setTemperature((temperature * 9) / 5 + 32);
                } else {
                    setTemperature(temperature);
                }
            } else {
                setTemperature(undefined);
            }
        }
    }, [customSettings.location.lat, customSettings.location.lng, customSettings.unit]);

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
            getDataRequests: (): DataConsumerRequests | TypeNotReady | undefined => {
                loadData();
                return undefined;
            },

            onDataReady: () => {},
        };
    }, [id, loadData]);

    useEffect(() => {
        if (temperature === FETCHING_DATA_STATUS || temperature === undefined) {
            loadData();
        }
    }, [loadData, temperature]);

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
});
TemperatureWidget.displayName = 'TemperatureWidget';
