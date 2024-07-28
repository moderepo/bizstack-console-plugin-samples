// The file is where we place helper/util functions, constants, etc...

import {
    APIError,
    CustomDataRequest,
    CustomDataRequestData,
    CustomDataRequestParams,
    DataSourceType,
    ExternalAPI,
    RequestMethod,
} from '@moderepo/bizstack-console-sdk';

export const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast?latitude={{LATITUDE}}&longitude={{LONGITUDE}}&current={{METRIC_NAME}}';

export interface WeatherWidgetRequestParams extends CustomDataRequestParams {
    readonly lng: number;
    readonly lat: number;
    readonly metricName: string;
}

export interface WeatherWidgetRequestData extends CustomDataRequestData {
    readonly value: number;
}

/**
 * Helper function to create A custom request object that can handle loading weather data. This object MUST implement the Dashboard's
 * CustomDataRequest model so that it can be used by the dashboard system.
 */
export const createWeatherDataRequests = (
    projectId: number,
    metricName: string,
    lng: number,
    lat: number
): readonly CustomDataRequest<WeatherWidgetRequestParams, WeatherWidgetRequestData>[] => {
    return [
        {
            dataSourceType: DataSourceType.CUSTOM,
            projectId,
            requestParams: {
                lng: lng,
                lat: lat,
                metricName: metricName,
            },
            makeRequest: async (params: WeatherWidgetRequestParams): Promise<WeatherWidgetRequestData | APIError> => {
                const response = await ExternalAPI.getInstance().sendRequest(
                    RequestMethod.GET,
                    WEATHER_API_URL.replace('{{LONGITUDE}}', params.lng.toString())
                        .replace('{{LATITUDE}}', params.lat.toString())
                        .replace('{{METRIC_NAME}}', params.metricName)
                );
                if (response instanceof APIError) {
                    return response;
                }

                const metricValue = response.data.current[params.metricName];
                if (typeof metricValue === 'number') {
                    return {
                        value: metricValue,
                    };
                }
                return new APIError('Invalid value', 500);
            },
        },
    ];
};
