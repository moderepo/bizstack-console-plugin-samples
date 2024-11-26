import {
    BizConsoleDashboardWidgetPlugin,
    BizConsolePluginType,
    IconSource,
    BizConsolePluginPack,
    ENTITY_VIEW_COMP_CATEGORY,
} from '@moderepo/bizstack-console-sdk';
import { TemperatureWidget } from './TemperatureWidget';
import { humidityWidgetCustomSettingsSchema, temperatureWidgetCustomSettingsSchema } from './schema';
import {
    createInitialHumidityWidgetSettings,
    createInitialTemperatureWidgetSettings,
    isHumidityWidgetCustomSettings,
    isTemperatureWidgetCustomSettings,
} from './models';
import { HumidityWidget } from './HumidityWidget';
import { createInitialSampleWidgetSettings, isSampleWidgetCustomSettings, SampleWidget, sampleWidgetCustomSettingsSchema } from './sample-widget';

/**
 * This is the plugin configuration that is needed by BizConsole. The object name MUST be `bizConsolePlugin` because when BizConsole
 * load the plugin, it will be looking for this object.
 */
export const bizConsolePlugins: BizConsolePluginPack = {
    bizConsoleVersion: '1.2.0',
    namespace: 'SampleWeatherWidgetPlugin',
    plugins: [
        {
            type: BizConsolePluginType.DASHBOARD_WIDGET,
            name: 'Temperature widget',
            widgetTypeSettings: {
                type: TemperatureWidget.displayName as string,
                componentFunc: TemperatureWidget,
                icon: { source: IconSource.BIZ_CONSOLE, name: 'TemperatureHumiditySensor' },
                displayName: 'Temperature Widget',
                description: 'Widget that display the current temperature of the selected location',
                category: ENTITY_VIEW_COMP_CATEGORY.METRIC_VALUE,
                customSettingsValidator: isTemperatureWidgetCustomSettings,
                createInitialEntityViewCompSettings: createInitialTemperatureWidgetSettings,
                customSettingsSchema: temperatureWidgetCustomSettingsSchema,
            },
        } as BizConsoleDashboardWidgetPlugin,
        {
            type: BizConsolePluginType.DASHBOARD_WIDGET,
            name: 'Humidity widget',
            widgetTypeSettings: {
                type: HumidityWidget.displayName as string,
                componentFunc: HumidityWidget,
                icon: { source: IconSource.MUI, name: 'WaterDrop' },
                displayName: 'Humidity Widget',
                description: 'Widget that display the current humidity of the selected location',
                category: ENTITY_VIEW_COMP_CATEGORY.METRIC_VALUE,
                customSettingsValidator: isHumidityWidgetCustomSettings,
                createInitialEntityViewCompSettings: createInitialHumidityWidgetSettings,
                customSettingsSchema: humidityWidgetCustomSettingsSchema,
            },
        } as BizConsoleDashboardWidgetPlugin,
        {
            type: BizConsolePluginType.DASHBOARD_WIDGET,
            name: 'Sample widget',
            widgetTypeSettings: {
                type: SampleWidget.displayName as string,
                componentFunc: SampleWidget,
                icon: { source: IconSource.BIZ_CONSOLE, name: 'SettingOutlined' },
                displayName: 'Sample Widget',
                description: 'Widget that has metrics custom settings',
                category: ENTITY_VIEW_COMP_CATEGORY.METRIC_VALUE,
                customSettingsValidator: isSampleWidgetCustomSettings,
                createInitialEntityViewCompSettings: createInitialSampleWidgetSettings,
                customSettingsSchema: sampleWidgetCustomSettingsSchema,
            },
        } as BizConsoleDashboardWidgetPlugin,
    ],
};
