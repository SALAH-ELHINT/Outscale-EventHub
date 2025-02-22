import { Box, Container, Typography, useTheme } from '@mui/material';
import { Calendar } from 'lucide-react';
import { useRouter } from 'next/router';

import CustomBreadcrumbs from '@common/components/lib/navigation/CustomBreadCrumbs';
import Routes from '@common/defs/routes';
import CreateEventForm from '@modules/events/components/partials/CreateEventForm';
import { EVENT_LABELS } from '@modules/events/defs/labels';
import useEvents from '@modules/events/hooks/api/useEvents';

const CreateEventPage = () => {
  const theme = useTheme();
  const router = useRouter();
  const { createOne } = useEvents();

  const handleSubmit = async (data: any) => {
    try {
      const transformedData = {
        ...data,
        date: data.date?.toDate() || null,
      };
  
      const response = await createOne(transformedData, { displaySuccess: true });
      if (response.success) {
        await router.push(Routes.Events.LIST);
      }
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <CustomBreadcrumbs
        links={[
          { name: 'Dashboard', href: Routes.Common.Home },
          { name: EVENT_LABELS.ITEMS, href: Routes.Events.LIST },
          { name: EVENT_LABELS.NEW_ONE },
        ]}
      />

      <Box sx={{ mb: 4, mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Calendar
            size={28}
            style={{
              marginRight: theme.spacing(1),
              color: theme.palette.primary.main,
            }}
          />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {EVENT_LABELS.NEW_ONE}
          </Typography>
        </Box>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            maxWidth: 600,
          }}
        >
          Create a new event by filling out the form below. All fields marked with an asterisk (*)
          are required.
        </Typography>
      </Box>

      <CreateEventForm onSubmit={handleSubmit} />
    </Container>
  );
};

export default CreateEventPage;