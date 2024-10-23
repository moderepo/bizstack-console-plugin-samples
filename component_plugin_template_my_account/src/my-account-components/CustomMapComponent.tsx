/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { BaseBizConsoleCompProps, SubSettingsErrorsLogger, isValidObjectValue, isValidNumberValue } from '@moderepo/bizstack-console-sdk';
import { Box, SxProps, Theme, useTheme } from '@mui/material';
import { Map as GoogleMap } from '@vis.gl/react-google-maps';

export interface CustomMapComponentProps extends BaseBizConsoleCompProps {
    readonly sx?: SxProps<Theme>;
    readonly latitude: number;
    readonly longitude: number;
    readonly zoom: number;
}

/**
 * Type guard function to check if the given obj is an instance of CustomMapComponentProps.
 */
export const isCustomMapComponentProps = (obj: unknown, errorLogger?: SubSettingsErrorsLogger | undefined): obj is CustomMapComponentProps => {
    const settings = obj as CustomMapComponentProps;

    if (!isValidObjectValue(settings, true, errorLogger)) {
        return false;
    }

    if (
        !isValidNumberValue(
            settings.latitude,
            true,
            false,
            -180,
            180,
            undefined,
            new SubSettingsErrorsLogger(errorLogger, 'latitude', settings.latitude)
        )
    ) {
        return false;
    }

    if (
        !isValidNumberValue(
            settings.longitude,
            true,
            false,
            -180,
            180,
            undefined,
            new SubSettingsErrorsLogger(errorLogger, 'longitude', settings.longitude)
        )
    ) {
        return false;
    }

    if (!isValidNumberValue(settings.zoom, true, false, 0, 22, undefined, new SubSettingsErrorsLogger(errorLogger, 'zoom', settings.zoom))) {
        return false;
    }
    return true;
};

export const CustomMapComponent: React.FC<CustomMapComponentProps> = ({ sx, latitude, longitude, zoom }) => {
    // The theme defines the mapId for Google Maps.
    const theme = useTheme();
    const mapId = theme.mapId;
    const mapTypeId = 'satellite';

    return (
        <Box sx={sx}>
            <GoogleMap
                defaultCenter={{ lat: latitude, lng: longitude }}
                defaultZoom={zoom}
                defaultHeading={0}
                headingInteractionEnabled={true}
                rotateControl={true}
                zoomControl={true}
                mapId={mapId}
                mapTypeId={mapTypeId}
                disableDefaultUI={true}
            ></GoogleMap>
        </Box>
    );
};

CustomMapComponent.displayName = 'CustomMapComponent';
