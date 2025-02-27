import StatCard from '@common/components/ui/statCard';
import Routes from '@common/defs/routes';
import {
  DashboardFilters,
  DashboardStatistics,
  EventStatus,
  ParticipantStatus,
} from '@common/defs/types';
import EventCard from '@modules/events/components/partials/EventCard';
import { Event } from '@modules/events/defs/types';
import useEvents from '@modules/events/hooks/api/useEvents';
import {
  StatisticRow,
  MessageSquare,
  Star,
  Rating,
} from '@modules/events/components/partials/DashboardUIComponents';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { parseISO, format, isValid } from 'date-fns';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Crown,
  Heart,
  PieChart,
  Plus,
  RefreshCw,
  Search,
  TimerOff,
  Trophy,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const statusIcons = {
  draft: AlertCircle,
  published: CheckCircle,
  completed: Trophy,
  cancelled: TimerOff,
};

const participantStatusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'attended', label: 'Attended' },
];

const eventStatusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

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
    recentlyUpdatedEvents: Event[];
  }>({
    organizedEvents: [],
    registeredEvents: [],
    recentlyUpdatedEvents: [],
  });
  const [participantEvents, setParticipantEvents] = useState<Event[]>([]);
  const [activitySummary, setActivitySummary] = useState<{
    recentRegistrations: any[];
    recentComments: any[];
    recentRatings: any[];
  }>({
    recentRegistrations: [],
    recentComments: [],
    recentRatings: [],
  });
  const [filters, setFilters] = useState<DashboardFilters>({
    status: 'all',
    search: '',
    participantStatus: 'all',
  });
  const [participantEventsPage, setParticipantEventsPage] = useState(1);
  const [participantEventsTotal, setParticipantEventsTotal] = useState(0);
  const [participantEventsLoading, setParticipantEventsLoading] = useState(false);

  const events = useEvents();

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsResponse, upcomingResponse, activityResponse] = await Promise.all([
        events.getEventStatistics(),
        events.getUpcomingEvents(),
        events.getActivitySummary(),
      ]);

      if (statsResponse.success) {
        setStatistics(statsResponse.data);
      }

      if (upcomingResponse.success) {
        setUpcomingEvents({
          organizedEvents: upcomingResponse.data.organizedEvents || [],
          registeredEvents: upcomingResponse.data.registeredEvents || [],
          recentlyUpdatedEvents: upcomingResponse.data.recentlyUpdatedEvents || [],
        });
      }

      if (activityResponse.success) {
        setActivitySummary({
          recentRegistrations: activityResponse.data.recentRegistrations || [],
          recentComments: activityResponse.data.recentComments || [],
          recentRatings: activityResponse.data.recentRatings || [],
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
    setLoading(false);
  }, []);

  const fetchParticipantEvents = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setParticipantEventsPage(1);
      }

      setParticipantEventsLoading(true);
      try {
        const page = refresh ? 1 : participantEventsPage;

        const filterParams = {
          page,
          perPage: 8,
          search: filters.search,
          eventStatus: filters.status !== 'all' ? filters.status : undefined,
          participantStatus:
            filters.participantStatus !== 'all' ? filters.participantStatus : undefined,
        };

        const response = await events.getAllParticipantEvents(filterParams);

        if (response.success) {
          if (refresh) {
            setParticipantEvents(response.data.items);
          } else {
            setParticipantEvents((prev) => [...prev, ...response.data.items]);
          }
          setParticipantEventsTotal(response.data.meta.totalItems);
          setParticipantEventsPage(response.data.meta.currentPage + 1);
        }
      } catch (error) {
        console.error('Error fetching participant events:', error);
      }
      setParticipantEventsLoading(false);
    },
    [events, filters.search, filters.status, filters.participantStatus, participantEventsPage]
  );

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 2) {
      const debounceTimer = setTimeout(() => {
        fetchParticipantEvents(true);
      }, 300);

      return () => clearTimeout(debounceTimer);
    }
  }, [activeTab, filters.search, filters.status, filters.participantStatus]);

  const handleCreateEvent = () => {
    router.push(Routes.Events.CREATE);
  };

  const handleTabChange = (_: any, newValue: any) => {
    setActiveTab(newValue);
  };

  const handleFilterChange = (field: any, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLoadMore = () => {
    if (participantEvents.length < participantEventsTotal) {
      fetchParticipantEvents();
    }
  };

  const renderEmptyState = (type: any) => (
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
          {type === 'organized'
            ? "You haven't created any events yet"
            : type === 'registered'
            ? "You haven't registered for any events yet"
            : 'No events match your current filters'}
        </Typography>
        <Button variant="contained" startIcon={<Plus size={20} />} onClick={handleCreateEvent}>
          Create your first event
        </Button>
      </Box>
    </Grid>
  );

  const displayedEvents = useMemo(() => {
    switch (activeTab) {
      case 0:
        return upcomingEvents.organizedEvents;
      case 1:
        return upcomingEvents.registeredEvents;
      case 2:
        return participantEvents;
      case 3:
        return upcomingEvents.recentlyUpdatedEvents;
      default:
        return [];
    }
  }, [activeTab, upcomingEvents, participantEvents]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const safeParseDateString = (dateInput: any): Date => {
    if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
      return dateInput;
    }

    if (dateInput == null) {
      return new Date();
    }

    const dateString = String(dateInput).trim();

    try {
      const parsedDate = parseISO(dateString);
      if (isValid(parsedDate)) {
        return parsedDate;
      }

      const fallbackDate = new Date(dateString);
      if (isValid(fallbackDate)) {
        return fallbackDate;
      }
    } catch (error) {
      console.warn('Date parsing error:', error);
    }

    return new Date();
  };

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
            title="Total Events Organized"
            value={statistics?.organized.totalEvents || 0}
            icon={Calendar}
            trend={statistics?.organized.thisMonthCreations || 0}
            trendLabel="this month"
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Participants"
            value={statistics?.organized.totalParticipants || 0}
            icon={Users}
            trend={5}
            trendLabel="from last month"
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Events Attended"
            value={statistics?.participation.attendedEvents || 0}
            icon={CheckCircle}
            trend={-2}
            trendLabel="from last month"
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Registrations"
            value={statistics?.participation.totalRegistrations || 0}
            icon={Clock}
            trend={statistics?.participation.thisMonthRegistrations || 0}
            trendLabel="this month"
            color={theme.palette.warning.main}
          />
        </Grid>
      </Grid>

      <Paper sx={{ mb: 4, p: 2, borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<Crown size={18} />} label="My Events" iconPosition="start" />
            <Tab icon={<Heart size={18} />} label="Registered Events" iconPosition="start" />
            <Tab icon={<Users size={18} />} label="All Participant Events" iconPosition="start" />
            <Tab icon={<RefreshCw size={18} />} label="Recently Updated" iconPosition="start" />
            <Tab icon={<PieChart size={18} />} label="Activity" iconPosition="start" />
          </Tabs>
        </Box>

        {activeTab !== 4 && (
          <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search events..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Select
                fullWidth
                size="small"
                displayEmpty
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                {eventStatusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            {activeTab === 2 && (
              <Grid item xs={12} sm={6} md={3}>
                <Select
                  fullWidth
                  size="small"
                  displayEmpty
                  value={filters.participantStatus}
                  onChange={(e) => handleFilterChange('participantStatus', e.target.value)}
                >
                  {participantStatusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            )}
            <Grid item xs={12} md={activeTab === 2 ? 2 : 5} sx={{ textAlign: 'right' }}>
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
        )}

        {activeTab !== 4 && (
          <Grid container spacing={3}>
            {displayedEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={event.id}>
                <EventCard
                  event={event}
                  isOwner={event.userInteraction?.isOrganizer || false}
                  onClick={() => router.push(Routes.Events.DETAILS(event.id))}
                />
              </Grid>
            ))}

            {displayedEvents.length === 0 &&
              renderEmptyState(
                activeTab === 0 ? 'organized' : activeTab === 1 ? 'registered' : 'filtered'
              )}

            {activeTab === 2 &&
              participantEvents.length > 0 &&
              participantEvents.length < participantEventsTotal && (
                <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleLoadMore}
                    disabled={participantEventsLoading}
                    startIcon={participantEventsLoading ? <CircularProgress size={20} /> : null}
                  >
                    Load More Events
                  </Button>
                </Grid>
              )}
          </Grid>
        )}

        {activeTab === 4 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <Users size={20} />
                    Recent Registrations
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <List disablePadding>
                    {activitySummary.recentRegistrations.slice(0, 5).map((item, index) => (
                      <ListItem
                        key={item.id}
                        disablePadding
                        sx={{
                          py: 1,
                          borderBottom: index < 4 ? `1px solid ${theme.palette.divider}` : 'none',
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                            {item.user_email?.[0].toUpperCase() || 'U'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.user_email}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                {item.event_title}
                              </Typography>
                              <br />
                              <Typography component="span" variant="caption" color="text.secondary">
                                {(() => {
                                  try {
                                    const dateString =
                                      typeof item.createdAt === 'string'
                                        ? item.createdAt
                                        : String(item.createdAt || '');

                                    const parsedDate = safeParseDateString(dateString);
                                    return isValid(parsedDate)
                                      ? format(parsedDate, 'MMM d, yyyy')
                                      : 'Invalid Date';
                                  } catch (error) {
                                    console.error('Date rendering error:', error);
                                    return 'Invalid Date';
                                  }
                                })()}
                              </Typography>

                              <Chip
                                size="small"
                                label={item.status}
                                sx={{ ml: 1 }}
                                color={
                                  item.status === 'confirmed'
                                    ? 'success'
                                    : item.status === 'pending'
                                    ? 'warning'
                                    : item.status === 'attended'
                                    ? 'info'
                                    : 'default'
                                }
                              />
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                    {activitySummary.recentRegistrations.length === 0 && (
                      <Box sx={{ py: 2, textAlign: 'center' }}>
                        <Typography color="text.secondary">No recent registrations</Typography>
                      </Box>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <MessageSquare size={20} />
                    Recent Comments
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <List disablePadding>
                    {activitySummary.recentComments.slice(0, 5).map((item, index) => (
                      <ListItem
                        key={item.id}
                        disablePadding
                        sx={{
                          py: 1,
                          borderBottom: index < 4 ? `1px solid ${theme.palette.divider}` : 'none',
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                            {item.user_email?.[0].toUpperCase() || 'U'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {item.content}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography component="span" variant="caption" color="text.secondary">
                                {item.user_email} on "{item.event_title}"
                              </Typography>
                              <br />
                              <Typography component="span" variant="caption" color="text.secondary">
                                {format(
                                  isValid(parseISO(item.createdAt))
                                    ? parseISO(item.createdAt)
                                    : new Date(),
                                  'MMM d, yyyy'
                                )}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                    {activitySummary.recentComments.length === 0 && (
                      <Box sx={{ py: 2, textAlign: 'center' }}>
                        <Typography color="text.secondary">No recent comments</Typography>
                      </Box>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <Star size={20} />
                    Recent Ratings
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <List disablePadding>
                    {activitySummary.recentRatings.slice(0, 5).map((item, index) => (
                      <ListItem
                        key={item.id}
                        disablePadding
                        sx={{
                          py: 1,
                          borderBottom: index < 4 ? `1px solid ${theme.palette.divider}` : 'none',
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                            {item.user_email?.[0].toUpperCase() || 'U'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography component="span" variant="body2" sx={{ mr: 1 }}>
                                Rating: {item.rating}/5
                              </Typography>
                              <Rating value={item.rating} readOnly size="small" />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography component="span" variant="caption">
                                {item.user_email} for "{item.event_title}"
                              </Typography>
                              <br />
                              <Typography component="span" variant="caption" color="text.secondary">
                                {(() => {
                                  try {
                                    const dateString =
                                      typeof item.created_at === 'string'
                                        ? item.created_at
                                        : String(item.created_at || '');

                                    const parsedDate = safeParseDateString(dateString);
                                    return isValid(parsedDate)
                                      ? format(parsedDate, 'MMM d, yyyy')
                                      : 'Invalid Date';
                                  } catch (error) {
                                    console.error('Date rendering error:', error);
                                    return 'Invalid Date';
                                  }
                                })()}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                    {activitySummary.recentRatings.length === 0 && (
                      <Box sx={{ py: 2, textAlign: 'center' }}>
                        <Typography color="text.secondary">No recent ratings</Typography>
                      </Box>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Events Overview
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Organization Statistics
            </Typography>
            <Stack spacing={2}>
              <StatisticRow
                label="Published Events"
                value={statistics?.organized.publishedEvents || 0}
                total={statistics?.organized.totalEvents || 0}
                color={theme.palette.success.main}
              />
              <StatisticRow
                label="Draft Events"
                value={statistics?.organized.draftEvents || 0}
                total={statistics?.organized.totalEvents || 0}
                color={theme.palette.warning.main}
              />
              <StatisticRow
                label="Completed Events"
                value={statistics?.organized.completedEvents || 0}
                total={statistics?.organized.totalEvents || 0}
                color={theme.palette.info.main}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Participation Statistics
            </Typography>
            <Stack spacing={2}>
              <StatisticRow
                label="Confirmed Registrations"
                value={statistics?.participation.confirmedRegistrations || 0}
                total={statistics?.participation.totalRegistrations || 0}
                color={theme.palette.success.main}
              />
              <StatisticRow
                label="Pending Registrations"
                value={statistics?.participation.pendingRegistrations || 0}
                total={statistics?.participation.totalRegistrations || 0}
                color={theme.palette.warning.main}
              />
              <StatisticRow
                label="Attended Events"
                value={statistics?.participation.attendedEvents || 0}
                total={statistics?.participation.totalRegistrations || 0}
                color={theme.palette.info.main}
              />
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
