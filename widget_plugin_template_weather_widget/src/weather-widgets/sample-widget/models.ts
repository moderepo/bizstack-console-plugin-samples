import {
    BaseEntityViewCompCustomSettings,
    BaseNumericMetricViewSettings,
    BaseTagMetricViewSettings,
    GenericEntityViewCompSettings,
    isBaseEntityViewCompCustomSettings,
    isBaseNumericMetricViewSettings,
    isBaseTagMetricViewSettings,
    isMetricsDataSourceSettings,
    MetricsDataSourceSettings,
    SubSettingsErrorsLogger,
} from '@moderepo/bizstack-console-sdk';

/**
 * SampleWidget custom settings structure
 */
export interface SampleWidgetCustomSettings extends BaseEntityViewCompCustomSettings {
    // In most cases, `entityId` and `dataSourcesSettings` will be required to fetch data from the BizStack backend.
    // entityId is used to show data for a SPECIFIC entity instead of the entity that the dashboard is showing.
    // However, you don't have to define it because BaseEntityViewCompCustomSettings has it.
    // readonly entityId?: string

    // A data source settings defines metrics to be fetched. MetricsDataSourceSettings defines the settings structure for a single data source.
    // Since a widget can show data from multiple data sources, this is an array of data source settings. Even when your widget uses only one data
    // source, using an array is recommended to utilize the SDK functions.
    // BaseNumericMetricViewSettings and BaseTagMetricViewSettings defines common view settings such as unit, decimal points, etc.
    // These define a lot of settings but your widget doesn't have to support all the settings.
    readonly dataSourcesSettings: ReadonlyArray<MetricsDataSourceSettings<BaseNumericMetricViewSettings, BaseTagMetricViewSettings>>;
}

/**
 * Type guard function to check if the given obj is an instance of SampleWidgetCustomSettings.
 */
export const isSampleWidgetCustomSettings = (obj: unknown, errorLogger?: SubSettingsErrorsLogger | undefined): obj is SampleWidgetCustomSettings => {
    const settings = obj as SampleWidgetCustomSettings;

    // SampleWidgetCustomSettings extends BaseEntityViewCompCustomSettings therefore we can call
    // isBaseEntityViewCompCustomSettings to validate the settings for EntityViewCompCustomSettings
    if (!isBaseEntityViewCompCustomSettings(settings, errorLogger)) {
        return false;
    }

    // Make sure each item in "dataSourcesSettings" is a type of MetricsDataSourceSettings
    if (
        settings.dataSourcesSettings &&
        !settings.dataSourcesSettings.every((dataSourceSettings, index) => {
            return isMetricsDataSourceSettings(
                dataSourceSettings,
                new SubSettingsErrorsLogger(errorLogger, `dataSourcesSettings[${index}]`, dataSourceSettings),
                isBaseNumericMetricViewSettings,
                isBaseTagMetricViewSettings
            );
        })
    ) {
        return false;
    }

    return true;
};

/**
 * A function that create an Initial JSON for a SampleWidget component's custom settings.
 */
export const createInitialSampleWidgetCustomSettings = (): SampleWidgetCustomSettings => {
    return {
        dataSourcesSettings: [],
    };
};

/**
 * A function that create an Initial JSON for a SampleWidget component settings.
 */
export const createInitialSampleWidgetSettings = (compType: string): GenericEntityViewCompSettings<SampleWidgetCustomSettings> => {
    return {
        componentType: compType,
        customSettings: createInitialSampleWidgetCustomSettings(),
    };
};
