import { Box, Button, Stack, TextField } from '@mui/material';
import React, { useState } from 'react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  initialValue?: string;
  isEdit?: boolean;
  onCancel?: () => void;
}
  
const CommentForm = ({
  onSubmit,
  initialValue = '',
  isEdit = false,
  onCancel,
}: CommentFormProps) => {
  const [content, setContent] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit(content);
      if (!isEdit) setContent('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        multiline
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
        variant="outlined"
        disabled={submitting}
      />
      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
        {isEdit && (
          <Button onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="contained" disabled={!content.trim() || submitting}>
          {isEdit ? 'Update Comment' : 'Post Comment'}
        </Button>
      </Stack>
    </Box>
  );
};

export default CommentForm;
