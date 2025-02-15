import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

const LoadingPage = () => {
  const [mounted, setMounted] = useState(false);
  const theme = useTheme();
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null;
  }
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
      }}
    >
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
          height: 30,
          width: 30,
        }}
      />
    </Box>
  );
};

export default LoadingPage;
