import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  useTheme,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  alpha
} from '@mui/material';
import { AlertTriangle, Calendar, Edit2, Trash2, Users } from 'lucide-react';
import { useSnackbar } from 'notistack';

import CustomBreadcrumbs from '@common/components/lib/navigation/CustomBreadCrumbs';
import Routes from '@common/defs/routes';
import useAuth from '@modules/auth/hooks/api/useAuth';
import useEvents from '@modules/events/hooks/api/useEvents';
import { EVENT_LABELS } from '@modules/events/defs/labels';
import { Event } from '@modules/events/defs/types';
import EditEventForm from '@modules/events/components/partials/EditEventForm';
import ParticipantsTable from '@modules/events/components/partials/ParticipantsTable';

const EditEventPage = () => {
  const theme = useTheme();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const { readOne, updateOne, DeleteOne, edit } = useEvents();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use a ref to track the current event ID to prevent redundant API calls
  const eventIdRef = useRef<string | null>(null);

  useEffect(() => {
    const currentId = router.query.id as string;

    if (!currentId || Array.isArray(currentId) || currentId === eventIdRef.current) {
      return;
    }

    const fetchEventData = async () => {
      try {
        setLoading(true);
        const eventId = parseInt(currentId);
        eventIdRef.current = currentId;
        
        const response = await edit(eventId);
        
        if (response.success && response.data) {
          const eventData = response.data.event;
          setEvent(eventData);
          
          if (response.data.categories) {
            setCategories(response.data.categories.all || []);
            setSelectedCategories(response.data.categories.selected || []);
          }
        } else {
          setError('Failed to load event data');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        setError('An error occurred while loading the event');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [router.query.id, edit]);

  useEffect(() => {
    if (!loading && event && user && event.organizer.id !== user.id) {
      enqueueSnackbar('You do not have permission to edit this event', { variant: 'error' });
      router.push(Routes.Events.DETAILS(event.id));
    }
  }, [loading, event, user, router, enqueueSnackbar]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSubmit = async (formData: any) => {
    if (!event) return;
    
    try {
      setIsSubmitting(true);
      
      const data = {
        ...formData,
        date: formData.date instanceof Date 
          ? formData.date.toISOString().split('T')[0] 
          : formData.date,
        categories: formData.categories
      };
      
      if (event.status === 'completed') {
        delete data.date;
        delete data.start_time;
        delete data.end_time;
        delete data.max_participants;
      }
      
      const response = await updateOne(event.id, data, { 
        displaySuccess: true,
        displayProgress: true
      });
      
      if (response.success) {
        enqueueSnackbar('Event updated successfully', { variant: 'success' });
        
        const updatedEvent = await readOne(event.id);
        if (updatedEvent.success && updatedEvent.data) {
          setEvent(updatedEvent.data.item);
        }
      }
    } catch (error) {
      console.error('Error updating event:', error);
      enqueueSnackbar('Failed to update event', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!event) return;
    
    try {
      setIsSubmitting(true);
      const response = await DeleteOne(event.id, { 
        displaySuccess: true,
        displayProgress: true
      });
      
      if (response.success) {
        enqueueSnackbar('Event deleted successfully', { variant: 'success' });
        router.push(Routes.Events.LIST);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      enqueueSnackbar('Failed to delete event', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
      setDeleteDialogOpen(false);
    }
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
            The event you're trying to edit might have been removed or you don't have permission to edit it.
          </Typography>
        </Box>
      </Container>
    );
  }

  const isCompletedEvent = event.status === 'completed';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <CustomBreadcrumbs
        links={[
          { name: 'Dashboard', href: Routes.Common.Home },
          { name: EVENT_LABELS.ITEMS, href: Routes.Events.LIST },
          { name: event.title, href: Routes.Events.DETAILS(event.id) },
          { name: EVENT_LABELS.EDIT_ONE },
        ]}
      />

      <Box sx={{ mb: 4, mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Edit2
              size={28}
              style={{
                marginRight: theme.spacing(1),
                color: theme.palette.primary.main,
              }}
            />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {EVENT_LABELS.EDIT_ONE}
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<Trash2 size={18} />}
            onClick={() => setDeleteDialogOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Delete Event
          </Button>
        </Box>
        
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            maxWidth: 600,
            mb: 2
          }}
        >
          Update your event details below. Fields marked with an asterisk (*) are required.
        </Typography>
        
        {isCompletedEvent && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <AlertTriangle size={24} color={theme.palette.warning.main} />
            <Typography>
              This event is marked as completed. You can only edit the title, description, status, location, and categories.
            </Typography>
          </Paper>
        )}
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              px: 3,
              pt: 2,
              '& .MuiTab-root': {
                textTransform: 'none',
                minHeight: 48,
                fontSize: '0.975rem',
              }
            }}
          >
            <Tab icon={<Calendar size={18} />} label="Event Details" iconPosition="start" />
            <Tab icon={<Users size={18} />} label="Participants" iconPosition="start" />
          </Tabs>
        </Box>

        <Divider />

        <Box sx={{ p: 0 }}>
          {tabValue === 0 && (
            <EditEventForm 
              event={event} 
              categories={categories}
              selectedCategories={selectedCategories}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              isCompleted={isCompletedEvent}
            />
          )}
          
          {tabValue === 1 && (
            <ParticipantsTable eventId={event.id} />
          )}
        </Box>
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Event Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this event? This action cannot be undone and all registrations will be canceled.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteEvent} 
            color="error" 
            disabled={isSubmitting}
            variant="contained"
          >
            Delete Event
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EditEventPage;