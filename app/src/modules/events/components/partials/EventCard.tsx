import React from 'react';
import { 
  Card, 
  CardContent, 
  CardActionArea,
  Typography, 
  Box, 
  Chip,
  Avatar,
  LinearProgress,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { format } from 'date-fns';
import { MapPin, Clock, Users, Crown } from 'lucide-react';
import { Event, EventStatus } from '@modules/events/defs/types';

interface EventCardProps {
  event: Event;
  isOwner: boolean;
  onClick: () => void;
}

const getStatusColor = (status: EventStatus) => {
  const colors = {
    draft: 'default',
    published: 'success',
    cancelled: 'error',
    completed: 'info'
  };
  return colors[status] as 'default' | 'success' | 'error' | 'info';
};

const EventCard = ({ event, isOwner, onClick }: EventCardProps) => {
  const theme = useTheme();
  const participationRate = event.participation?.availabilityPercentage || 0;

  return (
    <Card 
      elevation={1}
      sx={{
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
        border: isOwner ? `2px solid ${theme.palette.primary.main}` : 'none',
        borderRadius: 2,
        background: theme.palette.background.paper,
        position: 'relative',
        overflow: 'visible'
      }}
      onClick={onClick}
    >
      <CardActionArea sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          {isOwner && (
            <Box
              sx={{
                position: 'absolute',
                top: -10,
                right: -10,
                bgcolor: theme.palette.warning.main,
                borderRadius: '50%',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: theme.shadows[2]
              }}
            >
              <Crown size={16} style={{ color: 'white' }} />
            </Box>
          )}

          <Stack spacing={2.5}>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  mb: 1,
                  color: theme.palette.text.primary,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  height: 48
                }}
              >
                {event.title}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: theme.palette.text.secondary,
                  gap: 0.5
                }}
              >
                <MapPin size={16} />
                {event.location}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Clock size={16} style={{ color: theme.palette.text.secondary }} />
              <Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                  {format(new Date(event.dateInfo.date), 'MMM dd, yyyy')}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {event.dateInfo.startTime} - {event.dateInfo.endTime}
                  <Box component="span" sx={{ mx: 0.5 }}>•</Box>
                  {event.dateInfo.durationMinutes / 60}h
                </Typography>
              </Box>
            </Box>

            <Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                mb: 0.5 
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Users size={16} style={{ color: theme.palette.text.secondary }} />
                  <Typography variant="body2">
                    {event.participation.current} / {event.participation.maximum}
                  </Typography>
                </Box>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: event.participation.isFull ? 
                      theme.palette.error.main : 
                      theme.palette.text.secondary 
                  }}
                >
                  {event.participation.isFull ? 'Full' : `${participationRate}% available`}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={participationRate}
                sx={{ 
                  borderRadius: 5,
                  height: 6,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 5,
                    backgroundColor: event.participation.isFull ? 
                      theme.palette.error.main : 
                      theme.palette.primary.main
                  }
                }}
              />
            </Box>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1
            }}>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={event.status.toUpperCase()}
                  color={getStatusColor(event.status)}
                  size="small"
                  sx={{ 
                    borderRadius: '16px',
                    fontWeight: 500,
                    textTransform: 'capitalize'
                  }}
                />
                {event.categories && event.categories[0] && (
                  <Chip
                    label={event.categories[0].name}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      borderRadius: '16px',
                    }}
                  />
                )}
              </Stack>

              {event.organizer && (
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: theme.palette.primary.main,
                    fontSize: '0.875rem'
                  }}
                >
                  {event.organizer.email.charAt(0).toUpperCase()}
                </Avatar>
              )}
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default EventCard;