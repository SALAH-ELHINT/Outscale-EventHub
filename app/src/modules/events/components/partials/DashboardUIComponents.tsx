import React from 'react';
import { 
  Box, 
  Typography, 
  LinearProgress, 
  Stack,
  alpha,
  SxProps,
  Theme 
} from '@mui/material';
import { AlertCircle, MessageSquare as LucideMessageSquare, Star as LucideStar } from 'lucide-react';

// ==== StatisticRow Component ====
interface StatisticRowProps {
  label: string;
  value: number;
  total: number;
  color: string;
  sx?: SxProps<Theme>;
}

export const StatisticRow: React.FC<StatisticRowProps> = ({ 
  label, 
  value, 
  total, 
  color,
  sx 
}) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  return (
    <Box sx={sx}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 0.5 
      }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={500}>
          {value.toLocaleString()} / {total.toLocaleString()} 
          <Typography component="span" variant="caption" sx={{ ml: 0.5 }}>
            ({percentage}%)
          </Typography>
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={percentage} 
        sx={{ 
          height: 8, 
          borderRadius: 4,
          bgcolor: alpha(color, 0.15),
          '& .MuiLinearProgress-bar': {
            bgcolor: color,
            borderRadius: 4,
          }
        }} 
      />
    </Box>
  );
};

// ==== MessageSquare Icon Component ====
interface IconProps {
  size?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  [x: string]: any; // For any other props
}

export const MessageSquare: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor',
  ...props 
}) => {
  return <LucideMessageSquare size={size} color={color} {...props} />;
};

// ==== Star Icon Component ====
export const Star: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor',
  ...props 
}) => {
  return <LucideStar size={size} color={color} {...props} />;
};

// ==== Rating Component ====
interface RatingProps {
  value: number;
  maxValue?: number;
  readOnly?: boolean;
  size?: 'small' | 'medium' | 'large';
  onChange?: (newValue: number) => void;
  precision?: 0.5 | 1;
  color?: string;
  emptyColor?: string;
  sx?: SxProps<Theme>;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  maxValue = 5,
  readOnly = true,
  size = 'medium',
  onChange,
  precision = 1,
  color = '#FFC107', // Default gold color
  emptyColor = '#E0E0E0',
  sx = {}
}) => {
  const sizeMap = {
    small: 16,
    medium: 20,
    large: 24
  };
  
  const starSize = sizeMap[size];
  
  const handleClick = (index: number) => {
    if (readOnly || !onChange) return;
    onChange(index + 1);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (readOnly || !onChange) return;
    if (e.key === 'Enter' || e.key === ' ') {
      onChange(index + 1);
      e.preventDefault();
    }
  };
  
  const getStarStyles = (index: number): React.CSSProperties => {
    const isFilled = index < value;
    const isHalfFilled = !isFilled && index < value + precision && precision === 0.5;
    
    return {
      cursor: !readOnly ? 'pointer' : 'default',
      fill: isFilled ? color : 'transparent',
      stroke: isFilled ? color : emptyColor,
      // Half star styling would need a custom SVG implementation
      // This is a simplified version
      background: isHalfFilled ? 
        `linear-gradient(to right, ${color} 50%, transparent 50%)` : 
        'transparent',
      WebkitBackgroundClip: isHalfFilled ? 'text' : 'unset',
      WebkitTextFillColor: isHalfFilled ? 'transparent' : 'unset',
    };
  };
  
  return (
    <Stack 
      direction="row" 
      spacing={0.5} 
      alignItems="center"
      sx={sx}
    >
      {Array.from({ length: maxValue }).map((_, index) => (
        <Box
          key={index}
          component="span"
          onClick={() => handleClick(index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          tabIndex={!readOnly ? 0 : -1}
          role={!readOnly ? "button" : undefined}
          aria-label={!readOnly ? `Rate ${index + 1} out of ${maxValue}` : undefined}
          sx={{
            display: 'inline-flex',
            transition: 'transform 0.1s ease-in-out',
            '&:hover': {
              transform: !readOnly ? 'scale(1.2)' : 'none'
            }
          }}
        >
          <LucideStar 
            size={starSize} 
            style={getStarStyles(index)}
          />
        </Box>
      ))}
    </Stack>
  );
};
