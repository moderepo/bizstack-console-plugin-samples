import {
    BaseEntityViewCompCustomSettings,
    BaseTagMetricViewSettings,
    BaseXYChartViewSettings,
    GenericEntityViewCompSettings,
    MetricsDataSourceSettings,
    SubSettingsErrorsLogger,
    XYChartNumericMetricViewSettings,
    isBaseChartViewSettings,
    isBaseEntityViewCompCustomSettings,
    isBaseTagMetricViewSettings,
    isMetricsDataSourceSettings,
    isValidArrayValue,
    isValidBooleanValue,
    isValidObjectValue,
    isXYChartNumericMetricViewSettings,
} from '@moderepo/bizstack-console-sdk';

export interface XYChartViewSettings extends BaseXYChartViewSettings {
    // Whether or not to show bullets for Line and Area chart type. The default is FALSE.
    readonly showBullets?: boolean;

    // Whether or not to show data labels for Line and Bar chart type. The default is FALSE.
    readonly showDataLabels?: boolean;

    // Whether or not to connect the data that has gap in between. The default is FALSE and the chart will NOT connect 2 data points
    // if there is a gap in the middle.
    readonly connectDataGap?: boolean;
}

/**
 * Type guard function to check if the given obj is an instance of XYChartViewSettings.
 */
export const isXYChartViewSettings = (obj: unknown, errorLogger?: SubSettingsErrorsLogger | undefined): obj is XYChartViewSettings => {
    const settings = obj as XYChartViewSettings;

    if (!isValidObjectValue(settings, true, errorLogger)) {
        return false;
    }

    if (!isBaseChartViewSettings(settings, errorLogger)) {
        return false;
    }

    if (!isValidBooleanValue(settings.showBullets, false, new SubSettingsErrorsLogger(errorLogger, 'showBullets', settings.showBullets))) {
        return false;
    }

    if (!isValidBooleanValue(settings.showDataLabels, false, new SubSettingsErrorsLogger(errorLogger, 'showDataLabels', settings.showDataLabels))) {
        return false;
    }

    if (!isValidBooleanValue(settings.connectDataGap, false, new SubSettingsErrorsLogger(errorLogger, 'connectDataGap', settings.connectDataGap))) {
        return false;
    }

    return true;
};

export interface XYChartWidgetCustomSettings extends BaseEntityViewCompCustomSettings {
    /**
     * To configure the metrics to be fetched. An Entity can have more than 1 metrics definition and EACH metrics definition
     * can have more than 1 metrics. Therefore, this is an ARRAY so that we can configure the component to fetch more than 1 metrics definitions.
     * For optimization, don't create 1 MetricsDataSourceSettings object per metric. If multiple metrics belong to the same metrics
     * definition, create 1 MetricsDataSourceSettings for all of them.
     *
     * DON'T Do this. This will make 5 API calls
     * ```
     *      dataSourcesSettings: [{
     *          metricsDefinitionId: "AAA",
     *          numericMetrics: [{
     *              valueName: "a1"
     *          }]
     *      }, {
     *          metricsDefinitionId: "AAA",
     *          numericMetrics: [{
     *              valueName: "a2"
     *          }]
     *      }, {
     *          metricsDefinitionId: "AAA",
     *          numericMetrics: [{
     *              valueName: "a3"
     *          }]
     *      }, {
     *          metricsDefinitionId: "BBB",
     *          numericMetrics: [{
     *              valueName: "b1"
     *          }]
     *      }, {
     *          metricsDefinitionId: "BBB",
     *          numericMetrics: [{
     *              valueName: "b2"
     *          }]
     *      }]
     * ```
     *
     * DO this instead. This will only make 2 API calls
     * ```
     *      dataSourcesSettings: [{
     *          metricsDefinitionId: "AAA",
     *          numericMetrics: [{
     *              valueName: "a1"
     *          }, {
     *              valueName: "a2"
     *          }, {
     *              valueName: "a3"
     *          }]
     *      }, {
     *          metricsDefinitionId: "BBB",
     *          numericMetrics: [{
     *              valueName: "b1"
     *          }, {
     *              valueName: "b2"
     *          }]
     *      }]
     * ```
     */
    readonly dataSourcesSettings: ReadonlyArray<MetricsDataSourceSettings<XYChartNumericMetricViewSettings, BaseTagMetricViewSettings>>;

    readonly chartViewSettings?: XYChartViewSettings;

    // To customize the Numeric metrics' view. This will apply to ALL numeric metrics in this component
    // NOTE: Since this is a global settings, we don't need to inherit the `displayName` settings because it doesn't make sense to
    // set a global displayName for ALL metrics. Each individual metric can have this settings but not the Global settings
    readonly globalNumericMetricsViewSettings?: Omit<XYChartNumericMetricViewSettings, 'displayName'>;
}

/**
 * Type guard function to check if the given obj is an instance of XYChartWidgetCustomSettings.
 */
export const isXYChartWidgetCustomSettings = (
    obj: unknown,
    errorLogger?: SubSettingsErrorsLogger | undefined
): obj is XYChartWidgetCustomSettings => {
    const settings = obj as XYChartWidgetCustomSettings;

    // XYChartWidgetCustomSettings extends BaseEntityViewCompCustomSettings therefore we can call isBaseEntityViewCompCustomSettings
    // to validate the settings for EntityViewCompCustomSettings
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

    // Make sure each item in "dataSourcesSettings" is a type of MetricsDataSourceSettings
    if (
        settings.dataSourcesSettings &&
        !settings.dataSourcesSettings.every((dataSourceSettings, index) => {
            if (
                !isMetricsDataSourceSettings(
                    dataSourceSettings,
                    new SubSettingsErrorsLogger(errorLogger, `dataSourcesSettings[${index}]`, dataSourceSettings),
                    isXYChartNumericMetricViewSettings,
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

    if (
        settings.chartViewSettings !== undefined &&
        !isXYChartViewSettings(settings.chartViewSettings, new SubSettingsErrorsLogger(errorLogger, 'chartViewSettings', settings.chartViewSettings))
    ) {
        return false;
    }

    if (
        settings.globalNumericMetricsViewSettings !== undefined &&
        !isXYChartNumericMetricViewSettings(
            settings.globalNumericMetricsViewSettings,
            new SubSettingsErrorsLogger(errorLogger, 'globalNumericMetricsViewSettings', settings.globalNumericMetricsViewSettings)
        )
    ) {
        return false;
    }

    return true;
};

/**
 * A function that create an Initial JSON for a XYChartWidgetSettings component's custom settings.
 */
export const createInitialXYChartWidgetCustomSettings = (): XYChartWidgetCustomSettings => {
    return {
        dataSourcesSettings: [],
    };
};

/**
 * A function that create an Initial JSON for a XYChartWidgetSettings component settings.
 */
export const createInitialXYChartWidgetCompSettings = (compType: string): GenericEntityViewCompSettings<XYChartWidgetCustomSettings> => {
    return {
        componentType: compType,
        customSettings: createInitialXYChartWidgetCustomSettings(),
    };
};
