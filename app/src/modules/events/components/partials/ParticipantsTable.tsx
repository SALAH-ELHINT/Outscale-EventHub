import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  Stack,
  Button,
  alpha,
  Tooltip,
  CircularProgress,
  useTheme,
  Divider
} from '@mui/material';
import { 
  CheckCircle, 
  Clock, 
  Download, 
  MoreVertical, 
  Search, 
  Tag, 
  Trash2, 
  User, 
  UserX 
} from 'lucide-react';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';

import useEvents from '@modules/events/hooks/api/useEvents';
import { ParticipantStatus } from '@modules/events/defs/types';

interface ParticipantsTableProps {
  eventId: number;
}
type StatusColorKey = 'pending' | 'confirmed' | 'cancelled' | 'attended';

const statusColors: Record<StatusColorKey, { color: string; icon: JSX.Element }> = {
  pending: { color: 'warning', icon: <Clock size={16} /> },
  confirmed: { color: 'success', icon: <CheckCircle size={16} /> },
  cancelled: { color: 'error', icon: <UserX size={16} /> },
  attended: { color: 'info', icon: <User size={16} /> },
};

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatDateTime = (dateString: string | null): { date: string; time: string } => {
  if (!dateString) {
    return { date: '-', time: '-' };
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return { date: '-', time: '-' };
    }
    return {
      date: format(date, 'PP'),
      time: format(date, 'p')
    };
  } catch (error) {
    console.error('Date parsing error:', error);
    return { date: '-', time: '-' };
  }
};

interface ParticipantData {
  id: number;
  user: {
    id: number;
    email: string;
  };
  status: StatusColorKey;
  registration_date: string;
}

interface StatsData {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  attended: number;
}

