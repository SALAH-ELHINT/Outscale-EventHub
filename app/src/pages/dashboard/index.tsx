import StatCard from '@common/components/ui/statCard';
import Routes from '@common/defs/routes';
import { DashboardFilters, DashboardStatistics, EventStatus } from '@common/defs/types';
import EventCard from '@modules/events/components/partials/EventCard';
import { Event } from '@modules/events/defs/types';
import useEvents from '@modules/events/hooks/api/useEvents';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Crown,
  Heart,
  Plus,
  Search,
  TimerOff,
  Trophy,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const statusIcons = {
  draft: AlertCircle,
  published: CheckCircle,
  completed: Trophy,
  cancelled: TimerOff,
};

export default function Dashboard() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation(['dashboard']);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<{
    organizedEvents: Event[];
    registeredEvents: Event[];
  }>({
    organizedEvents: [],
    registeredEvents: [],
  });
  const [filters, setFilters] = useState<DashboardFilters>({
    status: 'all',
    search: '',
    participantStatus: 'all',
  });

  const events = useEvents();

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsResponse, upcomingResponse] = await Promise.all([
        events.getEventStatistics(),
        events.getUpcomingEvents(),
      ]);
  
      if (statsResponse.success && upcomingResponse.success) {
        setStatistics(statsResponse.data);
        setUpcomingEvents({
          organizedEvents: upcomingResponse.data.organizedEvents || [],
          registeredEvents: upcomingResponse.data.registeredEvents || [],
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCreateEvent = () => {
    router.push(Routes.Events.CREATE);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="700" gutterBottom>
          Dashboard
        </Typography>
        <Typography color="text.secondary">
          Manage your events and check your participation statistics
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Events"
            value={statistics?.organized.total_events || 0}
            icon={Calendar}
            trend={10}
            trendLabel="from last month"
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Participants"
            value={statistics?.organized.total_participants || 0}
            icon={Users}
            trend={5}
            trendLabel="from last month"
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Events Attended"
            value={statistics?.participation.attended_events || 0}
            icon={CheckCircle}
            trend={-2}
            trendLabel="from last month"
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Registrations"
            value={statistics?.participation.pending_registrations || 0}
            icon={Clock}
            trend={3}
            trendLabel="from last month"
            color={theme.palette.warning.main}
          />
        </Grid>
      </Grid>

      <Paper sx={{ mb: 4, p: 2, borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab icon={<Crown size={18} />} label="My Events" iconPosition="start" />
            <Tab icon={<Heart size={18} />} label="Registered Events" iconPosition="start" />
            <Tab icon={<Calendar size={18} />} label="Upcoming Events" iconPosition="start" />
          </Tabs>
        </Box>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search events..."
              value={filters.search}
              onChange={(e) => setFilters((prev: any) => ({ ...prev, search: e.target.value }))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Select
              fullWidth
              size="small"
              value={filters.status}
              onChange={(e) =>
                setFilters((prev: any) => ({ ...prev, status: e.target.value as EventStatus }))
              }
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              startIcon={<Plus size={20} />}
              onClick={handleCreateEvent}
              sx={{ px: 3, py: 1 }}
            >
              Create Event
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {activeTab === 0 &&
          upcomingEvents.organizedEvents.map((event) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={event.id}>
              <EventCard
                event={event}
                isOwner={true}
                onClick={() => router.push(Routes.Events.DETAILS(event.id))}
              />
            </Grid>
          ))}

        {activeTab === 1 &&
          upcomingEvents.registeredEvents.map((event) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={event.id}>
              <EventCard
                event={event}
                isOwner={false}
                onClick={() => router.push(Routes.Events.DETAILS(event.id))}
              />
            </Grid>
          ))}

        {((activeTab === 0 && !upcomingEvents.organizedEvents.length) ||
          (activeTab === 1 && !upcomingEvents.registeredEvents.length)) && (
          <Grid item xs={12}>
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                px: 2,
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                No events found
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                {activeTab === 0
                  ? "You haven't created any events yet"
                  : "You haven't registered for any events yet"}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Plus size={20} />}
                onClick={handleCreateEvent}
              >
                Create your first event
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
