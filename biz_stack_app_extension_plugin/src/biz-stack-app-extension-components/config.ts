import { BizConsolePluginType, BizConsolePluginPack, BizStackAppExtensionConfigComponentPlugin } from '@moderepo/bizstack-console-sdk';
import sdk from '@moderepo/bizstack-console-sdk/package.json';
import { MetricSettings, isMetricSettingsProps } from './MetricSettings';

/**
 * This is the plugin configuration that is needed by BizConsole. The object name MUST be `bizConsolePlugin` because when BizConsole
 * load the plugin, it will be looking for this object.
 */
export const bizConsolePlugins: BizConsolePluginPack = {
    pluginVersion: '1.0.0',
    bizConsoleVersion: sdk.version,
    namespace: 'BizStackAppExtensionConfigCompsPluginSample',
    plugins: [
        {
            type: BizConsolePluginType.BIZ_STACK_APP_EXTENSION_CONFIG_COMPONENT,
            name: 'Metric Settings Component',
            componentTypeSettings: {
                type: MetricSettings.displayName as string,
                componentFunc: MetricSettings,
                displayName: 'Metric Settings',
                description: 'Settings for the metric',
                customPropsValidator: isMetricSettingsProps,
            },
        } as BizStackAppExtensionConfigComponentPlugin,
    ],
};
