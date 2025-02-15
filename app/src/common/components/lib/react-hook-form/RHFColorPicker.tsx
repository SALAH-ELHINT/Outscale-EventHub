import { useFormContext, Controller } from 'react-hook-form';
import { TextField, TextFieldProps } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';
import { useRef } from 'react';
import { useTheme } from '@mui/material/styles';

type Props = TextFieldProps & {
  name: string;
};

const RHFColorPicker = ({ name, helperText, ...other }: Props) => {
  const { control } = useFormContext();
  const colorInputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <>
          <TextField
            {...field}
            fullWidth
            value={typeof field.value === 'number' && field.value === 0 ? '' : field.value}
            error={!!error}
            helperText={error ? error?.message : helperText}
            {...other}
            type="text"
            onClick={() => colorInputRef.current?.click()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box
                    sx={{
                      padding: 0,
                      height: 30,
                      width: 30,
                      borderRadius: '50%',
                      backgroundColor: field.value,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={() => colorInputRef.current?.click()}
                  >
                    <input
                      ref={colorInputRef}
                      type="color"
                      id="head"
                      name="head"
                      value={
                        typeof field.value === 'number' && field.value === 0 ? '' : field.value
                      }
                      onChange={(value) => field.onChange(value)}
                      style={{
                        visibility: 'hidden',
                        position: 'absolute',
                        left: 0,
                        bottom: 0,
                        width: '100%',
                        marginTop: theme.spacing(1),
                      }}
                    />
                  </Box>
                </InputAdornment>
              ),
            }}
          />
        </>
      )}
    />
  );
};

export default RHFColorPicker;
