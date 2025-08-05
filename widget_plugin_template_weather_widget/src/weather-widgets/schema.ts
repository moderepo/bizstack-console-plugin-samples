import {
    BaseEntityViewCompCustomSettingsSchema,
    DEFAULT_WIDGET_MAIN_SETTING_TABS,
    EntityCustomSettingParamType,
    EntityViewCustomSettingsParamType,
    DEFAULT_WIDGET_STYLE_SETTING_TABS,
    CUSTOM_SETTINGS_STYLE_PARAM,
    CUSTOM_SETTINGS_CUSTOM_TIME_CONTROL_PARAM,
} from '@moderepo/bizstack-console-sdk';
import { TEMPERATURE_UNIT } from './models';

// This file is where we place the widget param settings. Each widget has a model for it's customSettings that contains all the widget's
// attributes that are customizable. To tell BizConsole how to create the UI for the widget's settings, we will need to define the
// settings schema. BizConsole's dashboard widget settings system will read this config and create the UI for the user to customize the widget.

/**
 * Create the Schema for the TemperatureEntityViewCompCustomSettings so that it can be configured from a UI
 */
export const temperatureWidgetCustomSettingsSchema: BaseEntityViewCompCustomSettingsSchema = {
    tabs: [
        {
            ...DEFAULT_WIDGET_MAIN_SETTING_TABS,
            params: [
                {
                    paramType: EntityViewCustomSettingsParamType.PARAM,
                    type: EntityCustomSettingParamType.STRING,
                    key: 'title',
                    label: 'Title',
                    description: 'The title to be displayed',
                    required: true,
                },
                {
                    paramType: EntityViewCustomSettingsParamType.PARAM,
                    type: EntityCustomSettingParamType.GPS_COORDINATE,
                    key: 'location',
                    label: 'Location',
                    description: 'Select the location you want to show temperature data for',
                    required: true,
                },
                {
                    paramType: EntityViewCustomSettingsParamType.PARAM,
                    type: EntityCustomSettingParamType.STRING,
                    key: 'unit',
                    label: 'Unit',
                    description: 'Select the unit to display the value in',
                    required: false,
                    defaultValue: TEMPERATURE_UNIT.FAHRENHEIT,
                    placeholder: 'Default (Celsius)',
                    options: [
                        {
                            label: 'Celsius',
                            value: TEMPERATURE_UNIT.CELSIUS,
                        },
                        {
                            label: 'Fahrenheit',
                            value: TEMPERATURE_UNIT.FAHRENHEIT,
                        },
                    ],
                },
                CUSTOM_SETTINGS_CUSTOM_TIME_CONTROL_PARAM
            ],
        },
        {
            ...DEFAULT_WIDGET_STYLE_SETTING_TABS,
            params: [CUSTOM_SETTINGS_STYLE_PARAM],
        },
    ],
};

/**
 * Create the Schema for the HumidityEntityViewCompCustomSettings so that it can be configured from a UI
 */
export const humidityWidgetCustomSettingsSchema: BaseEntityViewCompCustomSettingsSchema = {
    tabs: [
        {
            ...DEFAULT_WIDGET_MAIN_SETTING_TABS,
            params: [
                {
                    paramType: EntityViewCustomSettingsParamType.PARAM,
                    type: EntityCustomSettingParamType.STRING,
                    key: 'title',
                    label: 'Title',
                    description: 'The title to be displayed',
                    required: true,
                },
                {
                    paramType: EntityViewCustomSettingsParamType.PARAM,
                    type: EntityCustomSettingParamType.GPS_COORDINATE,
                    key: 'location',
                    label: 'Location',
                    description: 'Select the location you want to show temperature data for',
                    required: true,
                },
                CUSTOM_SETTINGS_CUSTOM_TIME_CONTROL_PARAM
            ],
        },
        {
            ...DEFAULT_WIDGET_STYLE_SETTING_TABS,
            params: [CUSTOM_SETTINGS_STYLE_PARAM],
        },
    ],
};
