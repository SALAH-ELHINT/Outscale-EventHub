import { pxToRem } from '@common/theme/typography';
import { ListItemButton, ListItemIcon, ListSubheader, styled } from '@mui/material';
import Link from 'next/link';

export const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  lineHeight: 1.5,
  fontSize: pxToRem(14),
  height: 48,
  position: 'relative',
  textTransform: 'capitalize',
  color: theme.palette.text.secondary,
  borderRadius: theme.shape.borderRadius,
  paddingLeft: 10,
  paddingRight: 10,
  '.active > &': {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
    fontWeight: theme.typography.fontWeightMedium,
  },
}));

export const StyledLinkNavItem = styled(Link)({
  display: 'block',
  '&:not(:last-of-type)': {
    marginBottom: 5,
  },
});

export const StyledSubheader = styled(ListSubheader)(({ theme }) => ({
  ...theme.typography.overline,
  fontSize: 11,
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

export const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  width: 22,
  height: 22,
  color: 'inherit',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 'auto',
  marginRight: theme.spacing(2),
}));
