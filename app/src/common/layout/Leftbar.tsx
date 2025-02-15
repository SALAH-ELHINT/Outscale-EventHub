import {
  List,
  ListItemText,
  Stack,
  Tooltip,
  IconButton,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import { useRouter } from 'next/router';
import Typography from '@mui/material/Typography';
import useAuth from '@modules/auth/hooks/api/useAuth';
import { useState, useEffect } from 'react';
import Logo from '@common/assets/svgs/Logo';
import Routes from '@common/defs/routes';
import usePermissions from '@modules/permissions/hooks/usePermissions';
import {
  AccountCircle,
  AddRounded,
  ChevronRight,
  Close,
  ExitToAppOutlined,
} from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import { CRUD_ACTION, NavGroup, NavItem } from '@common/defs/types';
import { menuItems as menuGroups } from '@common/defs/menu-items';
import NestedDrawer from '@common/components/lib/navigation/Drawers/NestedDrawer';
import {
  StyledLinkNavItem,
  StyledListItemButton,
  StyledListItemIcon,
  StyledSubheader,
} from '@common/components/lib/navigation/Drawers/styled-drawer-items';
import { useTranslation } from 'react-i18next';

interface LeftbarProps {
  open: boolean;
  onToggle: (open: boolean) => void;
}
export const LEFTBAR_WIDTH = 260;
const Leftbar = (props: LeftbarProps) => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const { can } = usePermissions();
  const [navEntries, setNavEntries] = useState<NavGroup[]>([]);
  const [subNavItems, setSubNavItems] = useState<NavItem[]>();
  const { t } = useTranslation(['leftbar']);
  const open = props.open;
  const handleOpenSubDrawer = (items: NavItem[]) => {
    setSubNavItems(items);
  };

  const handleCloseSubDrawer = () => {
    setSubNavItems([]);
  };

  const isMobile = !useMediaQuery(theme.breakpoints.up('sm'));
  const toggleLeftbar = () => {
    const newOpen = !open;
    props.onToggle(newOpen);
  };

  const filteredGroups = () => {
    const groups = menuGroups
      .map((menuGroup) => ({
        ...menuGroup,
        items: filteredMenuItems(menuGroup.items),
      }))
      .filter((group) => group.items.length > 0);
    return groups;
  };

  const filteredMenuItems = (menuItems: NavItem[]) => {
    const items = menuItems
      .map((menuItem) => {
        let item = { ...menuItem };
        if (menuItem.children && menuItem.children.length > 0) {
          item = { ...item, children: filteredMenuItems(menuItem.children) };
        }
        if (
          !menuItem.suffix &&
          menuItem.routes &&
          (!item.namespace || (item.namespace && can(item.namespace, CRUD_ACTION.CREATE)))
        ) {
          item = {
            ...item,
            suffix: {
              tooltip: 'Créer',
              icon: <AddRounded />,
              link: menuItem.routes.CreateOne,
            },
          };
        }

        return !item.namespace ||
          !item.permission ||
          (item.namespace && item.permission && can(item.namespace, item.permission))
          ? item
          : null;
      })
      .filter((menuItem) => menuItem !== null) as NavItem[];
    return items;
  };

  useEffect(() => {
    setNavEntries(filteredGroups());
  }, [user]);
  return (
    <>
      <Drawer
        onMouseLeave={() => handleCloseSubDrawer()}
        anchor="left"
        open={open}
        variant={isMobile ? 'temporary' : 'persistent'}
        PaperProps={{
          sx: {
            width: LEFTBAR_WIDTH,
            bgcolor: 'background.default',
            borderRightStyle: 'dashed',
            marginTop: 0.5,
            px: 2.5,
          },
        }}
        sx={{
          display: open ? 'block' : 'none',
        }}
      >
        <NestedDrawer
          open={subNavItems !== undefined && subNavItems.length > 0}
          leftBarWidth={LEFTBAR_WIDTH}
          navItems={subNavItems !== undefined && subNavItems.length > 0 ? subNavItems : []}
          isMobile={isMobile}
          router={router}
          level={1}
        />
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            py: 3,
            marginBottom: 2,
            borderBottomWidth: 1,
            borderBottomColor: 'grey.300',
          }}
        >
          <Stack direction="row" alignItems="center">
            <Logo id="leftbar-logo" sx={{ marginRight: 2 }} />
            <Typography variant="h6" sx={{ color: 'primary.main' }}>
              {process.env.NEXT_PUBLIC_APP_TITLE}
            </Typography>
          </Stack>

          <IconButton onClick={toggleLeftbar}>
            <Close
              sx={{
                cursor: 'pointer',
                transition: 'color 0.2s',
                color: 'grey.700',
              }}
              fontSize="small"
            />
          </IconButton>
        </Stack>
        {user && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              padding: theme.spacing(2, 2.5),
              borderRadius: theme.shape.borderRadius * 1.5 + 'px',
              backgroundColor: 'action.hover',
              mb: 5,
            }}
          >
            <AccountCircle fontSize="large" color="action" sx={{ mr: 1 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                {user.email}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {user.rolesNames[0]}
              </Typography>
            </Box>
          </Box>
        )}
        <Box>
          <List disablePadding>
            {navEntries.map((entry, groupIndex) => (
              <Box key={groupIndex}>
                {entry.text && <StyledSubheader disableSticky>{entry.text}</StyledSubheader>}
                {entry.items.map((item, itemIndex) => {
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
              </Box>
            ))}
          </List>
        </Box>
        {user && (
          <Button
            color="error"
            onClick={() => {
              router.push(Routes.Common.Home);
              logout();
            }}
            sx={{
              display: 'flex',
              marginTop: 4,
            }}
            startIcon={<ExitToAppOutlined />}
            variant="text"
          >
            {t('leftbar:logout')}
          </Button>
        )}
      </Drawer>
      {!open && (
        <Box
          sx={{
            position: 'absolute',
            display: 'flex',
            top: 6,
            left: {
              xs: 6,
              sm: 14,
            },
          }}
        >
          <IconButton
            onClick={toggleLeftbar}
            sx={{
              display: open ? 'none' : 'block',
              height: 40,
            }}
          >
            <MenuIcon fontSize="medium" sx={{ color: 'grey.700' }} />
          </IconButton>
        </Box>
      )}
    </>
  );
};

export default Leftbar;
