import {
    BaseEntityViewCompCustomSettingsSchema,
    DEFAULT_WIDGET_MAIN_SETTING_TABS,
    DEFAULT_WIDGET_STYLE_SETTING_TABS,
    CUSTOM_SETTINGS_STYLE_PARAM,
    CUSTOM_SETTINGS_ENTITY_ID_PARAM,
    CUSTOM_SETTINGS_METRICS_DATA_SOURCES_SETTINGS_PARAM,
    CUSTOM_SETTINGS_DATA_SOURCE_METRICS_DEFINITION_ID_PARAM,
    CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_METRICS_PARAM,
    CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_METRIC_VALUE_NAME_PARAM,
    CUSTOM_SETTINGS_CUSTOM_TIME_CONTROL_PARAM,
} from '@moderepo/bizstack-console-sdk';

/**
 * This is an example schema to show all generic data source parameters, but it won't be practical.
 */
// export const sampleMetricDataWidgetCustomSettingsSchema: BaseEntityViewCompCustomSettingsSchema = {
//     tabs: [
//         {
//             ...DEFAULT_WIDGET_MAIN_SETTING_TABS,
//             params: [CUSTOM_SETTINGS_ENTITY_ID_PARAM, CUSTOM_SETTINGS_METRICS_DATA_SOURCES_SETTINGS_PARAM],
//         },
//         {
//             ...DEFAULT_WIDGET_STYLE_SETTING_TABS,
//             params: [CUSTOM_SETTINGS_STYLE_PARAM],
//         },
//     ],
// };

/**
 * This example shows how to utilize the generic custom settings params.
 * The generic custom settings has a lot of params by default. Pick only the necessary parameters for the widget.
 * The example below defines a schema to allow users to select multiple numeric metrics (without tag metrics).
 */
// export const sampleMetricDataWidgetCustomSettingsSchema: BaseEntityViewCompCustomSettingsSchema = {
//     tabs: [
//         {
//             ...DEFAULT_WIDGET_MAIN_SETTING_TABS,
//             params: [
//                 {
//                     ...CUSTOM_SETTINGS_ENTITY_ID_PARAM,
//                     // Allow users to select an Entity with metrics
//                     entityConstraints: {
//                         hasMetrics: true,
//                     },
//                 },
//                 {
//                     ...CUSTOM_SETTINGS_METRICS_DATA_SOURCES_SETTINGS_PARAM,
//                     params: [
//                         CUSTOM_SETTINGS_DATA_SOURCE_METRICS_DEFINITION_ID_PARAM,
//                         {
//                             ...CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_METRICS_PARAM,
//                             params: [
//                                 CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_METRIC_VALUE_NAME_PARAM,
//                                 // CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_METRIC_VIEW_SETTINGS_PARAM
//                             ],
//                         },
//                         // CUSTOM_SETTINGS_DATA_SOURCE_TAG_METRICS_PARAM, // No need for tag metrics params
//                         // CUSTOM_SETTINGS_DATA_SOURCE_AGGREGATION_PARAM, // No need for aggregation options
//                     ],
//                 },
//             ],
//         },
//         {
//             ...DEFAULT_WIDGET_STYLE_SETTING_TABS,
//             params: [CUSTOM_SETTINGS_STYLE_PARAM],
//         },
//     ],
// };

/**
 * This example shows how to utilize the generic custom settings.
 * The generic settings has a lot of params by default. Pick only the necessary parameters for the widget.
 * Some options, such as `maxSize` and `viewSettings` are also available.
 * As an example, this defines a schema to allow users to select a numeric metric.
 */
export const sampleMetricDataWidgetCustomSettingsSchema: BaseEntityViewCompCustomSettingsSchema = {
    tabs: [
        {
            ...DEFAULT_WIDGET_MAIN_SETTING_TABS,
            params: [
                {
                    ...CUSTOM_SETTINGS_ENTITY_ID_PARAM,
                    // Allow users to select an Entity with metrics
                    entityConstraints: {
                        hasMetrics: true,
                    },
                } satisfies typeof CUSTOM_SETTINGS_ENTITY_ID_PARAM,
                {
                    ...CUSTOM_SETTINGS_METRICS_DATA_SOURCES_SETTINGS_PARAM,
                    // Set maxSize to limit the number of data sources (users can set up only 1 data source)
                    maxSize: 1,
                    params: [
                        CUSTOM_SETTINGS_DATA_SOURCE_METRICS_DEFINITION_ID_PARAM,
                        {
                            ...CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_METRICS_PARAM,
                            // Set maxSize to limit the number of metrics (users can select only 1 metric)
                            maxSize: 1,
                            // Hide the header of "Numeric Metrics"
                            viewSettings: {
                                hideHeader: true,
                                condensed: true,
                            },
                            params: [
                                CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_METRIC_VALUE_NAME_PARAM,
                                // CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_METRIC_VIEW_SETTINGS_PARAM
                            ],
                        } satisfies typeof CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_METRICS_PARAM,
                        // CUSTOM_SETTINGS_DATA_SOURCE_TAG_METRICS_PARAM, // No need for tag metrics params
                        // CUSTOM_SETTINGS_DATA_SOURCE_AGGREGATION_PARAM, // No need for aggregation options
                    ],
                } satisfies typeof CUSTOM_SETTINGS_METRICS_DATA_SOURCES_SETTINGS_PARAM,
                CUSTOM_SETTINGS_CUSTOM_TIME_CONTROL_PARAM
            ],
        },
        {
            ...DEFAULT_WIDGET_STYLE_SETTING_TABS,
            params: [CUSTOM_SETTINGS_STYLE_PARAM],
        } satisfies typeof DEFAULT_WIDGET_STYLE_SETTING_TABS,
    ],
};
