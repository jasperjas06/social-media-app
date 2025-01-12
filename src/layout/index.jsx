import React, { useMemo } from 'react';
import {
  Box,
  CssBaseline,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import { Dashboard, Person, Add, AccountCircle, Logout } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/context';

const drawerWidth = 240;

function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation();
  const { logout } = useUser();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const sidebarLinks = useMemo(
    () => [
      { text: 'Feed', icon: <Dashboard />, link: '/' },
      // { text: 'Explore', icon: <Person />, link: '/users' },
      { text: 'New Post', icon: <Add />, link: '/newpost' },
      { text: 'Profile', icon: <AccountCircle />, link: '/profile' },
      { text: 'Logout', icon: <Logout />, action: logout },
    ],
    [logout]
  );

  const drawer = (
    <Box
      sx={{
        textAlign: 'center',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Typography variant="h6" sx={{ paddingBottom: 2 }}>
        Social Media App
      </Typography>
      <Divider sx={{ width: '80%', margin: '0 auto', marginBottom: 2 }} />
      <List sx={{ width: '100%' }}>
        {sidebarLinks.map((link, index) => (
          <ListItem
            button
            key={index}
            component={link.link ? Link : 'div'}
            to={link.link || ''}
            onClick={link.action || undefined}
            sx={{
              backgroundColor:
                location.pathname === link.link ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
            }}
          >
            <ListItemIcon
              sx={{ color: location.pathname === link.link ? 'black' : 'gray' }}
            >
              {link.icon}
            </ListItemIcon>
            <ListItemText
              primary={link.text}
              sx={{
                textAlign: 'left',
                fontWeight: location.pathname === link.link ? 'bold' : 'normal',
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

export default AdminLayout;
