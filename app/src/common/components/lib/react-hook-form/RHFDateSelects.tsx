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
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

interface Props {
  name: string;
  helperText?: string;
  label?: string;
  sx?: SxProps<Theme>;
  startYear?: number;
  endYear?: number;
  sortYear?: 'desc' | 'asc';
}

const RHFDateSelects = (props: Props) => {
  const {
    name,
    helperText,
    label,
    sx,
    startYear = 1970,
    endYear = new Date().getFullYear(),
    sortYear = 'asc',
  } = props;

  const { control, watch, setValue } = useFormContext();
  const { t } = useTranslation(['common']);
  const [day, setDay] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const value = watch(name);
  const daysOptions = Array.from({ length: 31 }, (_, i) => i + 1).map((day) => ({
    value: day.toString().padStart(2, '0'),
    label: day.toString().padStart(2, '0'),
  }));
  const monthsOptions = Array.from({ length: 12 }, (_, i) => i + 1).map((month) => ({
    value: month.toString().padStart(2, '0'),
    label: month.toString().padStart(2, '0'),
  }));
  const yearsRange = Array.from({ length: endYear - startYear + 1 }, (_, i) => i + startYear);
  const yearsOptions = sortYear === 'desc' ? yearsRange.reverse() : yearsRange;

  useEffect(() => {
    if (value) {
      // Compute days, month and year from dayjs date
      const day = value.format('DD');
      const month = value.format('MM');
      const year = value.format('YYYY');
      setDay(day);
      setMonth(month);
      setYear(year);
    }
  }, []);

  useEffect(() => {
    if (day && month && year) {
      const date = dayjs(`${year}-${month}-${day}`);
      setValue(name, date);
    }
  }, [day, month, year]);

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
                sx={{ typography: 'h6', marginBottom: 1, color: 'black' }}
              >
                {label}
              </FormLabel>
            )}
            <Stack direction="row" gap={1}>
              <Select
                type="number"
                value={day}
                sx={{ width: ['100%', '95px'] }}
                MenuProps={{
                  disableScrollLock: true,
                  sx: {
                    maxHeight: '300px',
                  },
                }}
                displayEmpty
                onChange={(e) => {
                  const value = e.target.value;
                  setDay(value);
                }}
              >
                <MenuItem disabled value="">
                  <em>{t('common:day')}</em>
                </MenuItem>
                {daysOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              <Select
                type="number"
                value={month}
                sx={{ width: ['100%', '95px'] }}
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
              <Select
                type="number"
                value={year}
                sx={{ width: ['100%', '95px'] }}
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

export default RHFDateSelects;
