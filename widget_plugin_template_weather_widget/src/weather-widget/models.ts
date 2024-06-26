import {
    BaseEntityViewCompCustomSettings,
    GPSCoordinate,
    GenericEntityViewCompSettings,
    SubSettingsErrorsLogger,
    isGPSCoordinate,
    isValidObjectValue,
    isValidStringValue,
} from '@moderepo/biz-console';

// This file is where we place the widget's customSettings models. Most widget has some specific settings in addition to the
// BaseEntityViewCompCustomSettings. For example, some widgets needs the user to provide the title text to display.
//
//  model for it's customSettings that contains all the widget's
// attributes that are customizable. To tell BizConsole how to create the UI for the widget's settings, we will need to define the
// settings schema. BizConsole's dashboard widget settings system will read this config and create the UI for the user to customize the widget.

/*************************************************************  TEMPERATURE WIDGET MODELS *********************************************************/
export enum TEMPERATURE_UNIT {
    CELSIUS = 'C',
    FAHRENHEIT = 'F',
}

export interface TemperatureWidgetCustomSettings extends BaseEntityViewCompCustomSettings {
    readonly title: string;
    readonly location: GPSCoordinate;
    readonly unit?: TEMPERATURE_UNIT;
}

/**
 * Type guard function to check if the given obj is an instance of TemperatureWidgetCustomSettings.
 */
export const isTemperatureWidgetCustomSettings = (
    obj: unknown,
    errorLogger?: SubSettingsErrorsLogger | undefined
): obj is TemperatureWidgetCustomSettings => {
    const settings = obj as TemperatureWidgetCustomSettings;

    if (!isValidObjectValue(settings, true, errorLogger)) {
        return false;
    }

    if (!isValidStringValue(settings.title, true, true, undefined, new SubSettingsErrorsLogger(errorLogger, 'title', settings.title))) {
        return false;
    }

    if (!isGPSCoordinate(settings.location, new SubSettingsErrorsLogger(errorLogger, 'location', settings.location))) {
        return false;
    }

    if (
        !isValidStringValue(
            settings.unit,
            false,
            false,
            Object.values(TEMPERATURE_UNIT),
            new SubSettingsErrorsLogger(errorLogger, 'unit', settings.unit)
        )
    ) {
        return false;
    }

    return true;
};

/**
 * A function that create an Initial JSON for a TemperatureWidgetCustomSettings component's custom settings.
 */
export const createInitialTemperatureWidgetCustomSettings = (): TemperatureWidgetCustomSettings => {
    return {
        title: '',
        location: { lat: 35.78037262595157, lng: 139.78598775403952 },
    };
};

/**
 * A function that create an Initial JSON for a TemperatureWidgetCustomSettings component settings.
 */
export const createInitialTemperatureWidgetSettings = (compType: string): GenericEntityViewCompSettings<TemperatureWidgetCustomSettings> => {
    return {
        componentType: compType,
        customSettings: createInitialTemperatureWidgetCustomSettings(),
    };
};

/*************************************************************  HUMIDITY WIDGET MODELS *********************************************************/
export interface HumidityWidgetCustomSettings extends BaseEntityViewCompCustomSettings {
    readonly title: string;
    readonly location: GPSCoordinate;
}

/**
 * Type guard function to check if the given obj is an instance of HumidityWidgetCustomSettings.
 */
export const isHumidityWidgetCustomSettings = (
    obj: unknown,
    errorLogger?: SubSettingsErrorsLogger | undefined
): obj is HumidityWidgetCustomSettings => {
    const settings = obj as HumidityWidgetCustomSettings;

    if (!isValidObjectValue(settings, true, errorLogger)) {
        return false;
    }

    if (!isValidStringValue(settings.title, true, true, undefined, new SubSettingsErrorsLogger(errorLogger, 'title', settings.title))) {
        return false;
    }

    if (!isGPSCoordinate(settings.location, new SubSettingsErrorsLogger(errorLogger, 'location', settings.location))) {
        return false;
    }

    return true;
};

/**
 * A function that create an Initial JSON for a HumidityWidgetCustomSettings component's custom settings.
 */
export const createInitialHumidityWidgetCustomSettings = (): HumidityWidgetCustomSettings => {
    return {
        title: '',
        location: { lat: 35.78037262595157, lng: 139.78598775403952 },
    };
};

/**
 * A function that create an Initial JSON for a HumidityWidgetCustomSettings component settings.
 */
export const createInitialHumidityWidgetSettings = (compType: string): GenericEntityViewCompSettings<HumidityWidgetCustomSettings> => {
    return {
        componentType: compType,
        customSettings: createInitialHumidityWidgetCustomSettings(),
    };
};
