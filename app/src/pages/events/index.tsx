import {
  alpha,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Calendar, Crown, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CustomBreadcrumbs from '@common/components/lib/navigation/CustomBreadCrumbs';
import Routes from '@common/defs/routes';
import useAuth from '@modules/auth/hooks/api/useAuth';
import EventCard from '@modules/events/components/partials/EventCard';
import { EVENT_LABELS } from '@modules/events/defs/labels';
import { Event } from '@modules/events/defs/types';
import useEvents from '@modules/events/hooks/api/useEvents';

const EventsPage = () => {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const { items: events = [], readAll } = useEvents({ fetchItems: true });

  const filteredEvents = useMemo(() => {
    if (!events?.length) return [];

    return events.filter((event: Event) => {
      const searchLower = searchQuery.toLowerCase();
      const titleMatch = event.title?.toLowerCase().includes(searchLower) || false;
      const locationMatch = event.location?.toLowerCase().includes(searchLower) || false;
      return titleMatch || locationMatch;
    });
  }, [events, searchQuery]);

  const myEvents = useMemo(() => {
    if (!filteredEvents.length || !user?.id) return [];

    return filteredEvents.filter((event: Event) => event.organizer?.id === user.id);
  }, [filteredEvents, user]);

  const upcomingEvents = useMemo(() => {
    if (!filteredEvents.length) return [];

    return filteredEvents.filter((event: Event) => {
      if (!event.dateInfo?.date) return false;

      try {
        const eventDate = new Date(event.dateInfo.date);
        return eventDate >= new Date();
      } catch {
        return false;
      }
    });
  }, [filteredEvents]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateClick = () => {
    if (!user) {
      enqueueSnackbar('Please login to create an event', {
        variant: 'warning',
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
      });
      router.push(Routes.Auth.Login);
      return;
    }
    router.push(Routes.Events.CREATE);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress
          size={40}
          sx={{
            color: theme.palette.primary.main,
          }}
        />
      </Box>
    );
  }

  if (error || !events) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 2,
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, color: theme.palette.error.main }}>
            {error || 'An error occurred while fetching events'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please try again later or contact support
          </Typography>
        </Box>
      </Container>
    );
  }

  const displayEvents = tabValue === 0 ? upcomingEvents : myEvents;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <CustomBreadcrumbs
        links={[{ name: 'Dashboard', href: Routes.Common.Home }, { name: EVENT_LABELS.ITEMS }]}
      />

      <Stack spacing={4} sx={{ mt: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Stack spacing={1}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {t(`${EVENT_LABELS.ITEMS}`)}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Discover and join exciting events in your area
            </Typography>
          </Stack>
          {user && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Plus size={20} />}
              onClick={handleCreateClick}
              size="large"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                boxShadow: theme.shadows[2],
                '&:hover': {
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              {t(`${EVENT_LABELS.CREATE_NEW_ONE}`)}
            </Button>
          )}
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'background.default',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                minHeight: 48,
                '& .MuiTab-root': {
                  minHeight: 48,
                  textTransform: 'none',
                  fontSize: '0.975rem',
                },
              }}
            >
              <Tab icon={<Calendar size={18} />} label="Upcoming Events" iconPosition="start" />
              {user && <Tab icon={<Crown size={18} />} label="My Events" iconPosition="start" />}
            </Tabs>

            <TextField
              placeholder="Search events..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: { xs: '100%', sm: 280 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                },
              }}
            />
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {displayEvents.map((event) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={event.id}>
              <EventCard
                event={event}
                isOwner={Boolean(user?.id && event.organizer?.id === user.id)}
                onClick={() => router.push(Routes.Events.DETAILS(event.id))}
              />
            </Grid>
          ))}

          {!displayEvents.length && (
            <Grid item xs={12}>
              <Box
                sx={{
                  width: '100%',
                  py: 8,
                  textAlign: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  {tabValue === 0
                    ? 'No upcoming events found'
                    : "You haven't created any events yet"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    mt: 1,
                  }}
                >
                  {tabValue === 0
                    ? 'Check back later for new events'
                    : 'Click the create button to get started'}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Stack>
    </Container>
  );
};

export default EventsPage;
