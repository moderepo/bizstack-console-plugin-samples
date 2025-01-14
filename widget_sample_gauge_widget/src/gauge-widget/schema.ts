import {
    BaseEntityViewCompCustomSettingsSchema,
    DEFAULT_WIDGET_MAIN_SETTING_TABS,
    EntityCustomSettingParamType,
    EntityViewCustomSettingsParamType,
    DEFAULT_WIDGET_STYLE_SETTING_TABS,
    CUSTOM_SETTINGS_STYLE_PARAM,
    CUSTOM_SETTINGS_ENTITY_ID_PARAM,
    CUSTOM_SETTINGS_DATA_AGE_LIMIT_PARAM,
    CUSTOM_SETTINGS_WIDGET_VIEW_CONTAINER_TYPE_PARAM,
    CUSTOM_SETTINGS_HIDE_TITLE_PARAM,
    CUSTOM_SETTINGS_WIDGET_VIEW_CONTAINER_STYLE_PARAM,
    CUSTOM_SETTINGS_GRID_LAYOUT_SETTINGS,
    EntityViewCompCustomSettingsStructuredObjectParam,
    EntityViewCompCustomSettingsNumberParam,
    CUSTOM_SETTINGS_UNIT_PARAM_GROUP,
    CUSTOM_SETTINGS_DECIMAL_PARAM_GROUP,
    EntityViewCompCustomSettingsParamGroup,
    CUSTOM_SETTINGS_DEFAULT_VALUE_PARAM,
    CUSTOM_SETTINGS_ICON_SETTINGS,
    CUSTOM_SETTINGS_GLOBAL_NUMERIC_METRICS_VIEW_SETTINGS_PARAM,
    CUSTOM_SETTINGS_DATA_SOURCE_VALUE_TO_DISPLAY_PARAM,
    CUSTOM_SETTINGS_DATA_SOURCE_CUSTOM_DATA_SOURCE_CONFIGURATION_PARAM,
    CUSTOM_SETTINGS_DATA_SOURCE_METRICS_DEFINITION_ID_PARAM,
    CUSTOM_SETTINGS_METRICS_DATA_SOURCES_SETTINGS_PARAM,
    EntityViewCompCustomSettingsStructuredObjectArrayParam,
    CUSTOM_SETTINGS_METRIC_THRESHOLD_COLOR_MAPPING_PARAM,
    CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_VALUE_RANGE_PARAM,
    CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_VALUE_DISABLE_RANGE_PARAM_GROUP,
    METRICS_COMMON_CUSTOM_SETTINGS_VIEW_SETTINGS_THRESHOLDS_SETTINGS_PARAM,
    CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_METRIC_VALUE_NAME_PARAM,
    CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_METRICS_PARAM,
    CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_VALUE_HIDDEN_PARAM,
    CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_VALUE_DISPLAY_VALUE_MAPPING_PARAM,
    CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_VALUE_TRANSFORMATION_FORMULA_PARAM,
    CUSTOM_SETTINGS_DATA_SOURCE_VIEW_SETTINGS_DISPLAY_NAME_PARAM,
    CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_METRIC_VIEW_SETTINGS_PARAM,
} from '@moderepo/bizstack-console-sdk';
import { MAX_GAUGE_CHART_BAND_WIDTH, MIN_GAUGE_CHART_BAND_WIDTH } from './models';

// Override the CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_METRIC_VIEW_SETTINGS_PARAM
const gaugeDataSourceNumericMetricViewSettingsParam = {
    ...CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_METRIC_VIEW_SETTINGS_PARAM,
    params: [
        {
            paramType: EntityViewCustomSettingsParamType.PARAM_GROUP,
            name: 'group1',
            label: '',
            viewSettings: {
                paramsPerRow: 2,
                condensed: true,
                hideHeader: true,
            },
            params: [CUSTOM_SETTINGS_ICON_SETTINGS, CUSTOM_SETTINGS_DATA_SOURCE_VIEW_SETTINGS_DISPLAY_NAME_PARAM],
        } satisfies EntityViewCompCustomSettingsParamGroup,
        CUSTOM_SETTINGS_UNIT_PARAM_GROUP,
        CUSTOM_SETTINGS_DEFAULT_VALUE_PARAM,
        CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_VALUE_TRANSFORMATION_FORMULA_PARAM,
        CUSTOM_SETTINGS_DECIMAL_PARAM_GROUP,
        CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_VALUE_DISPLAY_VALUE_MAPPING_PARAM,
        CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_VALUE_HIDDEN_PARAM,
    ],
};

// Override the CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_METRICS_PARAM
const gaugeDataSourceNumericMetricsParam: EntityViewCompCustomSettingsStructuredObjectArrayParam = {
    ...CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_METRICS_PARAM,
    params: [
        CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_METRIC_VALUE_NAME_PARAM,
        {
            paramType: EntityViewCustomSettingsParamType.PARAM,
            type: EntityCustomSettingParamType.STRUCTURED_OBJECT,
            key: 'viewSettings',
            required: false,
            label: '',
            viewSettings: {
                hideHeader: true,
            },
            params: [CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_VALUE_RANGE_PARAM, CUSTOM_SETTINGS_DATA_SOURCE_NUMERIC_VALUE_DISABLE_RANGE_PARAM_GROUP],
        },
        METRICS_COMMON_CUSTOM_SETTINGS_VIEW_SETTINGS_THRESHOLDS_SETTINGS_PARAM,
        {
            paramType: EntityViewCustomSettingsParamType.PARAM,
            type: EntityCustomSettingParamType.STRUCTURED_OBJECT,
            key: 'viewSettings',
            required: false,
            label: '',
            viewSettings: {
                hideHeader: true,
            },
            params: [CUSTOM_SETTINGS_METRIC_THRESHOLD_COLOR_MAPPING_PARAM],
        },
        gaugeDataSourceNumericMetricViewSettingsParam,
    ],
};

