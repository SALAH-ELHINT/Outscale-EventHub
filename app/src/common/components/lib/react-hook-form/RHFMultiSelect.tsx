import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { TextField, MenuItem, Checkbox, ListItemText } from '@mui/material';
import { SelectProps } from '@mui/material/Select';

interface Option {
  value: number;
  label: string;
}

interface RHFMultiSelectProps extends Omit<SelectProps, 'value' | 'onChange'> {
  name: string;
  label?: string;
  options: Option[];
}

const RHFMultiSelect = ({ name, label, options, ...other }: RHFMultiSelectProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          select
          fullWidth
          SelectProps={{
            multiple: true,
            renderValue: (selected: number[]) => 
              options
                .filter(option => selected.includes(option.value))
                .map(option => option.label)
                .join(', ')
          }}
          error={!!error}
          helperText={error?.message}
          label={label}
          {...other}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Checkbox checked={field.value.includes(option.value)} />
              <ListItemText primary={option.label} />
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
};

export default RHFMultiSelect;