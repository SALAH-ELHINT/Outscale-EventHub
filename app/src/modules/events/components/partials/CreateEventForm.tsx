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
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

import { RHFSelect } from '@common/components/lib/react-hook-form';
import FormProvider from '@common/components/lib/react-hook-form/FormProvider';
import RHFDatePicker from '@common/components/lib/react-hook-form/RHFDatePicker';
import RHFMultiSelect from '@common/components/lib/react-hook-form/RHFMultiSelect';
import RHFTextField from '@common/components/lib/react-hook-form/RHFTextField';
import { EventStatus } from '@modules/events/defs/types';
import useEvents from '@modules/events/hooks/api/useEvents';

interface CreateEventFormProps {
  onSubmit: (data: CreateEventFormData) => Promise<void>;
}

interface Category {
  id: number;
  name: string;
}

type StatusOption = {
  value: EventStatus;
  label: string;
  color: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
};

const statusOptions: StatusOption[] = [
  { value: 'draft', label: 'Draft', color: 'info' },
  { value: 'published', label: 'Published', color: 'success' },
];

const validationSchema = yup.object().shape({
  title: yup.string().required('Title is required').max(255),
  description: yup.string().required('Description is required'),
  location: yup.string().required('Location is required').max(255),
  date: yup.date().required('Date is required').min(new Date(), 'Date must be in the future'),
  start_time: yup.string().required('Start time is required'),
  end_time: yup
    .string()
    .required('End time is required')
    .test('is-after-start', 'End time must be after start time', function (value) {
      const { start_time } = this.parent;
      if (!start_time || !value) return true;
      return value > start_time;
    }),
  max_participants: yup
    .number()
    .required('Maximum participants is required')
    .min(1, 'Must allow at least 1 participant'),
  status: yup
    .string()
    .required('Status is required')
    .oneOf(['draft', 'published'] as EventStatus[]),
  image_id: yup.number().nullable(),
  categories: yup
    .array()
    .of(yup.number())
    .min(1, 'Please select at least one category')
    .required('Category is required'),
});

export type CreateEventFormData = {
  title: string;
  description: string;
  location: string;
  date: Date | null;
  start_time: string;
  end_time: string;
  max_participants: number;
  status: EventStatus;
  image_id: number | null;
  categories: number[];
};

const CreateEventForm: React.FC<CreateEventFormProps> = ({ onSubmit }) => {
  const theme = useTheme();
  const { t } = useTranslation(['common']);
  const { categories } = useEvents();
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const stableCategories = React.useCallback(categories, []);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await stableCategories();
        if (response.success) {
          setCategoriesData(response.data.items);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [stableCategories]);

  const methods = useForm<CreateEventFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      date: null,
      start_time: '',
      end_time: '',
      max_participants: 1,
      status: 'draft',
      image_id: null,
      categories: [],
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmitHandler = async (data: CreateEventFormData, event?: React.BaseSyntheticEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const categoryOptions = React.useMemo(() => {
    return categoriesData.map((category: Category) => ({
      value: category.id,
      label: category.name,
    }));
  }, [categoriesData]);

  return (
    <FormProvider methods={methods}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
        }}
      >
        <form onSubmit={handleSubmit(onSubmitHandler)} noValidate>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <FileText size={20} />
                    <Typography variant="h6">Basic Information</Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Enter the main details of your event
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
                    Set where and when your event will take place
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
                  <Grid item xs={12} md={6}>
                    <RHFDatePicker
                      name="date"
                      label="Event Date"
                      minDate={dayjs()}
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
                      InputLabelProps={{ shrink: true }}
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
                    <Tag size={20} />
                    <Typography variant="h6">Additional Details</Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Set the capacity and status of your event
                  </Typography>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      name="max_participants"
                      label="Maximum Participants"
                      type="number"
                      InputProps={{
                        inputProps: { min: 1 },
                        startAdornment: (
                          <Users
                            size={20}
                            style={{ marginRight: 8, color: theme.palette.text.secondary }}
                          />
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
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
                type="submit"
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
                Create Event
              </LoadingButton>
            </Stack>
          </Box>
        </form>
      </Paper>
    </FormProvider>
  );
};

export default CreateEventForm;
