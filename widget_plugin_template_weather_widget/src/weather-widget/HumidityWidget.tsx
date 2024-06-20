/* eslint-disable indent */
/* eslint-disable @typescript-eslint/indent */
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { CircularProgress } from '@mui/material';
import * as StyledWeatherWidget from './styled';
import {
    APIError,
    DataConsumer,
    DataConsumerRequests,
    EntityViewComp,
    ExternalAPI,
    FETCHING_DATA_STATUS,
    FetchingData,
    GenericEntityViewCompSettings,
    RequestMethod,
    TypeNotReady,
} from '@moderepo/biz-console';
import { HumidityWidgetCustomSettings, createInitialHumidityWidgetCustomSettings } from './models';
import { HUMIDITY_API_URL } from './utils';

export interface HumidityWidgetProps extends EntityViewComp {
    readonly compSettings: GenericEntityViewCompSettings<HumidityWidgetCustomSettings>;
}

export const HumidityWidget = React.forwardRef<DataConsumer, HumidityWidgetProps>(({ className, style, sx, id, compSettings }, ref) => {
    const customSettings = useMemo(() => {
        return compSettings.customSettings ?? createInitialHumidityWidgetCustomSettings();
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
    const [humidity, setHumidity] = useState<number | FetchingData | undefined>(FETCHING_DATA_STATUS);

    const loadData = useCallback(async () => {
        const response = await ExternalAPI.getInstance().sendRequest(
            RequestMethod.GET,
            HUMIDITY_API_URL.replace('{{LONGITUDE}}', customSettings.location.lng.toString()).replace(
                '{{LATITUDE}}',
                customSettings.location.lat.toString()
            )
        );
        if (!(response instanceof APIError)) {
            const humidity = response.data.current.relative_humidity_2m;
            if (typeof humidity === 'number') {
                setHumidity(humidity);
            } else {
                setHumidity(undefined);
            }
        }
    }, [customSettings.location.lat, customSettings.location.lng]);

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
        if (humidity === FETCHING_DATA_STATUS || humidity === undefined) {
            loadData();
        }
    }, [loadData, humidity]);

    if (humidity === FETCHING_DATA_STATUS) {
        return <CircularProgress />;
    }

    return (
        <StyledWeatherWidget.Root id={id} className={className} style={style} sx={combinedStyle}>
            <StyledWeatherWidget.Title>{customSettings.title}</StyledWeatherWidget.Title>
            <StyledWeatherWidget.Value>{humidity !== undefined ? <>{humidity.toFixed(1)}%</> : <>Unknown</>}</StyledWeatherWidget.Value>
        </StyledWeatherWidget.Root>
    );
});
HumidityWidget.displayName = 'HumidityWidget';
