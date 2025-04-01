import {
    BizConsoleDashboardWidgetPlugin,
    BizConsolePluginType,
    IconSource,
    BizConsolePluginPack,
    ENTITY_VIEW_COMP_CATEGORY,
} from '@moderepo/bizstack-console-sdk';
import { createInitialGaugeWidgetCompSettings, GaugeWidget, gaugeWidgetCustomSettingsSchema, isGaugeWidgetCustomSettings } from './gauge-widget';
import { XYChartWidget } from './xy-chart-widget/XYChartWidget';
import { createInitialXYChartWidgetCompSettings, isXYChartWidgetCustomSettings, xyChartWidgetCustomSettingsSchema } from './xy-chart-widget';

/**
 * This is the plugin configuration that is needed by BizConsole. The object name MUST be `bizConsolePlugin` because when BizConsole
 * load the plugin, it will be looking for this object.
 */
export const bizConsolePlugins: BizConsolePluginPack = {
    bizConsoleVersion: '1.13.0',
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
        {
            type: BizConsolePluginType.DASHBOARD_WIDGET,
            name: 'Sample XY Chart widget',
            widgetTypeSettings: {
                type: XYChartWidget.displayName as string,
                componentFunc: XYChartWidget,
                icon: { source: IconSource.BIZ_CONSOLE, name: 'LineGraphOutlined' },
                displayName: 'XY Chart Widget - Plugin Example',
                description: 'Widget that displays metric value using XY Chart',
                category: ENTITY_VIEW_COMP_CATEGORY.CHARTS_AND_TABLES,
                customSettingsValidator: isXYChartWidgetCustomSettings,
                createInitialEntityViewCompSettings: createInitialXYChartWidgetCompSettings,
                customSettingsSchema: xyChartWidgetCustomSettingsSchema,
            },
        } as BizConsoleDashboardWidgetPlugin,
    ],
};
