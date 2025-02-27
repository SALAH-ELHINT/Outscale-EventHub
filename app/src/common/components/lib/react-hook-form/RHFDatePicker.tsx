import { useFormContext, Controller } from 'react-hook-form';
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { FormControl, FormHelperText } from '@mui/material';
import 'dayjs/locale/fr';
import { Dayjs } from 'dayjs';
import { frFR } from '@mui/x-date-pickers';

type Props = DatePickerProps<Dayjs> & {
  name: string;
  helperText?: string;
};

const frenchLocale = frFR.components.MuiLocalizationProvider.defaultProps.localeText;
frenchLocale.fieldDayPlaceholder = () => 'JJ';
frenchLocale.fieldYearPlaceholder = (params: { digitAmount: number }) =>
  'A'.repeat(params.digitAmount);

const RHFDatePicker = ({ name, helperText, ...other }: Props) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <FormControl fullWidth error={!!error}>
            <DatePicker
              {...field}
              value={field.value ? field.value : null}
              onChange={(date) => field.onChange(date)}
              {...other}
              slotProps={{
                textField: {
                  error: !!error,
                },
              }}
            />
            {error && <FormHelperText>{error?.message}</FormHelperText>}
          </FormControl>
        </LocalizationProvider>
      )}
    />
  );
};

export default RHFDatePicker;
