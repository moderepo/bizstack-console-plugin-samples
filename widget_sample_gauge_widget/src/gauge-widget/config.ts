import {
    BizConsoleDashboardWidgetPlugin,
    BizConsolePluginType,
    IconSource,
    BizConsolePluginPack,
    ENTITY_VIEW_COMP_CATEGORY,
} from '@moderepo/bizstack-console-sdk';
import { GaugeWidget } from './GaugeWidget';
import { createInitialGaugeWidgetCompSettings, isGaugeWidgetCustomSettings } from './models';
import { gaugeWidgetCustomSettingsSchema } from './schema';

/**
 * This is the plugin configuration that is needed by BizConsole. The object name MUST be `bizConsolePlugin` because when BizConsole
 * load the plugin, it will be looking for this object.
 */
export const bizConsolePlugins: BizConsolePluginPack = {
    bizConsoleVersion: '1.8.0',
    namespace: 'ModeSamplePlugin',
    plugins: [
        {
            type: BizConsolePluginType.DASHBOARD_WIDGET,
            name: 'Sample Gauge widget',
            widgetTypeSettings: {
                type: GaugeWidget.displayName as string,
                componentFunc: GaugeWidget,
                icon: { source: IconSource.BIZ_CONSOLE, name: 'GaugeOutlined' },
                displayName: 'Gauge Widget - Plugin Example',
                description: 'Widget that displays metric value using Gauge Chart',
                category: ENTITY_VIEW_COMP_CATEGORY.METRIC_VALUE,
                customSettingsValidator: isGaugeWidgetCustomSettings,
                createInitialEntityViewCompSettings: createInitialGaugeWidgetCompSettings,
                customSettingsSchema: gaugeWidgetCustomSettingsSchema,
            },
        } as BizConsoleDashboardWidgetPlugin,
    ],
};
