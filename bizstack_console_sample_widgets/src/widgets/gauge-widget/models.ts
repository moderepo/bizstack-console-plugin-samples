import {
    BaseEntityViewCompCustomSettings,
    BaseNumericMetricViewSettings,
    BaseTagMetricViewSettings,
    DataAgeLimitSettings,
    GenericEntityViewCompSettings,
    GridLayoutSettings,
    IconSettings,
    MetricThresholdColorMapping,
    MetricThresholdSettings,
    MetricsDataSourceSettings,
    SubSettingsErrorsLogger,
    WidgetViewContainerType,
    isBaseEntityViewCompCustomSettings,
    isBaseNumericMetricViewSettings,
    isBaseTagMetricViewSettings,
    isDataAgeLimitSettings,
    isGridLayoutSettings,
    isIconSettings,
    isMetricThresholdColorMapping,
    isMetricThresholdSettings,
    isMetricsDataSourceSettings,
    isValidArrayValue,
    isValidBooleanValue,
    isValidNumberValue,
    isValidObjectValue,
    isValidStringValue,
} from '@moderepo/bizstack-console-sdk';
import { SxProps } from '@mui/material';

// The thickness of the gauge
export const DEFAULT_GAUGE_CHART_BAND_WIDTH = 10;
export const MIN_GAUGE_CHART_BAND_WIDTH = 5;
export const MAX_GAUGE_CHART_BAND_WIDTH = 30;

/**
 * The interface to customize the amchart Gauge chart
 */
export interface GaugeChartViewSettings {
    // The thickness of the gauge chart band
    readonly bandWidth?: number;
}

/**
 * Type guard function to check if the given obj is an instance of GaugeChartViewSettings.
 */
export const isGaugeChartViewSettings = (obj: unknown, errorLogger?: SubSettingsErrorsLogger | undefined): obj is GaugeChartViewSettings => {
    const settings = obj as GaugeChartViewSettings;

    if (!isValidObjectValue(settings, true, errorLogger)) {
        return false;
    }

    if (
        !isValidNumberValue(
            settings.bandWidth,
            false,
            false,
            MIN_GAUGE_CHART_BAND_WIDTH,
            MAX_GAUGE_CHART_BAND_WIDTH,
            undefined,
            new SubSettingsErrorsLogger(errorLogger, 'bandWidth', settings.bandWidth)
        )
    ) {
        return false;
    }

    return true;
};

/**
 * This is a NumericMetricViewSettings specifically for MetricsValues component therefore it extends the
 * BaseNumericMetricViewSettings and add additional attributes for MetricsValues options.
 */
export interface GaugeWidgetNumericMetricViewSettings extends BaseNumericMetricViewSettings, MetricThresholdSettings {
    readonly icon?: IconSettings;

    // The default value to display when an data does not have a value. This is a global setting that apply to all data EXCEPT for data that
    // have their own defaultValue setting.
    readonly defaultValue?: string | number;

    // To override the default colors the widget uses for visualizing metric state
    readonly metricThresholdColorMapping?: MetricThresholdColorMapping;
}

/**
 * type guard function to check if an object is a type of GaugeWidgetNumericMetricViewSettings
 */
export const isGaugeWidgetNumericMetricViewSettings = (
    obj: unknown,
    errorLogger?: SubSettingsErrorsLogger | undefined
): obj is GaugeWidgetNumericMetricViewSettings => {
    const settings = obj as GaugeWidgetNumericMetricViewSettings;

    if (!isValidObjectValue(settings, true, errorLogger)) {
        return false;
    }

    // Because this interface extends NumericMetricViewSettings therefore we can call isNumericMetricViewSettings to valid the props
    // from the NumericMetricViewSettings interface.
    if (!isBaseNumericMetricViewSettings(settings, errorLogger)) {
        return false;
    }

    if (settings.icon !== undefined && !isIconSettings(settings.icon, new SubSettingsErrorsLogger(errorLogger, 'icon', settings.icon))) {
        return false;
    }

    if (
        typeof settings.defaultValue === 'string' &&
        !isValidStringValue(
            settings.defaultValue,
            false,
            true,
            undefined,
            new SubSettingsErrorsLogger(errorLogger, 'defaultValue', settings.defaultValue)
        )
    ) {
        return false;
    }

    if (
        typeof settings.defaultValue === 'number' &&
        !isValidNumberValue(
            settings.defaultValue,
            false,
            true,
            undefined,
            undefined,
            undefined,
            new SubSettingsErrorsLogger(errorLogger, 'defaultValue', settings.defaultValue)
        )
    ) {
        return false;
    }

    if (settings.defaultValue !== undefined && typeof settings.defaultValue !== 'string' && typeof settings.defaultValue !== 'number') {
        return new SubSettingsErrorsLogger(errorLogger, 'defaultValue', settings.defaultValue).logError(`"defaultValue" must be a number or string`);
    }

    // Because this interface extends MetricThresholdSettings, it can call the isMetricThresholdSettings to validate threshold settings
    if (!isMetricThresholdSettings(settings, errorLogger)) {
        return false;
    }
    if (
        settings.metricThresholdColorMapping &&
        !isMetricThresholdColorMapping(
            settings.metricThresholdColorMapping,
            new SubSettingsErrorsLogger(errorLogger, 'metricThresholdColorMapping', settings.metricThresholdColorMapping)
        )
    ) {
        return false;
    }

    return true;
};