// Override the CUSTOM_SETTINGS_METRICS_DATA_SOURCES_SETTINGS_PARAM
const gaugeDataSourcesSettingsParam: EntityViewCompCustomSettingsStructuredObjectArrayParam = {
    ...CUSTOM_SETTINGS_METRICS_DATA_SOURCES_SETTINGS_PARAM,
    params: [
        CUSTOM_SETTINGS_DATA_SOURCE_METRICS_DEFINITION_ID_PARAM,
        CUSTOM_SETTINGS_DATA_SOURCE_CUSTOM_DATA_SOURCE_CONFIGURATION_PARAM,
        CUSTOM_SETTINGS_DATA_SOURCE_VALUE_TO_DISPLAY_PARAM,
        gaugeDataSourceNumericMetricsParam,
    ],
};

// Override the CUSTOM_SETTINGS_GLOBAL_NUMERIC_METRICS_VIEW_SETTINGS_PARAM
const gaugeGlobalNumericMetricViewSettingsParam: EntityViewCompCustomSettingsStructuredObjectParam = {
    ...CUSTOM_SETTINGS_GLOBAL_NUMERIC_METRICS_VIEW_SETTINGS_PARAM,
    isAdvancedSettings: true,
    params: [
        {
            paramType: EntityViewCustomSettingsParamType.PARAM_GROUP,
            name: 'group1',
            label: '',
            viewSettings: {
                paramsPerRow: 2,
                condensed: true,
                hideHeader: true,
            },
            params: [CUSTOM_SETTINGS_ICON_SETTINGS, CUSTOM_SETTINGS_DEFAULT_VALUE_PARAM],
        } satisfies EntityViewCompCustomSettingsParamGroup,
        CUSTOM_SETTINGS_UNIT_PARAM_GROUP,
        CUSTOM_SETTINGS_DECIMAL_PARAM_GROUP,
    ],
};

const gaugeChartViewSettingsBandWidthParam: EntityViewCompCustomSettingsNumberParam = {
    paramType: EntityViewCustomSettingsParamType.PARAM,
    type: EntityCustomSettingParamType.NUMBER,
    key: 'bandWidth',
    required: false,
    minValue: MIN_GAUGE_CHART_BAND_WIDTH,
    maxValue: MAX_GAUGE_CHART_BAND_WIDTH,
    label: '{{entity.view_comp.latest_metrics_values_gauge.custom_settings.global_chart_view_settings.band_width.label}}',
    description: '{{entity.view_comp.latest_metrics_values_gauge.custom_settings.global_chart_view_settings.band_width.description}}',
    placeholder: '{{common.default}}',
};

const gaugeChartViewSettingsParams: EntityViewCompCustomSettingsStructuredObjectParam = {
    paramType: EntityViewCustomSettingsParamType.PARAM,
    type: EntityCustomSettingParamType.STRUCTURED_OBJECT,
    key: 'chartViewSettings',
    required: false,
    label: '{{entity.view_comp.latest_metrics_values_gauge.custom_settings.global_chart_view_settings.label}}',
    description: '{{entity.view_comp.latest_metrics_values_gauge.custom_settings.global_chart_view_settings.description}}',
    params: [gaugeChartViewSettingsBandWidthParam],
};

/**
 * Create the Schema for the gaugeWidgetCustomSettings so that the Dashboard can use it to build the UI for this widget settings.
 * There are already many schemas existed the can be reused without minor changes.
 */
export const gaugeWidgetCustomSettingsSchema: BaseEntityViewCompCustomSettingsSchema = {
    tabs: [
        {
            ...DEFAULT_WIDGET_MAIN_SETTING_TABS,
            params: [
                {
                    ...CUSTOM_SETTINGS_ENTITY_ID_PARAM,
                    entityConstraints: {
                        hasMetrics: true,
                    },
                },
                gaugeDataSourcesSettingsParam,
                {
                    ...CUSTOM_SETTINGS_DATA_AGE_LIMIT_PARAM,
                    description: '{{entity.view_comp.common.custom_settings.data_age_limit.description_with_time_range_note}}',
                },
            ],
        },
        {
            ...DEFAULT_WIDGET_STYLE_SETTING_TABS,
            params: [
                CUSTOM_SETTINGS_WIDGET_VIEW_CONTAINER_TYPE_PARAM,
                CUSTOM_SETTINGS_HIDE_TITLE_PARAM,
                CUSTOM_SETTINGS_WIDGET_VIEW_CONTAINER_STYLE_PARAM,
                CUSTOM_SETTINGS_GRID_LAYOUT_SETTINGS,
                gaugeChartViewSettingsParams,
                gaugeGlobalNumericMetricViewSettingsParam,
                {
                    ...CUSTOM_SETTINGS_STYLE_PARAM,
                    isAdvancedSettings: true,
                },
            ],
        },
    ],
};
