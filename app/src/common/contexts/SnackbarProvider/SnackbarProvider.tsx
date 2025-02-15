import { useRef } from 'react';
import { SnackbarProvider as NotistackProvider, SnackbarKey } from 'notistack';
import { alpha } from '@mui/material/styles';
import { Box, IconButton } from '@mui/material';
import StyledNotistack from './styles';
import {
  CloseOutlined,
  CheckCircleRounded,
  ErrorRounded,
  InfoRounded,
  WarningRounded,
} from '@mui/icons-material';
import { Any } from '@common/defs/types';

type Props = {
  children: React.ReactNode;
};
const SnackbarProvider = ({ children }: Props) => {
  const notistackRef = useRef<Any>(null);

  const onClose = (key: SnackbarKey) => () => {
    notistackRef.current.closeSnackbar(key);
  };

  return (
    <>
      <StyledNotistack />

      <NotistackProvider
        ref={notistackRef}
        dense
        maxSnack={5}
        preventDuplicate
        autoHideDuration={3000}
        variant="success"
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        iconVariant={{
          info: <SnackbarIcon icon={<InfoRounded />} color="info" />,
          success: <SnackbarIcon icon={<CheckCircleRounded />} color="success" />,
          warning: <SnackbarIcon icon={<WarningRounded />} color="warning" />,
          error: <SnackbarIcon icon={<ErrorRounded />} color="error" />,
        }}
        action={(key) => <CloseButton onClick={onClose(key)} />}
      >
        {children}
      </NotistackProvider>
    </>
  );
};

const CloseButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <IconButton size="small" onClick={onClick}>
      <CloseOutlined fontSize="small" />
    </IconButton>
  );
};

type SnackbarIconProps = {
  icon: React.ReactNode;
  color: 'info' | 'success' | 'warning' | 'error';
};

const SnackbarIcon = ({ icon, color }: SnackbarIconProps) => {
  return (
    <Box
      component="span"
      sx={{
        mr: 1.5,
        width: 40,
        height: 40,
        display: 'flex',
        borderRadius: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        color: `${color}.main`,
        bgcolor: (theme) => alpha(theme.palette[color].main, 0.16),
      }}
    >
      {icon}
    </Box>
  );
};

export default SnackbarProvider;
