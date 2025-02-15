import { Box, Drawer, IconButton, List, ListItemText, Tooltip } from '@mui/material';
import { NavItem } from '@common/defs/types';
import {
  StyledLinkNavItem,
  StyledListItemButton,
  StyledListItemIcon,
} from '@common/components/lib/navigation/Drawers/styled-drawer-items';
import { NextRouter } from 'next/router';
import { useState } from 'react';
import { ChevronRight } from '@mui/icons-material';

interface NestedDrawerProps {
  navItems: NavItem[];
  leftBarWidth: number;
  isMobile: boolean;
  open: boolean;
  router: NextRouter;
  level: number;
}

const NestedDrawer = (props: NestedDrawerProps) => {
  const { navItems, leftBarWidth, open, isMobile, router, level } = props;
  const [subNavItems, setSubNavItems] = useState<NavItem[]>();
  const handleOpenSubDrawer = (items: NavItem[]) => {
    setSubNavItems(items);
  };
  const handleCloseSubDrawer = () => {
    setSubNavItems([]);
  };
  return (
    <Drawer
      anchor="left"
      onMouseLeave={() => handleCloseSubDrawer()}
      open={open}
      variant={isMobile ? 'temporary' : 'persistent'}
      PaperProps={{
        sx: {
          width: leftBarWidth,
          left: leftBarWidth * level,
          bgcolor: 'background.default',
          borderRightStyle: 'dashed',
          marginTop: 0.5,
          p: 2.5,
        },
      }}
      sx={{
        display: open ? 'block' : 'none',
      }}
    >
      {subNavItems !== undefined && subNavItems.length > 0 && (
        <NestedDrawer
          open={subNavItems !== undefined && subNavItems.length > 0}
          leftBarWidth={leftBarWidth}
          navItems={subNavItems}
          isMobile={isMobile}
          router={router}
          level={level + 1}
        />
      )}

      <Box>
        <List disablePadding>
          {navItems.map((item, itemIndex) => {
            let link = item.link;
            if (link.length > 1) {
              link = item.link.endsWith('/') ? item.link.slice(0, -1) : item.link;
            }
            return (
              <StyledLinkNavItem
                key={itemIndex}
                passHref
                href={link}
                className={`${router.pathname === link ? 'active' : ''}`}
              >
                <StyledListItemButton
                  onMouseEnter={() => handleOpenSubDrawer(item.children || [])}
                  disableGutters
                >
                  <StyledListItemIcon>{item.icon}</StyledListItemIcon>
                  <ListItemText disableTypography primary={item.text} />
                  {item.suffix && (
                    <Tooltip title={item.suffix.tooltip}>
                      <IconButton
                        size="small"
                        // on click, stoppropagation to avoid triggering the parent link
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (item.suffix) {
                            router.push(item.suffix.link);
                          }
                        }}
                      >
                        {item.suffix.icon}
                      </IconButton>
                    </Tooltip>
                  )}
                  {item.children && item.children.length > 0 && <ChevronRight />}
                </StyledListItemButton>
              </StyledLinkNavItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export default NestedDrawer;
