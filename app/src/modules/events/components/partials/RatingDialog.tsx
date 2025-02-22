import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Rating,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useState } from 'react';


interface RatingDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => Promise<void>;
    initialRating?: number;
    initialComment?: string;
    isEdit?: boolean;
  }
  
  const RatingDialog = ({
    open,
    onClose,
    onSubmit,
    initialRating = 0,
    initialComment = '',
    isEdit = false
  }: RatingDialogProps) => {
    const [rating, setRating] = useState(initialRating);
    const [comment, setComment] = useState(initialComment);
    const [submitting, setSubmitting] = useState(false);
  
    const handleSubmit = async () => {
      if (rating === 0) return;
  
      setSubmitting(true);
      try {
        await onSubmit(rating, comment);
        onClose();
      } finally {
        setSubmitting(false);
      }
    };
  
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>
          {isEdit ? 'Update Your Rating' : 'Rate This Event'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Your Rating
              </Typography>
              <Rating
                value={rating}
                onChange={(_, value) => setRating(value || 0)}
                precision={0.5}
                size="large"
              />
            </Box>
            <TextField
              label="Review (Optional)"
              multiline
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
          >
            {isEdit ? 'Update Rating' : 'Submit Rating'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

export default RatingDialog;