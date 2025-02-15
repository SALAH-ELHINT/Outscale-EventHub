import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { styled, useTheme } from '@mui/material/styles';

const StyledRoot = styled('div')(({ theme }) => ({
  right: 0,
  bottom: 0,
  zIndex: 9998,
  width: '100%',
  height: '100%',
  position: 'fixed',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default,
}));

const LoadingScreen = () => {
  const [mounted, setMounted] = useState(false);
  const theme = useTheme();
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null;
  }
  return (
    <StyledRoot>
      <motion.div
        animate={{
          scale: [1, 3, 3, 2, 1],
          rotate: [0, 0, 180, 180, 0],
          borderRadius: ['10%', '20%', '35%', '20%', '10%'],
        }}
        transition={{
          duration: 1,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
        className="h-5 w-5"
        style={{
          backgroundColor: theme.palette.primary.main,
        }}
      />
    </StyledRoot>
  );
};

export default LoadingScreen;
