import Routes from '@common/defs/routes';
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import { useTheme } from '@mui/material/styles';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { Divider, Link, List, ListItem, ListItemText, useMediaQuery } from '@mui/material';
import { alpha, Box } from '@mui/system';
import { useRouter } from 'next/router';
import Logo from '@common/assets/svgs/Logo';
import { useTranslation } from 'react-i18next';

interface FooterItemProps {
  label: string;
  link: string;
}
interface SocialMedia {
  label: string;
  icon: JSX.Element;
  link: string;
}

const Footer = () => {
  const { t } = useTranslation(['footer']);

  const footerItems: FooterItemProps[] = [
    {
      label: t('footer:privacy_cookies'),
      link: Routes.Common.Home,
    },
    {
      label: t('footer:terms_conditions'),
      link: Routes.Common.Home,
    },
  ];
  const socialMedias: SocialMedia[] = [
    {
      label: 'Facebook',
      icon: <FacebookRoundedIcon sx={{ fontSize: '2rem' }} />,
      link: '#',
    },
    {
      label: 'Instagram',
      icon: <InstagramIcon sx={{ fontSize: '2rem' }} />,
      link: '#',
    },
    {
      label: 'Twitter',
      icon: <TwitterIcon sx={{ fontSize: '2rem' }} />,
      link: '#',
    },
    {
      label: 'YouTube',
      icon: <YouTubeIcon sx={{ fontSize: '2rem' }} />,
      link: '#',
    },
  ];
  const isFooterItemsEven = footerItems.length % 2 === 0;
  const router = useRouter();
  const currenttheme = useTheme();
  const mdScreen = useMediaQuery(currenttheme.breakpoints.down('md'));
  return (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        zIndex: 100,
        backgroundColor: 'primary.darker',
        width: '100%',
        paddingY: { xs: 2, md: 6 },
        marginTop: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontSize: '15px',
        color: 'common.white',
      }}
    >
      {(!isFooterItemsEven || mdScreen) && (
        <Box sx={{ marginBottom: 2 }}>
          <Logo id="responsive-footer-logo" />
        </Box>
      )}
      <Box sx={{ display: 'flex', marginBottom: { xs: 0, md: 1.7 } }}>
        {!isFooterItemsEven || mdScreen ? (
          <List
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 2, md: 0 },
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {footerItems.map((item, index) => {
              return (
                <ListItem
                  key={index}
                  onClick={() => router.push(item.link)}
                  sx={{
                    cursor: 'pointer',
                    width: 'fit-content',
                    borderLeft: { xs: 0, md: 1 },
                    paddingY: 0,
                    borderLeftColor: 'primary.lighter',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                    ...(footerItems.length === index + 1 && {
                      borderRight: { xs: 0, md: 1 },
                      borderRightColor: 'primary.lighter',
                    }),
                  }}
                >
                  <ListItemText sx={{ marginY: 0 }}>{item.label}</ListItemText>
                </ListItem>
              );
            })}
            <Divider
              sx={{
                marginY: { xs: 2, md: 0 },
                display: { xs: 'block', md: 'none' },
                borderColor: (theme) => alpha(theme.palette.primary.lighter, 0.4),
                borderWidth: 0.5,
                width: '100%',
              }}
            />
          </List>
        ) : (
          <>
            <List
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {footerItems.slice(0, Math.ceil(footerItems.length / 2)).map((item, index) => {
                return (
                  <ListItem
                    key={index}
                    onClick={() => router.push(item.link)}
                    sx={{
                      cursor: 'pointer',
                      width: 'fit-content',
                      borderLeft: 1,
                      paddingY: 0,
                      borderLeftColor: 'primary.lighter',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                      ...(footerItems.length / 2 === index + 1 && {
                        borderRight: 1,
                        borderRightColor: 'primary.lighter',
                      }),
                    }}
                  >
                    <ListItemText sx={{ marginY: 0 }}>{item.label}</ListItemText>
                  </ListItem>
                );
              })}
            </List>
            <Box
              sx={{
                paddingX: 4,
              }}
            >
              <Logo id="footer-logo" />
            </Box>
            <List
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {footerItems.slice(Math.ceil(footerItems.length / 2)).map((item, index) => {
                return (
                  <ListItem
                    key={index}
                    onClick={() => router.push(item.link)}
                    sx={{
                      cursor: 'pointer',
                      width: 'fit-content',
                      borderLeft: 1,
                      paddingY: 0,
                      borderLeftColor: 'primary.lighter',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                      ...(footerItems.length / 2 === index + 1 && {
                        borderRight: 1,
                        borderRightColor: 'primary.lighter',
                      }),
                    }}
                  >
                    <ListItemText sx={{ marginY: 0 }}>{item.label}</ListItemText>
                  </ListItem>
                );
              })}
            </List>
          </>
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 1.7,
        }}
      >
        {socialMedias.map((socialMedia, socialMediaIndex) => (
          <Link
            key={socialMediaIndex}
            href={socialMedia.link}
            target="_blank"
            rel="noreferrer"
            sx={{
              color: 'common.white',
              borderRadius: 2,
              padding: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all, 0.15s',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            {socialMedia.icon}
          </Link>
        ))}
      </Box>
      <Box
        sx={{
          fontSize: '13px',
        }}
      >
        {t('footer:copyright')}
      </Box>
    </Box>
  );
};

export default Footer;
