import { useFormContext, Controller } from 'react-hook-form';
import { MuiTelInput, MuiTelInputCountry, MuiTelInputProps } from 'mui-tel-input';
import { FormControl, FormHelperText } from '@mui/material';

interface PhoneInputProps extends MuiTelInputProps {
  name: string;
  defaultCountry?: MuiTelInputCountry;
  helperText?: string;
}

const RHFPhoneField = ({ name, defaultCountry, helperText, ...other }: PhoneInputProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl fullWidth error={!!error} color="error">
          <MuiTelInput
            {...field}
            value={typeof field.value === 'number' && field.value === 0 ? '' : field.value}
            error={!!error}
            defaultCountry={defaultCountry ?? ('FR' as MuiTelInputCountry)}
            {...other}
          />
          {error && <FormHelperText>{error?.message}</FormHelperText>}
          {!error && helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      )}
    />
  );
};

export default RHFPhoneField;
