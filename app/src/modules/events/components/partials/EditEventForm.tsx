import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import {
  alpha,
  Box,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import dayjs from 'dayjs';
import { FileText, MapPin, Tag, Users } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { RHFSelect } from '@common/components/lib/react-hook-form';
import FormProvider from '@common/components/lib/react-hook-form/FormProvider';
import RHFDatePicker from '@common/components/lib/react-hook-form/RHFDatePicker';
import RHFMultiSelect from '@common/components/lib/react-hook-form/RHFMultiSelect';
import RHFTextField from '@common/components/lib/react-hook-form/RHFTextField';
import { Event, EventStatus } from '@modules/events/defs/types';

interface EditEventFormProps {
  event: Event;
  categories: Array<{ id: number; name: string; description?: string }>;
  selectedCategories: number[];
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  isCompleted: boolean;
}

type StatusOption = {
  value: EventStatus;
  label: string;
  color: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
};

const statusOptions: StatusOption[] = [
  { value: 'draft', label: 'Draft', color: 'info' },
  { value: 'published', label: 'Published', color: 'success' },
  { value: 'cancelled', label: 'Cancelled', color: 'error' },
  { value: 'completed', label: 'Completed', color: 'secondary' },
];

const EditEventForm: React.FC<EditEventFormProps> = ({
  event,
  categories,
  selectedCategories,
  onSubmit,
  isSubmitting,
  isCompleted
}) => {
  const theme = useTheme();
  const { t } = useTranslation(['common']);

  
  const createValidationSchema = () => {
    let baseSchema = {
      title: yup.string().required('Title is required').max(255),
      description: yup.string().required('Description is required'),
      location: yup.string().required('Location is required').max(255),
      status: yup.string().required('Status is required').oneOf(['draft', 'published', 'cancelled', 'completed'] as EventStatus[]),
      categories: yup.array().of(yup.number()).min(1, 'Please select at least one category').required('Category is required'),
    };

    
    if (!isCompleted) {
      return yup.object().shape({
        ...baseSchema,
        date: yup.date().required('Date is required'),
        start_time: yup.string().required('Start time is required'),
        end_time: yup.string().required('End time is required').test(
          'is-after-start',
          'End time must be after start time',
          function (value) {
            const { start_time } = this.parent;
            if (!start_time || !value) return true;
            return value > start_time;
          }
        ),
        max_participants: yup.number()
          .required('Maximum participants is required')
          .min(event.participation.current, `Must be at least ${event.participation.current} to accommodate current participants`)
          .transform((value) => (isNaN(value) ? undefined : value)),
        image_id: yup.number().nullable(),
      });
    } else {
      
      return yup.object().shape(baseSchema);
    }
  };

  const validationSchema = createValidationSchema();

  const methods = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      title: event.title,
      description: event.description,
      location: event.location,
      date: event.dateInfo ? dayjs(event.dateInfo.date) : null,
      start_time: event.dateInfo ? event.dateInfo.startTime : '',
      end_time: event.dateInfo ? event.dateInfo.endTime : '',
      max_participants: event.participation ? event.participation.maximum : 1,
      status: event.status,
      image_id: event.image || null, 
      categories: selectedCategories,
    },
  });

  
  useEffect(() => {
    methods.reset({
      title: event.title,
      description: event.description,
      location: event.location,
      date: event.dateInfo ? dayjs(event.dateInfo.date).toDate() : null,
      start_time: event.dateInfo ? event.dateInfo.startTime : '',
      end_time: event.dateInfo ? event.dateInfo.endTime : '',
      max_participants: event.participation ? event.participation.maximum : 1,
      status: event.status,
      image_id: event.image || null,
      categories: selectedCategories,
    });
  }, [event, selectedCategories, methods]);

  const {
    handleSubmit,
    formState: { errors },
    watch,
  } = methods;

  const onSubmitHandler = async (data: any) => {
    await onSubmit(data);
  };

  const categoryOptions = React.useMemo(() => {
    return categories.map((category) => ({
      value: category.id,
      label: category.name,
    }));
  }, [categories]);

  
  const currentStatus = watch('status');
  const isCurrentlyCompleted = currentStatus === 'completed';

  return (
    <FormProvider methods={methods}>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <FileText size={20} />
                <Typography variant="h6">Basic Information</Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Update the main details of your event
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <RHFTextField
                  name="title"
                  label="Event Title"
                  placeholder="Enter a descriptive title"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <RHFTextField
                  name="description"
                  label="Description"
                  multiline
                  rows={4}
                  placeholder="Describe your event"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <MapPin size={20} />
                <Typography variant="h6">Location & Schedule</Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Update where and when your event will take place
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <RHFTextField
                  name="location"
                  label="Location"
                  placeholder="Enter the event location"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    },
                  }}
                />
              </Grid>

              {!isCompleted && (
                <>
                  <Grid item xs={12} md={6}>
                    <RHFDatePicker
                      name="date"
                      label="Event Date"
                        minDate={dayjs()}
                      disabled={isCompleted}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <RHFTextField
                      name="start_time"
                      label="Start Time"
                      type="time"
                      disabled={isCompleted}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <RHFTextField
                      name="end_time"
                      label="End Time"
                      type="time"
                      disabled={isCompleted}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                        },
                      }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Tag size={20} />
                <Typography variant="h6">Additional Details</Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Update the capacity and status of your event
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {!isCompleted && (
                <Grid item xs={12} md={6}>
                  <RHFTextField
                    name="max_participants"
                    label="Maximum Participants"
                    type="number"
                    disabled={isCompleted}
                    InputProps={{
                      inputProps: { 
                        min: event.participation.current,
                      },
                      startAdornment: (
                        <Users
                          size={20}
                          style={{ marginRight: 8, color: theme.palette.text.secondary }}
                        />
                      ),
                    }}
                    helperText={`Current participants: ${event.participation.current}`}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                      },
                    }}
                  />
                </Grid>
              )}
              <Grid item xs={12} md={isCompleted ? 12 : 6}>
                <RHFSelect
                  name="status"
                  label="Status"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                >
                  {statusOptions.map((option) => (
                    <MenuItem
                      key={option.value}
                      value={option.value}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        py: 1.5,
                        '&.Mui-selected': {
                          bgcolor: alpha(theme.palette[option.color].main, 0.1),
                          '&:hover': { bgcolor: alpha(theme.palette[option.color].main, 0.2) },
                        },
                        '&:hover': { bgcolor: alpha(theme.palette[option.color].main, 0.05) },
                      }}
                    >
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: theme.palette[option.color].main,
                          mr: 2,
                          boxShadow: 1,
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {option.label}
                      </Typography>
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>
              <Grid item xs={12}>
                <RHFMultiSelect
                  name="categories"
                  label="Categories"
                  placeholder="Select categories"
                  options={categoryOptions}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      <Divider />

      <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <LoadingButton
            onClick={handleSubmit(onSubmitHandler)}
            variant="contained"
            loading={isSubmitting}
            sx={{
              px: 4,
              py: 1,
              borderRadius: 1,
              boxShadow: theme.shadows[2],
              '&:hover': {
                boxShadow: theme.shadows[4],
              },
            }}
          >
            Save Changes
          </LoadingButton>
        </Stack>
      </Box>
    </FormProvider>
  );
};

export default EditEventForm;