const ParticipantsTable: React.FC<ParticipantsTableProps> = ({ eventId }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { getParticipants, updateParticipantStatus } = useEvents();
  
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<ParticipantStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantData | null>(null);
  
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    attended: 0
  });

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page: page + 1,
        per_page: rowsPerPage
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await getParticipants(eventId, { 
        displayProgress: true,
        data: params
      });
      
      if (response.success && response.data) {
        setParticipants(response.data.items.data);
        setTotalItems(response.data.meta.total_items);
        
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      } else {
        enqueueSnackbar('Failed to load participants', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
      enqueueSnackbar('An error occurred while loading participants', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [eventId, page, rowsPerPage, statusFilter, searchQuery]);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, participant: ParticipantData) => {
    setAnchorEl(event.currentTarget);
    setSelectedParticipant(participant);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleUpdateStatus = async (newStatus: ParticipantStatus) => {
    if (!selectedParticipant) return;
    
    try {
      const response = await updateParticipantStatus(
        eventId, 
        selectedParticipant.id, 
        newStatus,
        { 
          displaySuccess: true,
          data: { status: newStatus }
        }
      );
      
      if (response.success) {
        setParticipants(prev => 
          prev.map(p => 
            p.id === selectedParticipant.id ? { ...p, status: newStatus as StatusColorKey } : p
          )
        );
        
        fetchParticipants();
      }
    } catch (error) {
      console.error('Error updating participant status:', error);
      enqueueSnackbar('Failed to update participant status', { variant: 'error' });
    } finally {
      handleCloseMenu();
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const statusOptions = useMemo(() => [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'attended', label: 'Attended' }
  ], []);

  const exportParticipants = async () => {
    try {
      const params: Record<string, any> = {
        per_page: 'all'
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (searchQuery) {
        params.search = searchQuery;
      }
  
      const response = await getParticipants(eventId, {
        data: params
      });
      
      if (response.success && response.data && response.data.items && Array.isArray(response.data.items)) {
        const participants = response.data.items as ParticipantData[];
        
        const headers = ['Email', 'Status', 'Registration Date'];
        const csvContent = [
          headers.join(','),
          ...participants.map((p) => {
            const formattedDate = formatDateTime(p.registration_date);
            return [
              p.user.email,
              p.status,
              `${formattedDate.date} ${formattedDate.time}`
            ].join(',');
          })
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `event-${eventId}-participants.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error exporting participants:', error);
      enqueueSnackbar('Failed to export participants', { variant: 'error' });
    }
  };

  const isValidDate = (date: any) => {
    return date instanceof Date && !isNaN(date.getTime());
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
          <TextField
            placeholder="Search by email..."
            size="small"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: '100%', sm: 220 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
              },
            }}
          />
          
          <FormControl 
            size="small" 
            sx={{ 
              width: { xs: '100%', sm: 180 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
              },
            }}
          >
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ParticipantStatus | 'all');
                setPage(0);
              }}
              displayEmpty
              startAdornment={
                <InputAdornment position="start">
                  <Tag size={16} />
                </InputAdornment>
              }
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        
        <Button
          variant="outlined"
          startIcon={<Download size={18} />}
          onClick={exportParticipants}
          sx={{ 
            height: 40,
            textTransform: 'none',
            borderRadius: 1
          }}
        >
          Export CSV
        </Button>
      </Stack>
      
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
          p: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          borderRadius: 1
        }}
      >
        <Box sx={{ textAlign: 'center', px: 2 }}>
          <Typography variant="h6">{stats.total}</Typography>
          <Typography variant="body2" color="text.secondary">Total</Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box sx={{ textAlign: 'center', px: 2 }}>
          <Typography variant="h6" color="success.main">{stats.confirmed}</Typography>
          <Typography variant="body2" color="text.secondary">Confirmed</Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box sx={{ textAlign: 'center', px: 2 }}>
          <Typography variant="h6" color="warning.main">{stats.pending}</Typography>
          <Typography variant="body2" color="text.secondary">Pending</Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box sx={{ textAlign: 'center', px: 2 }}>
          <Typography variant="h6" color="error.main">{stats.cancelled}</Typography>
          <Typography variant="body2" color="text.secondary">Cancelled</Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box sx={{ textAlign: 'center', px: 2 }}>
          <Typography variant="h6" color="info.main">{stats.attended}</Typography>
          <Typography variant="body2" color="text.secondary">Attended</Typography>
        </Box>
      </Box>
      
      <TableContainer component={Paper} elevation={0} sx={{ mb: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
            <TableRow>
              <TableCell>Participant</TableCell>
              <TableCell>Registration Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && page === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : participants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No participants found
                    {searchQuery && " matching your search criteria"}
                    {statusFilter !== 'all' && ` with status "${statusFilter}"`}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: theme.palette.primary.main,
                          mr: 2
                        }}
                      >
                        {participant.user.email.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {participant.user.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          User ID: {participant.user.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const formattedDate = formatDateTime(participant.registration_date);
                      return (
                        <>
                          <Typography variant="body2">
                            {formattedDate.date}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formattedDate.time}
                          </Typography>
                        </>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={statusColors[participant.status].icon}
                      label={formatStatus(participant.status)}
                      color={statusColors[participant.status].color as any}
                      size="small"
                      sx={{ borderRadius: 1 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Update Status">
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenMenu(e, participant)}
                      >
                        <MoreVertical size={18} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        component="div"
        count={totalItems}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Typography variant="caption" sx={{ px: 2, py: 0.5, display: 'block', color: 'text.secondary' }}>
          Change Status
        </Typography>
        
        <MenuItem 
          onClick={() => handleUpdateStatus('pending')}
          sx={{ 
            color: theme.palette.warning.main,
            '& .MuiListItemIcon-root': { color: 'inherit' }
          }}
        >
          <Clock size={16} style={{ marginRight: 8 }} />
          Mark as Pending
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleUpdateStatus('confirmed')}
          sx={{ 
            color: theme.palette.success.main,
            '& .MuiListItemIcon-root': { color: 'inherit' }
          }}
        >
          <CheckCircle size={16} style={{ marginRight: 8 }} />
          Confirm Registration
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleUpdateStatus('attended')}
          sx={{ 
            color: theme.palette.info.main,
            '& .MuiListItemIcon-root': { color: 'inherit' }
          }}
        >
          <User size={16} style={{ marginRight: 8 }} />
          Mark as Attended
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleUpdateStatus('cancelled')}
          sx={{ 
            color: theme.palette.error.main,
            '& .MuiListItemIcon-root': { color: 'inherit' }
          }}
        >
          <Trash2 size={16} style={{ marginRight: 8 }} />
          Cancel Registration
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ParticipantsTable;