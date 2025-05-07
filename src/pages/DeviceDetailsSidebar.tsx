import React, { useState, useEffect } from 'react';
import { Drawer, IconButton, Typography, Divider, List, ListItem, ListItemText, Box, Chip, Grid, 
  Avatar, CircularProgress, TextField, Tab, Tabs } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Close, SignalCellular4Bar, SignalCellular0Bar, SignalCellular2Bar, 
  Warning, Error, CheckCircle, AccessTime, Memory, Storage, DeveloperBoard } from '@mui/icons-material';
import { useQuery } from '@apollo/client';
import { FETCH_DEVICE_DETAILS } from '../query/query';
import { colors, spacing } from '../theme/theme';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';

// Custom styled components
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: '43%',
    padding: spacing.lg,
    borderLeft: `1px solid ${colors.neutral.lightGray}`,
    boxShadow: '0 0 15px rgba(0,0,0,0.1)',
  },
  '@media (max-width: 768px)': {
    '& .MuiDrawer-paper': {
      width: '100%',
    },
  },
}));

const DeviceAvatar = styled(Avatar)(({ theme }) => ({
  width: 64,
  height: 64,
  backgroundColor: colors.primary.main,
  color: colors.neutral.white,
  fontWeight: 'bold',
  marginRight: spacing.md,
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  minHeight: 48,
}));

const StatCard = styled(Box)(({ theme }) => ({
  padding: spacing.md,
  borderRadius: '8px',
  backgroundColor: colors.neutral.white,
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    transform: 'translateY(-2px)',
  },
}));

// Define interfaces for data types
interface DeviceMetric {
  id: string;
  timestamp: string;
  value: number;
  type: string;
}

interface DeviceStat {
  name: string;
  value: string | number;
  icon: React.ReactNode;
}

interface DeviceAlert {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
}

interface DeviceProps {
  open: boolean;
  deviceId: string;
  onClose: () => void;
}

