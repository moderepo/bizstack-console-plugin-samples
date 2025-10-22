import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { jaJP } from '@mui/x-date-pickers/locales';
import ja from 'date-fns/locale/ja';
import { PropsWithChildren } from 'react';

/**
 * Localization Provider
 */
export const DateLocalizationProvider = ({ children }: PropsWithChildren) => {
    return (
        <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={ja}
            localeText={jaJP.components.MuiLocalizationProvider.defaultProps.localeText}
            dateFormats={{ year: 'yyyy年' }}
        >
            {children}
        </LocalizationProvider>
    );
};
