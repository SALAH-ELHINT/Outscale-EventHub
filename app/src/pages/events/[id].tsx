import useAuth from '@modules/auth/hooks/api/useAuth';
import EventDetails from '@modules/events/components/partials/EventDetails';
import { Event } from '@modules/events/defs/types';
import useEvents from '@modules/events/hooks/api/useEvents';
import { Box, CircularProgress, Container, Typography, useTheme } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

const EventDetailsPage = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { readOne, register } = useEvents();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventIdRef = useRef<string | null>(null);

  useEffect(() => {
    const currentId = router.query.id as string;

    if (!currentId || Array.isArray(currentId) || currentId === eventIdRef.current) {
      return;
    }

    const fetchEvent = async () => {
      setLoading(true);
      setError(null);
      eventIdRef.current = currentId;

      try {
        const response = await readOne(parseInt(currentId, 10));
        if (response.success && response.data) {
          setEvent(response.data.item);
        } else {
          setError('Event not found');
        }
      } catch (error) {
        setError('Failed to load event');
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [router.query.id, readOne]);

  const handleRegister = async () => {
    if (!event) return;

    try {
      const response = await register(event.id);
      if (response.success) {
        const updatedEvent = await readOne(event.id);
        if (updatedEvent.success && updatedEvent.data) {
          setEvent(updatedEvent.data.item);
        }
      }
    } catch (error) {
      console.error('Error registering for event:', error);
    }
  };

  const refreshEventData = async () => {
    if (!router.query.id || Array.isArray(router.query.id)) return;

    try {
      const response = await readOne(parseInt(router.query.id, 10));
      if (response.success && response.data) {
        setEvent(response.data.item);
      }
    } catch (error) {
      console.error('Error refreshing event data:', error);
    }
  };

  const handleEventUpdate = (updatedEvent: Event) => {
    setEvent(updatedEvent);
    refreshEventData();
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

  if (error || !event) {
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
            {error || 'Event not found'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            The event you're looking for might have been removed or is temporarily unavailable.
          </Typography>
        </Box>
      </Container>
    );
  }

  const isOrganizer = user?.id === event.organizer?.id;

  return (
    <EventDetails
      event={event}
      isOrganizer={isOrganizer}
      onRegister={handleRegister}
      onEventUpdate={handleEventUpdate}
    />
  );
};

export default EventDetailsPage;