const DeviceDetailsSidebar: React.FC<DeviceProps> = ({ open, deviceId, onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [searchAlerts, setSearchAlerts] = useState('');
  const [filteredAlerts, setFilteredAlerts] = useState<DeviceAlert[]>([]);
  
  // Query device details
  const { loading, error, data } = useQuery(FETCH_DEVICE_DETAILS, {
    variables: { id: deviceId },
    skip: !deviceId || !open,
    fetchPolicy: 'cache-and-network',
  });

  // Filter alerts based on search
  useEffect(() => {
    if (data?.device?.alerts) {
      const filtered = searchAlerts
        ? data.device.alerts.filter((alert: DeviceAlert) => 
            alert.message.toLowerCase().includes(searchAlerts.toLowerCase())
          )
        : data.device.alerts;
      
      setFilteredAlerts(filtered);
    }
  }, [data, searchAlerts]);

  // Generate device stats
  const getDeviceStats = (): DeviceStat[] => {
    if (!data || !data.device) return [];
    
    const device = data.device;
    return [
      { 
        name: 'CPU Usage', 
        value: `${device.metrics.cpu.toFixed(1)}%`,
        icon: <Memory fontSize="large" style={{ color: colors.primary.main }} />
      },
      { 
        name: 'Memory', 
        value: `${device.metrics.memory.toFixed(1)}%`,
        icon: <Storage fontSize="large" style={{ color: colors.status.info }} />
      },
      { 
        name: 'Uptime', 
        value: formatUptime(device.metrics.uptime),
        icon: <AccessTime fontSize="large" style={{ color: colors.status.success }} />
      },
      { 
        name: 'Disk Space', 
        value: `${device.metrics.disk.toFixed(1)}%`,
        icon: <DeveloperBoard fontSize="large" style={{ color: colors.status.warning }} />
      },
    ];
  };

  // Format uptime from seconds to human-readable format
  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Render status icon based on device status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <SignalCellular4Bar style={{ color: colors.status.success }} />;
      case 'offline':
        return <SignalCellular0Bar style={{ color: colors.status.error }} />;
      case 'warning':
        return <SignalCellular2Bar style={{ color: colors.status.warning }} />;
      case 'error':
        return <Error style={{ color: colors.status.error }} />;
      default:
        return <SignalCellular0Bar />;
    }
  };

  // Render alert severity badge
  const renderAlertBadge = (level: string) => {
    switch (level) {
      case 'error':
        return <Badge variant="danger" size="sm">Error</Badge>;
      case 'warning':
        return <Badge variant="warning" size="sm">Warning</Badge>;
      case 'info':
        return <Badge variant="info" size="sm">Info</Badge>;
      default:
        return <Badge variant="light" size="sm">{level}</Badge>;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <StyledDrawer
      anchor="right"
      open={open}
      onClose={onClose}
      className="slide-left"
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2" fontWeight="600">
          Device Details
        </Typography>
        <IconButton onClick={onClose} aria-label="close">
          <Close />
        </IconButton>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 2, bgcolor: colors.status.error + '20', borderRadius: 1, color: colors.status.error }}>
          <Typography>Error loading device details: {error.message}</Typography>
        </Box>
      ) : data && data.device ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, pb: 2, borderBottom: `1px solid ${colors.neutral.lightGray}` }}>
            <DeviceAvatar>
              {data.device.name.substring(0, 1).toUpperCase()}
            </DeviceAvatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" component="h3">
                  {data.device.name}
                </Typography>
                {getStatusIcon(data.device.status)}
              </Box>
              <Typography variant="body2" color="text.secondary">
                ID: {data.device.id}
              </Typography>
              <Chip 
                label={data.device.status} 
                size="small" 
                sx={{ 
                  mt: 1, 
                  bgcolor: data.device.status === 'online' 
                    ? colors.status.success + '20' 
                    : data.device.status === 'warning' 
                      ? colors.status.warning + '20' 
                      : colors.status.error + '20',
                  color: data.device.status === 'online' 
                    ? colors.status.success 
                    : data.device.status === 'warning' 
                      ? colors.status.warning 
                      : colors.status.error,
                  fontWeight: 500
                }} 
              />
            </Box>
          </Box>

          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            sx={{ 
              mb: 3, 
              borderBottom: `1px solid ${colors.neutral.lightGray}`,
              '& .MuiTabs-indicator': {
                backgroundColor: colors.primary.main,
              }
            }}
          >
            <StyledTab label="Overview" />
            <StyledTab label="Metrics" />
            <StyledTab label="Alerts" />
          </Tabs>

          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                Device Information
              </Typography>
              
              <Card className="mb-4">
                <List sx={{ p: 0 }}>
                  <ListItem sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.neutral.lightGray}` }}>
                    <ListItemText 
                      primary="Description" 
                      secondary={data.device.description || "No description available"} 
                      primaryTypographyProps={{ fontWeight: 500, fontSize: '0.875rem', color: colors.neutral.darkGray }}
                      secondaryTypographyProps={{ color: colors.neutral.darkerGray }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.neutral.lightGray}` }}>
                    <ListItemText 
                      primary="Last Updated" 
                      secondary={formatTimestamp(data.device.updatedAt)} 
                      primaryTypographyProps={{ fontWeight: 500, fontSize: '0.875rem', color: colors.neutral.darkGray }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 1.5, px: 2, borderBottom: `1px solid ${colors.neutral.lightGray}` }}>
                    <ListItemText 
                      primary="Created" 
                      secondary={formatTimestamp(data.device.createdAt)} 
                      primaryTypographyProps={{ fontWeight: 500, fontSize: '0.875rem', color: colors.neutral.darkGray }}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 1.5, px: 2 }}>
                    <ListItemText 
                      primary="Version" 
                      secondary={data.device.version} 
                      primaryTypographyProps={{ fontWeight: 500, fontSize: '0.875rem', color: colors.neutral.darkGray }}
                    />
                  </ListItem>
                </List>
              </Card>

              <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                Current Statistics
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {getDeviceStats().map((stat, index) => (
                  <Grid item xs={6} md={3} key={index}>
                    <StatCard>
                      {stat.icon}
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.8rem' }}>
                        {stat.name}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {stat.value}
                      </Typography>
                    </StatCard>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                Performance Metrics
              </Typography>
              
              <Card className="mb-4">
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Historical metrics would be displayed here with charts and graphs.
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', bgcolor: colors.neutral.offWhite, borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Metrics visualization would appear here
                  </Typography>
                </Box>
              </Card>
            </Box>
          )}

          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                Device Alerts
              </Typography>
              
              <TextField
                fullWidth
                placeholder="Search alerts..."
                variant="outlined"
                size="small"
                value={searchAlerts}
                onChange={(e) => setSearchAlerts(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <Card className="mb-4">
                {filteredAlerts.length === 0 ? (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No alerts found
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {filteredAlerts.map((alert: DeviceAlert) => (
                      <ListItem 
                        key={alert.id} 
                        sx={{ 
                          py: 1.5, 
                          px: 2, 
                          borderBottom: `1px solid ${colors.neutral.lightGray}`,
                          transition: 'background-color 0.3s ease',
                          '&:hover': {
                            backgroundColor: colors.neutral.offWhite,
                          }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {alert.level === 'error' ? (
                                <Error fontSize="small" color="error" />
                              ) : alert.level === 'warning' ? (
                                <Warning fontSize="small" color="warning" />
                              ) : (
                                <CheckCircle fontSize="small" color="success" />
                              )}
                              {alert.message}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                {formatTimestamp(alert.timestamp)}
                              </Typography>
                              {renderAlertBadge(alert.level)}
                            </Box>
                          }
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Card>
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body1">No device information available</Typography>
        </Box>
      )}
    </StyledDrawer>
  );
};

export default DeviceDetailsSidebar;