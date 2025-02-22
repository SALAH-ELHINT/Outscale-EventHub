import {
  Avatar,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { format } from 'date-fns';
import { Edit2, MoreVertical, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

import { EventComment } from '@modules/events/defs/types';

interface CommentItemProps {
  comment: EventComment;
  isOwner: boolean;
  onEdit: (comment: EventComment) => void;
  onDelete: (commentId: number) => void;
}

const CommentItem = ({ comment, isOwner, onEdit, onDelete }: CommentItemProps) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleCloseMenu();
    onEdit(comment);
  };

  const handleDelete = () => {
    handleCloseMenu();
    onDelete(comment.id);
  };

  return (
    <ListItem
      sx={{
        px: 0,
        borderBottom: `1px solid ${theme.palette.divider}`,
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
          {comment.user.email.charAt(0).toUpperCase()}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {comment.user.email}
            </Typography>
            {isOwner && (
              <>
                <IconButton size="small" onClick={handleOpenMenu}>
                  <MoreVertical size={16} />
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
                  <MenuItem onClick={handleEdit}>
                    <Edit2 size={16} style={{ marginRight: 8 }} />
                    Edit
                  </MenuItem>
                  <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                    <Trash2 size={16} style={{ marginRight: 8 }} />
                    Delete
                  </MenuItem>
                </Menu>
              </>
            )}
          </Stack>
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
    </ListItem>
  );
};

export default CommentItem;