export interface GaugeWidgetCustomSettings extends BaseEntityViewCompCustomSettings, DataAgeLimitSettings {
    // The data source settings that tell the component which metrics to show
    readonly dataSourcesSettings: ReadonlyArray<MetricsDataSourceSettings<GaugeWidgetNumericMetricViewSettings, BaseTagMetricViewSettings>>;

    // The settings to customize the gauge chart
    readonly chartViewSettings?: GaugeChartViewSettings;

    // To customize the Numeric metrics' view. This will apply to ALL numeric metrics in this component
    // NOTE: Since this is a global settings, we don't need to inherit the `displayName` settings because it doesn't make sense to
    // set a global displayName for ALL metrics. Each individual metric can have this settings but not the Global settings
    readonly globalNumericMetricsViewSettings?: Omit<GaugeWidgetNumericMetricViewSettings, 'displayName' | 'displayDataMapping'>;

    // Each metric value will be displayed as 1 component and they will be laid out using Grid layout. The user can customize the layout
    // with this settings.
    readonly layoutSettings?: GridLayoutSettings;

    // Each metric display valued will be contained inside a box. The user can customize the type of box to use for displaying the values.
    readonly containerType?: WidgetViewContainerType;

    // The custom CSS style of the container.
    readonly containerStyle?: SxProps;

    // Hide the icon and title of the container
    readonly hideTitle?: boolean;
}

/**
 * Type guard function to check if the given obj is an instance of GaugeWidgetCustomSettings.
 */
export const isGaugeWidgetCustomSettings = (obj: unknown, errorLogger?: SubSettingsErrorsLogger | undefined): obj is GaugeWidgetCustomSettings => {
    const settings = obj as GaugeWidgetCustomSettings;

    // GaugeWidgetCustomSettings extends BaseEntityViewCompCustomSettings therefore we can call
    // isBaseEntityViewCompCustomSettings to validate the settings for EntityViewCompCustomSettings
    if (!isBaseEntityViewCompCustomSettings(settings, errorLogger)) {
        return false;
    }

    // "dataSourcesSettings" is REQUIRED
    if (
        !isValidArrayValue(
            settings.dataSourcesSettings,
            true,
            true,
            0,
            undefined,
            new SubSettingsErrorsLogger(errorLogger, 'dataSourcesSettings', settings.dataSourcesSettings)
        )
    ) {
        return false;
    }

    if (
        settings.chartViewSettings &&
        !isGaugeChartViewSettings(
            settings.chartViewSettings,
            new SubSettingsErrorsLogger(errorLogger, 'chartViewSettings', settings.chartViewSettings)
        )
    ) {
        return false;
    }

    // Make sure each item in "dataSourcesSettings" is a type of MetricsDataSourceSettings
    if (
        settings.dataSourcesSettings &&
        !settings.dataSourcesSettings.every((dataSourceSettings, index) => {
            if (
                !isMetricsDataSourceSettings(
                    dataSourceSettings,
                    new SubSettingsErrorsLogger(errorLogger, `dataSourcesSettings[${index}]`, dataSourceSettings),
                    isGaugeWidgetNumericMetricViewSettings,
                    isBaseTagMetricViewSettings
                )
            ) {
                return false;
            }
            return true;
        })
    ) {
        return false;
    }

    // dataAgeLimit is optional but if it is provided, it must be an DurationInfo object
    if (!isDataAgeLimitSettings(settings, errorLogger)) {
        return false;
    }

    if (
        settings.globalNumericMetricsViewSettings !== undefined &&
        !isBaseNumericMetricViewSettings(
            settings.globalNumericMetricsViewSettings,
            new SubSettingsErrorsLogger(errorLogger, 'globalNumericMetricsViewSettings', settings.globalNumericMetricsViewSettings)
        )
    ) {
        return false;
    }

    // "layoutSettings" is optional but if it is provided, it must be a valid GridLayoutSettings object
    if (
        settings.layoutSettings &&
        !isGridLayoutSettings(settings.layoutSettings, new SubSettingsErrorsLogger(errorLogger, 'layoutSettings', settings.layoutSettings))
    ) {
        return false;
    }

    if (
        !isValidStringValue(
            settings.containerType,
            false,
            false,
            Object.values(WidgetViewContainerType),
            new SubSettingsErrorsLogger(errorLogger, 'containerType', settings.containerType)
        )
    ) {
        return false;
    }

    if (!isValidObjectValue(settings.containerStyle, false, new SubSettingsErrorsLogger(errorLogger, 'containerStyle', settings.style))) {
        return false;
    }

    if (!isValidBooleanValue(settings.hideTitle, false, new SubSettingsErrorsLogger(errorLogger, 'hideTitle', settings.hideTitle))) {
        return false;
    }

    return true;
};

/**
 * A function that create an Initial JSON for a GaugeWidgetCustomSettings component's custom settings.
 */
export const createInitialGaugeWidgetCustomSettings = (): GaugeWidgetCustomSettings => {
    return {
        dataSourcesSettings: [],
        containerSettings: {
            enabled: true
        }
    };
};

/**
 * A function that create an Initial JSON for a GaugeWidgetCustomSettings component settings.
 */
export const createInitialGaugeWidgetCompSettings = (compType: string): GenericEntityViewCompSettings<GaugeWidgetCustomSettings> => {
    return {
        componentType: compType,
        customSettings: createInitialGaugeWidgetCustomSettings(),
    };
};
