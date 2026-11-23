import {
    BizConsolePluginType,
    BizConsolePluginPack,
    BizStackAppExtensionConfigComponentPlugin,
    BizStackAppExtensionComponentPlugin,
} from '@moderepo/bizstack-console-sdk';
import sdk from '@moderepo/bizstack-console-sdk/package.json';
import { MetricSettings, isMetricSettingsProps } from './MetricSettings';
import { ReportPage, isReportPageProps } from './ReportPage';
import { LogsPage, isLogsPageProps } from './LogsPage';

/**
 * This is the plugin configuration that is needed by BizConsole. The object name MUST be `bizConsolePlugins` because when BizConsole
 * load the plugin, it will be looking for this object.
 */
export const bizConsolePlugins: BizConsolePluginPack = {
    pluginVersion: '1.0.0',
    bizConsoleVersion: sdk.version,
    namespace: 'BizStackAppExtensionPluginSample',
    plugins: [
        {
            type: BizConsolePluginType.BIZSTACK_APP_EXTENSION_CONFIG_COMPONENT,
            name: 'Metric Settings Component',
            componentTypeSettings: {
                type: MetricSettings.displayName as string,
                componentFunc: MetricSettings,
                displayName: 'Metric Settings',
                description: 'Settings for the metric',
                customPropsValidator: isMetricSettingsProps,
            },
        } as BizStackAppExtensionConfigComponentPlugin,
        {
            type: BizConsolePluginType.BIZSTACK_APP_EXTENSION_COMPONENT,
            name: 'Report Page Component',
            componentTypeSettings: {
                type: ReportPage.displayName as string,
                componentFunc: ReportPage,
                displayName: 'Report Page',
                description: 'Report Page for the app extension',
                customPropsValidator: isReportPageProps,
            },
        } as BizStackAppExtensionComponentPlugin,
        {
            type: BizConsolePluginType.BIZSTACK_APP_EXTENSION_COMPONENT,
            name: 'Logs Page Component',
            componentTypeSettings: {
                type: LogsPage.displayName as string,
                componentFunc: LogsPage,
                displayName: 'Logs Page',
                description: 'Logs Page for the app extension',
                customPropsValidator: isLogsPageProps,
            },
        } as BizStackAppExtensionComponentPlugin,
    ],
};
