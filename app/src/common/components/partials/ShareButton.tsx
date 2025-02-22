import React, { useState } from 'react';
import { 
  Button,
  Snackbar,
  Slide,
  Fade,
  IconButton,
  Box,
  Typography,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import { Check, Share2, X } from 'lucide-react';

const ShareButton = () => {
  const theme = useTheme();
  const [showSuccess, setShowSuccess] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleShare = async () => {
    try {
      const currentUrl = window.location.href;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Share Event',
          url: currentUrl
        });
        setShowSuccess(true);
        setOpenSnackbar(true);
      } else {
        await navigator.clipboard.writeText(currentUrl);
        setShowSuccess(true);
        setOpenSnackbar(true);
      }

      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Button
        variant="outlined"
        onClick={handleShare}
        fullWidth
        startIcon={
          <Fade in={!showSuccess}>
            <Share2 size={20} />
          </Fade>
        }
        endIcon={
          <Fade in={showSuccess}>
            <Check 
              size={20} 
              style={{ 
                color: theme.palette.success.main,
                position: 'absolute',
                right: 16
              }} 
            />
          </Fade>
        }
        sx={{
          borderRadius: 1,
          textTransform: 'none',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s ease-in-out',
          height: 42,
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: theme.shadows[2]
          },
          ...(showSuccess && {
            borderColor: theme.palette.success.main,
            color: theme.palette.success.main,
            backgroundColor: alpha(theme.palette.success.main, 0.04)
          })
        }}
      >
        {showSuccess ? 'Copied!' : 'Share Event'}
      </Button>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Slide}
        sx={{ bottom: { xs: 16, sm: 24 } }}
      >
        <Paper
          elevation={3}
          sx={{
            py: 1.5,
            px: 2,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Check size={18} color={theme.palette.success.main} />
          <Typography 
            variant="body2"
            sx={{ 
              mr: 1,
              color: theme.palette.text.primary
            }}
          >
            Event URL copied to clipboard
          </Typography>
          <IconButton
            size="small"
            onClick={handleCloseSnackbar}
            sx={{ ml: 1 }}
          >
            <X size={18} />
          </IconButton>
        </Paper>
      </Snackbar>
    </Box>
  );
};

export default ShareButton;