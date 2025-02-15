import { Theme } from '@mui/material/styles/createTheme';
import { Components } from '@mui/material/styles/components';

import { forwardRef } from 'react';
import NextLink from 'next/link';
import { LinkProps } from '@mui/material/Link';
import { Any } from '@common/defs/types';

/* eslint-disable @typescript-eslint/no-unused-vars */

const LinkBehaviour = forwardRef<HTMLAnchorElement, Any>((props, ref) => {
  return <NextLink ref={ref} {...props} />;
});

const ComponentsOverrides: Components<Omit<Theme, 'components'>> = {
  MuiButton: {
    styleOverrides: {
      root: ({ ownerState, theme }) => ({
        boxShadow: 'none',
        borderRadius: theme.shape.borderRadius,
      }),
      endIcon: ({ ownerState, theme }) => ({
        '.MuiSvgIcon-root': {
          fontSize: 14,
        },
      }),
    },
  },
  MuiLink: {
    styleOverrides: {
      root: ({ ownerState, theme }) => ({
        textDecoration: 'none',
      }),
    },
    defaultProps: {
      component: LinkBehaviour,
    } as LinkProps,
  },
  MuiDataGrid: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        border: `1px solid transparent`,
        '& .MuiTablePagination-root': {
          borderTop: 0,
        },
      },
      cell: ({ ownerState, theme }) => ({
        borderBottom: `1px solid ${theme.palette.divider}`,
        '&:focus': {
          outline: 'none',
          // backgroundColor: theme.palette.action.selected,
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
        },
        '&:focus-within': {
          outline: 'none',
          // backgroundColor: theme.palette.action.selected,
        },
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      }),
      columnHeaders: ({ ownerState, theme }) => ({
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
      }),
      columnHeader: ({ ownerState, theme }) => ({
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        '&:focus': {
          outline: 'none',
          // backgroundColor: theme.palette.action.selected,
        },
        '&:focus-within': {
          outline: 'none',
          // backgroundColor: theme.palette.action.selected,
        },
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      }),
      columnSeparator: ({ ownerState, theme }) => ({
        color: theme.palette.divider,
      }),
      toolbarContainer: ({ ownerState, theme }) => ({
        padding: theme.spacing(2),
        backgroundColor: theme.palette.primary.dark,
        '& .MuiButton-root': {
          marginRight: theme.spacing(1.5),
          color: theme.palette.primary.contrastText,
          padding: 20,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        },
      }),
      paper: ({ ownerState, theme }) => ({
        boxShadow: theme.customShadows.dropdown,
      }),
      menu: ({ ownerState, theme }) => ({
        '& .MuiPaper-root': {
          boxShadow: theme.customShadows.dropdown,
        },
        '& .MuiMenuItem-root': {
          ...theme.typography.body2,
          '& .MuiListItemIcon-root': {
            minWidth: 'auto',
          },
        },
      }),
      panelFooter: ({ ownerState, theme }) => ({
        padding: theme.spacing(2),
        justifyContent: 'flex-end',
        borderTop: `1px solid ${theme.palette.divider}`,
        '& .MuiButton-root': {
          '&:first-of-type': {
            marginRight: theme.spacing(1.5),
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          },
          '&:last-of-type': {
            color: theme.palette.common.white,
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          },
        },
      }),
      filterForm: ({ ownerState, theme }) => ({
        padding: theme.spacing(1.5, 0),
        '& .MuiFormControl-root': {
          margin: theme.spacing(0, 0.5),
        },
        '& .MuiInput-root': {
          marginTop: theme.spacing(3),
          '&::before, &::after': {
            display: 'none',
          },
          '& .MuiNativeSelect-select, .MuiInput-input': {
            ...theme.typography.body2,
            padding: theme.spacing(0.75, 1),
            borderRadius: theme.shape.borderRadius,
            backgroundColor: theme.palette.background.neutral,
          },
          '& .MuiSvgIcon-root': {
            right: 4,
          },
        },
      }),
    },
  },
};

export default ComponentsOverrides;
