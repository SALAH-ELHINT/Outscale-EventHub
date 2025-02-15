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

interface Props {
  name: string;
  helperText?: string;
  label?: string;
  sx?: SxProps<Theme>;
  size?: 'small' | 'medium';
  startYear?: number;
  endYear?: number;
  sortYear?: 'desc' | 'asc';
}

const RHFYearSelect = (props: Props) => {
  const {
    name,
    helperText,
    label,
    sx,
    size,
    startYear = 1970,
    endYear = new Date().getFullYear(),
    sortYear = 'asc',
  } = props;
  const { control, watch, setValue } = useFormContext();
  const { t } = useTranslation(['common']);
  const [year, setYear] = useState<string>('');
  const value = watch(name);
  const yearsRange = Array.from({ length: endYear - startYear + 1 }, (_, i) => i + startYear);
  const yearsOptions = sortYear === 'desc' ? yearsRange.reverse() : yearsRange;
  useEffect(() => {
    if (value) {
      setYear(value);
    }
  }, []);

  useEffect(() => {
    if (year) {
      setValue(name, year);
    }
  }, [year]);

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
                value={year}
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
                  setYear(value);
                }}
              >
                <MenuItem disabled value="">
                  <em>{t('common:year')}</em>
                </MenuItem>
                {yearsOptions.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
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

export default RHFYearSelect;
