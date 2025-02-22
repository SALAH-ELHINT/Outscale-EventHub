import { FC } from 'react';
import { Card, CardContent, Typography, Box, IconButton } from '@mui/material';
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  color: string;
}

const StatCard: FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendLabel, 
  color 
}) => {
  const isPositiveTrend = trend && trend > 0;

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <IconButton
            sx={{
              bgcolor: `${color}15`,
              '&:hover': { bgcolor: `${color}25` },
            }}
          >
            <Icon size={18} color={color} />
          </IconButton>
        </Box>

        <Typography variant="h4" fontWeight="700" gutterBottom>
          {value.toLocaleString()}
        </Typography>

        {trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: isPositiveTrend ? 'success.main' : 'error.main',
              }}
            >
              {isPositiveTrend ? (
                <ArrowUpRight size={16} />
              ) : (
                <ArrowDownRight size={16} />
              )}
              <Typography variant="body2" fontWeight="500">
                {Math.abs(trend)}%
              </Typography>
            </Box>
            {trendLabel && (
              <Typography variant="caption" color="text.secondary">
                {trendLabel}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>

      {/* Background Icon */}
      <Box
        sx={{
          position: 'absolute',
          right: -20,
          bottom: -20,
          opacity: 0.1,
          transform: 'rotate(-15deg)',
        }}
      >
        <Icon size={120} color={color} />
      </Box>
    </Card>
  );
}

export default StatCard;