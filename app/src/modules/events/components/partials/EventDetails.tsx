import {
  alpha,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Rating,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { format } from 'date-fns';
import {
  Calendar,
  Check,
  Clock,
  Edit2,
  MapPin,
  MessageSquare,
  Star,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';

import CustomBreadcrumbs from '@common/components/lib/navigation/CustomBreadCrumbs';
import ShareButton from '@common/components/partials/ShareButton';
import Routes from '@common/defs/routes';
import useAuth from '@modules/auth/hooks/api/useAuth';
import { EVENT_LABELS } from '@modules/events/defs/labels';
import { Event, EventComment, EventStatus, ParticipantStatus } from '@modules/events/defs/types';
import useEvents from '@modules/events/hooks/api/useEvents';

interface CommentFormProps {
  onSubmit: (content: string) => void;
  onCancel: () => void;
  initialValue?: string;
  isEdit?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  onCancel,
  initialValue = '',
  isEdit = false,
}) => {
  const [content, setContent] = useState(initialValue);

  return (
    <Box sx={{ mb: 3 }}>
      <TextField
        fullWidth
        multiline
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your comment..."
        sx={{ mb: 2 }}
      />
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="outlined" onClick={onCancel} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => onSubmit(content)}
          disabled={!content.trim()}
          sx={{ textTransform: 'none' }}
        >
          {isEdit ? 'Update Comment' : 'Post Comment'}
        </Button>
      </Stack>
    </Box>
  );
};

interface CommentItemProps {
  comment: EventComment;
  isOwner: boolean;
  onEdit: (comment: EventComment) => void;
  onDelete: (commentId: number) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, isOwner, onEdit, onDelete }) => {
  const theme = useTheme();

  return (
    <ListItem
      sx={{
        px: 0,
        borderBottom: `1px solid ${theme.palette.divider}`,
        '&:last-child': {
          borderBottom: 'none',
        },
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
          {comment.user.email.charAt(0).toUpperCase()}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {comment.user.email}
          </Typography>
        }
        secondary={
          <>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              {comment.content}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {format(new Date(comment.createdAt), 'MMM d, yyyy')}
            </Typography>
          </>
        }
      />
      {isOwner && (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => onEdit(comment)} sx={{ textTransform: 'none' }}>
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => onDelete(comment.id)}
            sx={{ textTransform: 'none' }}
          >
            Delete
          </Button>
        </Stack>
      )}
    </ListItem>
  );
};

interface RatingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  initialRating?: number;
  initialComment?: string;
  isEdit?: boolean;
}

const RatingDialog: React.FC<RatingDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialRating = 0,
  initialComment = '',
  isEdit = false,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);

  const handleSubmit = () => {
    onSubmit(rating, comment);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Your Rating' : 'Rate This Event'}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Box>
            <Typography gutterBottom>Your Rating</Typography>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue || 0)}
              precision={0.5}
              size="large"
            />
          </Box>
          <TextField
            label="Comment (Optional)"
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!rating}
          sx={{ textTransform: 'none' }}
        >
          {isEdit ? 'Update Rating' : 'Submit Rating'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface EventDetailsProps {
  event: Event;
  isOrganizer: boolean;
  onRegister: () => void;
  onEventUpdate: (updatedEvent: Event) => void;
}

const getStatusColor = (status: EventStatus): 'default' | 'success' | 'error' | 'info' => {
  const colors: Record<EventStatus, 'default' | 'success' | 'error' | 'info'> = {
    draft: 'default',
    published: 'success',
    cancelled: 'error',
    completed: 'info',
  };
  return colors[status];
};

const EventDetails: React.FC<EventDetailsProps> = ({
  event,
  isOrganizer,
  onRegister,
  onEventUpdate,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { readOne, register, cancelRegistration } = useEvents();
  const { enqueueSnackbar } = useSnackbar();
  const { addComment, updateComment, deleteComment, addRating, updateRating, deleteRating } =
    useEvents();

  const [editingComment, setEditingComment] = useState<EventComment | null>(null);
  const [isCommentFormOpen, setIsCommentFormOpen] = useState(false);

  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [isEditingRating, setIsEditingRating] = useState(false);

  const participationRate = (event.participation.current / event.participation.maximum) * 100;

  const handleAddComment = async (content: string) => {
    try {
      const response = await addComment(event.id, content);
      if (response.success) {
        enqueueSnackbar('Comment added successfully', { variant: 'success' });

        const updatedEvent = await readOne(event.id);
        if (updatedEvent.success && updatedEvent.data) {
          onEventUpdate(updatedEvent.data.item);
        }
      }
    } catch (error) {
      enqueueSnackbar('Failed to add comment', { variant: 'error' });
    }
  };

  const handleUpdateComment = async (content: string) => {
    if (!editingComment) return;

    try {
      const response = await updateComment(event.id, editingComment.id, content);
      if (response.success) {
        enqueueSnackbar('Comment updated successfully', { variant: 'success' });
        const updatedEvent = await readOne(event.id);
        if (updatedEvent.success && updatedEvent.data) {
          onEventUpdate(updatedEvent.data.item);
        }
        setEditingComment(null);
      }
    } catch (error) {
      enqueueSnackbar('Failed to update comment', { variant: 'error' });
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      const response = await deleteComment(event.id, commentId);
      if (response.success) {
        enqueueSnackbar('Comment deleted successfully', { variant: 'success' });
        const updatedEvent = await readOne(event.id);
        if (updatedEvent.success && updatedEvent.data) {
          onEventUpdate(updatedEvent.data.item);
        }
      }
    } catch (error) {
      enqueueSnackbar('Failed to delete comment', { variant: 'error' });
    }
  };

  const handleAddRating = async (rating: number, comment: string) => {
    try {
      const response = await addRating(event.id, rating, comment);
      if (response.success) {
        enqueueSnackbar('Rating added successfully', { variant: 'success' });
        const updatedEvent = await readOne(event.id);
        if (updatedEvent.success && updatedEvent.data) {
          onEventUpdate(updatedEvent.data.item);
        }
      }
    } catch (error) {
      enqueueSnackbar('Failed to add rating', { variant: 'error' });
    }
  };

  const handleUpdateRating = async (rating: number, comment: string) => {
    if (!event.engagement?.ratings?.userRating?.id) {
      enqueueSnackbar('Rating not found', { variant: 'error' });
      return;
    }

    try {
      const response = await updateRating(
        event.id,
        rating,
        event.engagement.ratings.userRating.id,
        comment
      );
      if (response.success) {
        enqueueSnackbar('Rating updated successfully', { variant: 'success' });
        const updatedEvent = await readOne(event.id);
        if (updatedEvent.success && updatedEvent.data) {
          onEventUpdate(updatedEvent.data.item);
        }
      }
    } catch (error) {
      enqueueSnackbar('Failed to update rating', { variant: 'error' });
    }
  };

  const handleDeleteRating = async () => {
    if (!event.engagement?.ratings?.userRating?.id) {
      enqueueSnackbar('Rating not found', { variant: 'error' });
      return;
    }

    try {
      const response = await deleteRating(event.id, event.engagement.ratings.userRating.id);
      if (response.success) {
        enqueueSnackbar('Rating deleted successfully', { variant: 'success' });
        const updatedEvent = await readOne(event.id);
        if (updatedEvent.success && updatedEvent.data) {
          onEventUpdate(updatedEvent.data.item);
        }
      }
    } catch (error) {
      enqueueSnackbar('Failed to delete rating', { variant: 'error' });
    }
  };

  const renderRatingSection = () => {
    const engagement = event.engagement;
    if (!engagement) return null;

    const userRating = engagement.ratings.userRating;
    const canRate = event.permissions.canRate && !isOrganizer;

    return (
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Star size={24} color={theme.palette.warning.main} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Event Rating
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Rating value={engagement.ratings.average} readOnly precision={0.5} />
              <Typography variant="body2" color="text.secondary">
                ({engagement.ratings.count} ratings)
              </Typography>
            </Stack>
          </Box>
          {canRate && (
            <Button
              variant="outlined"
              startIcon={userRating ? <Edit2 size={18} /> : <Star size={18} />}
              onClick={() => {
                setIsEditingRating(Boolean(userRating));
                setIsRatingDialogOpen(true);
              }}
              sx={{ textTransform: 'none' }}
            >
              {userRating ? 'Edit Rating' : 'Rate Event'}
            </Button>
          )}
        </Stack>

        {userRating && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.02),
              borderRadius: 2,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Your Rating
                </Typography>
                <Rating value={userRating.rating} readOnly precision={0.5} />
                {userRating.comment && (
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    {userRating.comment}
                  </Typography>
                )}
              </Box>
              {event.permissions.canRate && (
                <Button
                  size="small"
                  color="error"
                  onClick={handleDeleteRating}
                  sx={{ textTransform: 'none' }}
                >
                  Delete Rating
                </Button>
              )}
            </Stack>
          </Paper>
        )}
      </Box>
    );
  };

  const renderCommentsSection = () => {
    const engagement = event.engagement;
    if (!engagement) return null;

    const canComment = event.permissions.canComment || isOrganizer;

    return (
      <Box>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <MessageSquare size={24} color={theme.palette.primary.main} />
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 600 }}>
            Comments
          </Typography>
          {canComment && !isCommentFormOpen && (
            <Button
              variant="outlined"
              startIcon={<MessageSquare size={18} />}
              onClick={() => setIsCommentFormOpen(true)}
              sx={{ textTransform: 'none' }}
            >
              Add Comment
            </Button>
          )}
        </Stack>

        {isCommentFormOpen && (
          <CommentForm onSubmit={handleAddComment} onCancel={() => setIsCommentFormOpen(false)} />
        )}

        {editingComment && (
          <CommentForm
            onSubmit={handleUpdateComment}
            initialValue={editingComment.content}
            isEdit
            onCancel={() => setEditingComment(null)}
          />
        )}

        <List sx={{ mt: 2 }}>
          {engagement.comments.recent.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isOwner={user?.id === comment.user.id}
              onEdit={setEditingComment}
              onDelete={handleDeleteComment}
            />
          ))}
        </List>
      </Box>
    );
  };

  const handleEdit = () => {
    router.push(Routes.Events.EDIT(event.id));
  };

  const handleRegistrationAction = async () => {
    if (!event) return;

    try {
      if (event.userInteraction.isRegistered) {
        const response = await cancelRegistration(event.id);

        if (response.success) {
          const updatedEvent = await readOne(event.id);

          if (updatedEvent.success && updatedEvent.data) {
            onEventUpdate(updatedEvent.data.item);
          }
        }
      } else {
        const response = await register(event.id);

        if (response.success) {
          const updatedEvent = await readOne(event.id);

          if (updatedEvent.success && updatedEvent.data) {
            onEventUpdate(updatedEvent.data.item);
          }
        }
      }
    } catch (error) {
      console.error('Error handling registration:', error);
    }
  };

  const getRegistrationButton = () => {
    if (!user) {
      return (
        <Button
          variant="contained"
          size="large"
          startIcon={<UserCheck size={20} />}
          onClick={() => router.push('/auth/login')}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            py: 1.5,
            boxShadow: theme.shadows[2],
            '&:hover': {
              boxShadow: theme.shadows[4],
            },
          }}
        >
          Login to Register
        </Button>
      );
    }

    if (event.userInteraction.isOrganizer) {
      return null;
    }

    if (event.participation.isFull && !event.userInteraction.isRegistered) {
      return (
        <Button
          variant="contained"
          size="large"
          disabled
          startIcon={<Users size={20} />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            py: 1.5,
          }}
        >
          Event is Full
        </Button>
      );
    }

    interface ButtonConfig {
      text: string;
      icon: JSX.Element;
      color: 'warning' | 'error' | 'primary' | 'success';
      disabled?: boolean;
    }

    const buttonConfigs: Record<ParticipantStatus, ButtonConfig> = {
      pending: {
        text: 'Registration Pending',
        icon: <Clock size={20} />,
        color: 'warning',
      },
      confirmed: {
        text: 'Cancel Registration',
        icon: <X size={20} />,
        color: 'error',
      },
      cancelled: {
        text: 'Register Again',
        icon: <UserCheck size={20} />,
        color: 'primary',
      },
      attended: {
        text: 'Attended',
        icon: <Check size={20} />,
        color: 'success',
        disabled: true,
      },
    };

    const getButtonConfig = (): ButtonConfig => {
      if (event.userInteraction.isRegistered) {
        return buttonConfigs[event.userInteraction.registrationStatus || 'confirmed'];
      }

      if (event.userInteraction.registrationStatus === 'cancelled') {
        return buttonConfigs.cancelled;
      }

      return {
        text: 'Register Now',
        icon: <UserCheck size={20} />,
        color: 'primary',
      };
    };

    const config = getButtonConfig();

    return (
      <Button
        variant="contained"
        size="large"
        color={config.color}
        disabled={config.disabled || false}
        startIcon={config.icon}
        onClick={handleRegistrationAction}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          py: 1.5,
          boxShadow: theme.shadows[2],
          '&:hover': {
            boxShadow: theme.shadows[4],
          },
        }}
      >
        {config.text}
      </Button>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <CustomBreadcrumbs
        links={[
          { name: 'Dashboard', href: Routes.Common.Home },
          { name: EVENT_LABELS.ITEMS, href: Routes.Events.LIST },
          { name: event.title },
        ]}
      />

      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                      {event.title}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip
                        label={event.status.toUpperCase()}
                        color={getStatusColor(event.status)}
                        size="small"
                        sx={{
                          borderRadius: '16px',
                          fontWeight: 500,
                        }}
                      />
                      {event.categories?.map((category) => (
                        <Chip
                          key={category.id}
                          label={category.name}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderRadius: '16px',
                            mb: 1,
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                  {event.userInteraction.isOrganizer && (
                    <Button
                      variant="outlined"
                      startIcon={<Edit2 size={18} />}
                      onClick={handleEdit}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 2,
                      }}
                    >
                      Edit Event
                    </Button>
                  )}
                </Stack>
              </Box>

              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <Stack spacing={3}>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Calendar size={20} color={theme.palette.primary.main} />
                        <Typography variant="subtitle1" fontWeight={600}>
                          Date & Time
                        </Typography>
                      </Stack>
                      <Typography variant="body1">
                        {format(new Date(event.dateInfo.date), 'EEEE, MMMM d, yyyy')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.dateInfo.startTime} - {event.dateInfo.endTime}
                        <Box component="span" sx={{ mx: 1 }}>
                          •
                        </Box>
                        {event.dateInfo.durationMinutes / 60}h
                      </Typography>
                    </Box>

                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <MapPin size={20} color={theme.palette.primary.main} />
                        <Typography variant="subtitle1" fontWeight={600}>
                          Location
                        </Typography>
                      </Stack>
                      <Typography variant="body1">{event.location}</Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={3}>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Users size={20} color={theme.palette.primary.main} />
                        <Typography variant="subtitle1" fontWeight={600}>
                          Participants
                        </Typography>
                      </Stack>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body1">
                          {event.participation.current} / {event.participation.maximum} registered
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {event.participation.availabilityPercentage}% spots available
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={participationRate}
                        sx={{
                          borderRadius: 5,
                          height: 6,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 5,
                            bgcolor: event.participation.isFull
                              ? theme.palette.error.main
                              : theme.palette.primary.main,
                          },
                        }}
                      />
                    </Box>

                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <UserCheck size={20} color={theme.palette.primary.main} />
                        <Typography variant="subtitle1" fontWeight={600}>
                          Organizer
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: theme.palette.primary.main,
                          }}
                        >
                          {event.organizer.email.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body1">{event.organizer.email}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Event Organizer
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                About this event
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                {event.description}
              </Typography>
            </Paper>

            {event.engagement && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                {renderRatingSection()}
                <Divider sx={{ my: 3 }} />
                {renderCommentsSection()}
              </Paper>
            )}
          </Stack>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              position: 'sticky',
              top: 24,
            }}
          >
            <Stack spacing={3}>
              {!event.userInteraction.isOrganizer && getRegistrationButton()}

              <Stack spacing={2}>
                <ShareButton />
              </Stack>

              <Divider />

              {event.categories && event.categories.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                    Event Categories
                  </Typography>
                  <Stack spacing={1.5}>
                    {event.categories.map((category) => (
                      <Box key={category.id}>
                        <Typography variant="body2" fontWeight={500}>
                          {category.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {category.description}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              <Divider />

              {event.confirmedParticipants && event.confirmedParticipants.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                    Confirmed Participants
                  </Typography>
                  <Stack spacing={2}>
                    {event.confirmedParticipants.map((participant) => (
                      <Stack key={participant.id} direction="row" spacing={2} alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: theme.palette.primary.main,
                            width: 32,
                            height: 32,
                          }}
                        >
                          {participant.user.email.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">{participant.user.email}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Registered{' '}
                            {format(new Date(participant.registrationDate), 'MMM d, yyyy')}
                          </Typography>
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              )}

              {event.engagement && (
                <Box
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Event Statistics
                  </Typography>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Average Rating
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Star size={16} color={theme.palette.warning.main} />
                        <Typography variant="body2" fontWeight={500}>
                          {event.engagement.ratings.average.toFixed(1)} (
                          {event.engagement.ratings.count} reviews)
                        </Typography>
                      </Stack>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Recent Activity
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {event.engagement.comments.recent.length} comments
                      </Typography>
                    </Box>
                    {event.timestamps && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Created
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {format(new Date(event.timestamps.createdAt), 'MMMM d, yyyy')}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Rating Dialog */}
      <RatingDialog
        open={isRatingDialogOpen}
        onClose={() => setIsRatingDialogOpen(false)}
        onSubmit={isEditingRating ? handleUpdateRating : handleAddRating}
        initialRating={event.engagement?.ratings?.userRating?.rating}
        initialComment={event.engagement?.ratings?.userRating?.comment}
        isEdit={isEditingRating}
      />
    </Container>
  );
};

export default EventDetails;
