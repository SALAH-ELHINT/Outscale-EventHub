import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Routes from '@common/defs/routes';
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  styled,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import useAuth from '@modules/auth/hooks/api/useAuth';
import Stack from '@mui/material/Stack';
import Logo from '@common/assets/svgs/Logo';
import { ArrowForwardIos, Logout } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { setUserLanguage } from '@common/components/lib/utils/language';

interface TopbarItem {
  label: string;
  link?: string;
  onClick?: () => void;
  dropdown?: Array<{
    label: string;
    link?: string;
    value?: string;
    onClick?: () => void;
  }>;
}

const Topbar = () => {
  const { t } = useTranslation(['topbar']);
  const router = useRouter();
  const { asPath } = router;
  const [showDrawer, setShowDrawer] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();

  const dropdownWidth = 137;
  const toggleSidebar = () => {
    setShowDrawer((oldValue) => !oldValue);
  };
  const navItems: TopbarItem[] = [
    {
      label: t('topbar:home'),
      link: Routes.Common.Home,
      onClick: () => router.push(Routes.Common.Home),
    },
    {
      label: t('topbar:language'),
      dropdown: [
        {
          label: t('topbar:language_french'),
          link: asPath,
          value: 'fr',
        },
        {
          label: t('topbar:language_english'),
          link: `${asPath}`,
          value: 'en',
        },
        {
          label: t('topbar:language_spanish'),
          link: `${asPath}`,
          value: 'es',
        },
      ],
    },
    {
      label: 'Utilisateur',
      dropdown: [
        {
          label: 'Mon Profil',
          link: Routes.Users.Me,
          onClick: () => router.push(Routes.Users.Me),
        },
        {
          label: 'Déconnexion',
          onClick: () => logout(),
        },
      ],
    },
  ];

  const toggleDropdown = () => {
    setShowDropdown((oldValue) => !oldValue);
  };

  const onNavButtonClick = (item: TopbarItem) => {
    if (item.dropdown) {
      return toggleDropdown;
    }
    return () => {
      setShowDrawer(false);
      if (item.onClick) {
        item.onClick();
      }
    };
  };

  const onAuthButtonClick = (mode: string) => {
    if (router.pathname === Routes.Common.Home) {
      if (mode === 'login') {
        return router.push(Routes.Auth.Login);
      }
      if (mode === 'register') {
        return router.push(Routes.Auth.Register);
      }
    }
    // if login coming from any other page then add url query param to redirect back to the same page after login
    if (mode === 'login') {
      router.push({
        pathname: Routes.Auth.Login,
        query: { url: encodeURIComponent(router.pathname) },
      });
    }
    if (mode === 'register') {
      router.push({
        pathname: Routes.Auth.Register,
        query: { url: encodeURIComponent(router.pathname) },
      });
    }
  };

  return (
    <AppBar
      position="static"
      sx={{
        boxShadow: (theme) => theme.customShadows.z1,
        backgroundColor: 'common.white',
      }}
    >
      <Container>
        <Toolbar sx={{ px: { xs: 0, sm: 0 } }}>
          <Stack flexDirection="row" alignItems="center" flexGrow={1}>
            <Logo
              id="topbar-logo"
              onClick={() => router.push(Routes.Common.Home)}
              sx={{ cursor: 'pointer' }}
            />
          </Stack>
          <List sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            <>
              {navItems.map((item, index) => {
                if (item.label === 'Utilisateur') {
                  return null;
                }
                return (
                  <ListItem
                    key={index}
                    sx={{
                      width: 'fit-content',
                    }}
                  >
                    <StyledListItemButton
                      sx={{
                        ...(router.pathname === item.link && {
                          color: 'primary.main',
                        }),
                        ...(item.dropdown && {
                          borderTopLeftRadius: 24,
                          borderTopRightRadius: 24,
                          borderBottomLeftRadius: 0,
                          borderBottomRightRadius: 0,
                          width: dropdownWidth,
                          display: 'flex',
                          alignItems: 'center',
                          '&:hover': {
                            backgroundColor: 'transparent',
                            boxShadow: (theme) => theme.customShadows.z12,
                            '.MuiTypography-root': {
                              fontWeight: 'bold',
                            },
                            '.dropdown-menu': {
                              visibility: 'visible',
                            },
                            '.MuiTouchRipple-child': {
                              backgroundColor: 'transparent',
                            },
                          },
                        }),
                      }}
                      onClick={onNavButtonClick(item)}
                    >
                      {!item.dropdown ? (
                        <>{item.label}</>
                      ) : (
                        <>
                          <ListItemText>{item.label}</ListItemText>
                          <KeyboardArrowDown />
                          <List
                            className="dropdown-menu"
                            sx={{
                              backgroundColor: 'common.white',
                              boxShadow: (theme) => theme.customShadows.z12,
                              position: 'absolute',
                              top: 48,
                              left: 0,
                              padding: 0,
                              width: dropdownWidth,
                              borderBottomLeftRadius: 24,
                              borderBottomRightRadius: 24,
                              visibility: 'hidden',
                              zIndex: 1000000,
                            }}
                          >
                            {item.dropdown.map((dropdownItem, dropdownItemIndex) => {
                              return (
                                <ListItem
                                  key={dropdownItemIndex}
                                  sx={{
                                    padding: 0,
                                    display: 'unset',
                                  }}
                                >
                                  <Link href={dropdownItem.link!} locale={dropdownItem.value}>
                                    <ListItemButton
                                      sx={{
                                        display: 'flex',
                                        gap: 1,
                                        paddingX: 2,
                                        paddingY: 1.5,
                                        borderRadius: 0,
                                        zIndex: 1000000,
                                        '&:hover': {
                                          backgroundColor: 'primary.dark',
                                          color: 'primary.contrastText',
                                        },
                                        ...(item.dropdown?.length === dropdownItemIndex + 1 && {
                                          borderBottomLeftRadius: 24,
                                          borderBottomRightRadius: 24,
                                        }),
                                      }}
                                      onClick={() => {
                                        onNavButtonClick(dropdownItem);
                                        setUserLanguage(dropdownItem.value!);
                                      }}
                                    >
                                      {dropdownItem.label}
                                    </ListItemButton>
                                  </Link>
                                </ListItem>
                              );
                            })}
                          </List>
                        </>
                      )}
                    </StyledListItemButton>
                  </ListItem>
                );
              })}
            </>
            {!user ? (
              <>
                <ListItem
                  sx={{
                    width: 'fit-content',
                  }}
                >
                  <StyledListItemButton
                    onClick={() => onAuthButtonClick('login')}
                    sx={{
                      ...(router.pathname === Routes.Auth.Login && {
                        color: 'primary.main',
                      }),
                    }}
                  >
                    {t('topbar:login')}
                  </StyledListItemButton>
                </ListItem>
                <ListItem
                  sx={{
                    width: 'fit-content',
                  }}
                >
                  <Button
                    variant="contained"
                    endIcon={
                      <ArrowForwardIos
                        fontSize="small"
                        className="arrow-icon"
                        sx={{ fontSize: '12px', transition: 'all, 0.15s' }}
                      />
                    }
                    onClick={() => onAuthButtonClick('register')}
                    sx={{
                      display: { xs: 'none', md: 'flex' },
                      '&:hover': {
                        '.arrow-icon': {
                          transform: 'translateX(0.25rem)',
                        },
                      },
                    }}
                  >
                    {t('topbar:register')}
                  </Button>
                </ListItem>
              </>
            ) : (
              <>
                <ListItem
                  key="user-options"
                  sx={{
                    width: 'fit-content',
                  }}
                >
                  <StyledListItemButton
                    sx={{
                      borderTopLeftRadius: 24,
                      borderTopRightRadius: 24,
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0,
                      width: 160,
                      display: 'flex',
                      alignItems: 'center',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        boxShadow: (theme) => theme.customShadows.z12,
                        '.MuiTypography-root': {
                          fontWeight: 'bold',
                        },
                        '.dropdown-menu': {
                          visibility: 'visible',
                        },
                        '.MuiTouchRipple-child': {
                          backgroundColor: 'transparent',
                        },
                      },
                    }}
                  >
                    <>
                      <ListItemText>{navItems[2].label}</ListItemText>
                      <KeyboardArrowDown />
                      <List
                        className="dropdown-menu"
                        sx={{
                          backgroundColor: 'common.white',
                          boxShadow: (theme) => theme.customShadows.z12,
                          position: 'absolute',
                          top: 48,
                          left: 0,
                          width: 160,
                          padding: 0,
                          borderBottomLeftRadius: 24,
                          borderBottomRightRadius: 24,
                          visibility: 'hidden',
                          zIndex: 1000000,
                        }}
                      >
                        {navItems[2].dropdown?.map((dropdownItem, dropdownItemIndex) => {
                          return (
                            <ListItem
                              key={dropdownItemIndex}
                              sx={{
                                padding: 0,
                              }}
                            >
                              <ListItemButton
                                sx={{
                                  ...(router.pathname === dropdownItem.link && {
                                    color: 'primary.main',
                                  }),
                                  display: 'flex',
                                  gap: 1,
                                  paddingX: 2,
                                  paddingY: 1.5,
                                  borderRadius: 0,
                                  zIndex: 1000000,
                                  '&:hover': {
                                    backgroundColor: 'primary.dark',
                                    color: 'primary.contrastText',
                                  },
                                  ...(navItems[2].dropdown?.length === dropdownItemIndex + 1 && {
                                    borderBottomLeftRadius: 24,
                                    borderBottomRightRadius: 24,
                                  }),
                                }}
                                onClick={onNavButtonClick(dropdownItem)}
                              >
                                {dropdownItem.label}
                              </ListItemButton>
                            </ListItem>
                          );
                        })}
                      </List>
                    </>
                  </StyledListItemButton>
                </ListItem>
              </>
            )}
          </List>
          <IconButton
            onClick={() => toggleSidebar()}
            sx={{
              display: { md: 'none', sm: 'flex' },
            }}
          >
            <MenuIcon fontSize="medium" sx={{ color: 'grey.700' }} />
          </IconButton>
        </Toolbar>
      </Container>
      <Drawer anchor="right" open={showDrawer} onClose={() => setShowDrawer(false)}>
        <List
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontWeight: 700,
            width: 250,
          }}
        >
          <Box
            sx={{
              padding: 4,
              '.topbar-logo': {
                width: '250px',
              },
            }}
          >
            <Logo id="responsive-topbar-logo" />
          </Box>
          {navItems.map((item, index) => {
            if (item.label === 'Utilisateur') {
              return null;
            }
            return (
              <ListItem
                key={index}
                disablePadding
                sx={{
                  ...(item.dropdown && {
                    display: 'flex',
                    flexDirection: 'column',
                  }),
                }}
              >
                <ListItemButton
                  onClick={!item.dropdown ? onNavButtonClick(item) : toggleDropdown}
                  sx={{
                    width: '100%',
                  }}
                >
                  <ListItemText
                    primaryTypographyProps={{
                      ...(router.pathname === item.link && {
                        color: 'primary.main',
                      }),
                    }}
                  >
                    {item.label}
                  </ListItemText>
                  {item.dropdown && (
                    <ListItemIcon color="grey.800" sx={{ minWidth: 'unset' }}>
                      <KeyboardArrowDown sx={{ color: 'grey.800' }} />
                    </ListItemIcon>
                  )}
                </ListItemButton>
                {item.dropdown && (
                  <List
                    sx={{
                      width: '100%',
                      transition: 'all, 0.2s',
                      height: 0,
                      paddingY: 0,
                      ...(showDropdown && {
                        height: `calc(${item.dropdown.length} * 48px)`,
                      }),
                    }}
                    className="dropdown-list"
                  >
                    {item.dropdown.map((dropdownItem, dropdownItemIndex) => {
                      return (
                        <ListItem
                          key={dropdownItemIndex}
                          sx={{
                            padding: 0,
                            visibility: 'hidden',
                            ...(showDropdown && {
                              visibility: 'visible',
                            }),
                            display: 'unset',
                          }}
                        >
                          <Link href={dropdownItem.link!} locale={dropdownItem.value}>
                            <ListItemButton
                              onClick={() => {
                                onNavButtonClick(dropdownItem);
                                setUserLanguage(dropdownItem.value!);
                              }}
                              sx={{
                                display: 'flex',
                                gap: 1,
                                paddingLeft: 4,
                              }}
                            >
                              <ListItemText>{dropdownItem.label}</ListItemText>
                            </ListItemButton>
                          </Link>
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </ListItem>
            );
          })}
          <ListItem key="profile" disablePadding>
            <ListItemButton
              onClick={() => router.push(Routes.Users.Me)}
              sx={{
                width: '100%',
              }}
            >
              <ListItemText
                primaryTypographyProps={{
                  ...(router.pathname === Routes.Users.Me && {
                    color: 'primary.main',
                  }),
                }}
              >
                Mon Profil
              </ListItemText>
            </ListItemButton>
          </ListItem>
          {!user ? (
            <>
              <ListItem
                disablePadding
                sx={{
                  backgroundColor: 'transparent',
                  marginBottom: 3,
                }}
              >
                <ListItemButton
                  onClick={() => {
                    setShowDrawer(false);
                    router.push(Routes.Auth.Login);
                  }}
                >
                  <ListItemText
                    primaryTypographyProps={{
                      ...(router.pathname === Routes.Auth.Login && {
                        color: 'primary.main',
                      }),
                    }}
                  >
                    {t('topbar:login')}
                  </ListItemText>
                </ListItemButton>
              </ListItem>
              <Button
                variant="contained"
                endIcon={
                  <ArrowForwardIos
                    fontSize="small"
                    className="arrow-icon"
                    sx={{ fontSize: '12px', transition: 'all, 0.15s' }}
                  />
                }
                onClick={() => {
                  setShowDrawer(false);
                  router.push(Routes.Auth.Register);
                }}
                sx={{
                  display: 'flex',
                  flex: 1,
                  width: 150,
                  '&:hover': {
                    '.arrow-icon': {
                      transform: 'translateX(0.25rem)',
                    },
                  },
                }}
              >
                {t('topbar:register')}
              </Button>
            </>
          ) : (
            <>
              <Button
                color="error"
                onClick={() => {
                  setShowDrawer(false);
                  logout();
                }}
                sx={{
                  display: 'flex',
                }}
                startIcon={<Logout />}
                variant="outlined"
              >
                {t('topbar:logged.logout')}
              </Button>
            </>
          )}
        </List>
      </Drawer>
    </AppBar>
  );
};
const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  color: theme.palette.grey[700],
  borderRadius: theme.shape.borderRadius + 'px',
  '&:hover': {
    backgroundColor: 'transparent',
  },
  '.MuiTouchRipple-child': {
    backgroundColor: theme.palette.primary.main,
  },
}));
export default Topbar;
