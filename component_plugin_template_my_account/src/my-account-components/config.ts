import { BizConsoleComponentPlugin, BizConsolePluginType, BizConsolePluginPack } from '@moderepo/bizstack-console-sdk';
import { MyAccountInfoComponent, isMyAccountInfoComponentProps } from './MyAccountInfoComponent';
import { MyCustomAccountPage, isMyCustomAccountPageProps } from './MyCustomAccountPage';
import { MyAccountPrefComponent, isMyAccountPrefComponentProps } from './MyAccountPrefComponent';
import { LogoutButton, isLogoutButtonProps } from './LogoutButton';

/**
 * This is the plugin configuration that is needed by BizConsole. The object name MUST be `bizConsolePlugin` because when BizConsole
 * load the plugin, it will be looking for this object.
 */
export const bizConsolePlugins: BizConsolePluginPack = {
    bizConsoleVersion: '1.0.0',
    namespace: 'SampleMyAccountCompsPlugin',
    plugins: [
        {
            type: BizConsolePluginType.COMPONENT,
            name: 'My Custom Account Page',
            componentTypeSettings: {
                type: MyCustomAccountPage.displayName as string,
                componentFunc: MyCustomAccountPage,
                displayName: 'My Custom Account Page',
                description: 'A custom page that display my account info',
                customPropsValidator: isMyCustomAccountPageProps,
            },
        } as BizConsoleComponentPlugin,
        {
            type: BizConsolePluginType.COMPONENT,
            name: 'My Account Info Component',
            componentTypeSettings: {
                type: MyAccountInfoComponent.displayName as string,
                componentFunc: MyAccountInfoComponent,
                displayName: 'My Account Info Component',
                description: 'A custom component that display my account info',
                customPropsValidator: isMyAccountInfoComponentProps,
            },
        } as BizConsoleComponentPlugin,
        {
            type: BizConsolePluginType.COMPONENT,
            name: 'My Account Pref Component',
            componentTypeSettings: {
                type: MyAccountPrefComponent.displayName as string,
                componentFunc: MyAccountPrefComponent,
                displayName: 'My Account Preferences Component',
                description: 'A custom component that display my account preferences',
                customPropsValidator: isMyAccountPrefComponentProps,
            },
        } as BizConsoleComponentPlugin,
        {
            type: BizConsolePluginType.COMPONENT,
            name: 'Logout Button',
            componentTypeSettings: {
                type: LogoutButton.displayName as string,
                componentFunc: LogoutButton,
                displayName: 'Logout Button',
                description: 'A button to log the user out',
                customPropsValidator: isLogoutButtonProps,
            },
        } as BizConsoleComponentPlugin,
    ],
};
