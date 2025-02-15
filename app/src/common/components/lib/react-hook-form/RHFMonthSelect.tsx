import { useFormContext, Controller } from 'react-hook-form';
import {
  MenuItem,
  Select,
  Stack,
  FormLabel,
  FormHelperText,
  Box,
  SxProps,
  Theme,
} from '@mui/material';
import 'dayjs/locale/fr';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const monthsOptions = Array.from({ length: 12 }, (_, i) => i + 1).map((month) => ({
  value: month,
  label: month.toString().padStart(2, '0'),
}));

interface Props {
  name: string;
  helperText?: string;
  label?: string;
  sx?: SxProps<Theme>;
  size?: 'small' | 'medium';
}

const RHFMonthSelect = (props: Props) => {
  const { name, helperText, label, sx, size } = props;
  const { control, watch, setValue } = useFormContext();
  const { t } = useTranslation(['common']);
  const [month, setMonth] = useState<string>('');
  const value = watch(name);
  useEffect(() => {
    if (value) {
      setMonth(value);
    }
  }, []);

  useEffect(() => {
    if (month) {
      setValue(name, month);
    }
  }, [month]);

  const labelId = label ? `${name}-${label}` : '';

  return (
    <Controller
      name={name}
      control={control}
      render={({ fieldState: { error } }) => (
        <>
          <Box sx={sx}>
            {label && (
              <FormLabel
                component="legend"
                id={labelId}
                sx={{ typography: 'body2', marginBottom: 1 }}
              >
                {label}
              </FormLabel>
            )}
            <Stack direction="row" gap={1}>
              <Select
                type="number"
                value={month}
                sx={{ width: '100%' }}
                size={size}
                MenuProps={{
                  disableScrollLock: true,
                  sx: {
                    maxHeight: '300px',
                  },
                }}
                displayEmpty
                onChange={(e) => {
                  const value = e.target.value;
                  setMonth(value);
                }}
              >
                <MenuItem disabled value="">
                  <em>{t('common:month')}</em>
                </MenuItem>
                {monthsOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </Stack>

            {(!!error || helperText) && (
              <FormHelperText error={!!error} sx={{ mx: 0 }}>
                {error ? error?.message : helperText}
              </FormHelperText>
            )}
          </Box>
        </>
      )}
    />
  );
};

export default RHFMonthSelect;
