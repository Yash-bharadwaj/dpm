/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState, useEffect } from 'react';
import { Drawer, Typography, Box, Table, TableBody, TableCell, TableRow, Paper, TableContainer, Button, Snackbar, Alert, CircularProgress, Tooltip, IconButton } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useLazyQuery } from '@apollo/client';
import { gql } from '@apollo/client';

// Define GraphQL mutations and queries
const DEPLOY_PACKAGE = gql`
  mutation deployPackage($input: deviceinput!) {
    deployPackage(input: $input) {
      responsestatus
      message
    }
  }
`;

const GET_PACKAGE_STATUS = gql`
  query getPackageStatus($input: deviceinput!) {
    getPackageStatus(input: $input) {
      responsestatus
      packagestatus
      packagetags {
        tagkey
        tagvalue
      }
      versionid
      comment
    }
  }
`;

const GET_PACKAGE_VERSION = gql`
  query getPackageVersion($input: deviceinput!) {
    getPackageVersion(input: $input) {
      lastmodified
      comment
      status
      versionid
    }
  }
`;

interface Device {
  deviceid: string;
  orgcode: string;
  devicecode: string;
  devicetype: string;
  devicename: string;
  devicelocation: string;
  deviceip: string; 
}

interface DeviceDetailsSidebarProps {
  open: boolean;
  onClose: () => void;
  device: Device | null;
  heartbeatStatus: any; // Accept any type for heartbeat status to match structure from Home component
}

interface PackageTag {
  tagkey: string;
  tagvalue: string;
}

interface PackageStatus {
  responsestatus: boolean;
  packagestatus: string;
  packagetags: PackageTag[];
  versionid: string;
  comment: string;
}


const DeviceDetailsSidebar: React.FC<DeviceDetailsSidebarProps> = ({ open, onClose, device, heartbeatStatus }) => {
  const navigate = useNavigate();
  const deviceHeartbeat = heartbeatStatus;
  
  // Single snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  // State for package status
  const [packageStatus, setPackageStatus] = useState<PackageStatus | null>(null);
  
  // State for loading specific fields
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingVersion, setLoadingVersion] = useState(false);
  
  // State for deploy message
  const [deployMessage, setDeployMessage] = useState<string | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  
  // State to track if APIs have been called initially
  const [initialApiCallsMade, setInitialApiCallsMade] = useState(false);

  // Mutations and lazy queries
  const [deployPackage] = useMutation(DEPLOY_PACKAGE);
  const [getPackageStatus] = useLazyQuery(GET_PACKAGE_STATUS, { fetchPolicy: 'network-only' });
  const [getPackageVersion] = useLazyQuery(GET_PACKAGE_VERSION, { fetchPolicy: 'network-only' });

  const handleDeviceCodeClick = () => {
    if (device) {
      navigate(`/config/${device.orgcode}/${device.devicecode}`);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Effect to automatically call APIs when the sidebar is opened
  useEffect(() => {
    if (open && device && !initialApiCallsMade) {
      handleCheckDeviceStatus();
      setInitialApiCallsMade(true);
    }
  }, [device, initialApiCallsMade]);
  

  const handleCheckDeviceStatus = async () => {
    if (!device) return;
    
    setLoadingStatus(true);
    setLoadingVersion(true);
    
    try {
      // Step 1: Call deployPackage API
      const deployResult = await deployPackage({
        variables: {
          input: {
            devicecode: device.devicecode,
            orgcode: device.orgcode
          }
        }
      });
      
      const deployData = deployResult.data.deployPackage;
      
      // Set deploy message based on response status
      setDeployMessage(deployData.message);
      setUpdateAvailable(deployData.responsestatus);
      
      // Step 2: Call getPackageVersion API regardless of deploy success/failure
      try {
        const versionResult = await getPackageVersion({
          variables: {
            input: {
              devicecode: device.devicecode,
              orgcode: device.orgcode,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }
          }
        });
        
        // Check if the version result is empty
        if (versionResult.data && 
            versionResult.data.getPackageVersion && 
            Array.isArray(versionResult.data.getPackageVersion)) {
          
          if (versionResult.data.getPackageVersion.length > 0) {
            const latestVersionId = versionResult.data.getPackageVersion[0].versionid;
            setLoadingVersion(false);
            
            // Step 3: Call getPackageStatus API with the latest versionId
            try {
              const statusResult = await getPackageStatus({
                variables: {
                  input: {
                    devicecode: device.devicecode,
                    orgcode: device.orgcode,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    versionid: latestVersionId
                  }
                }
              });
              
              if (statusResult.data && statusResult.data.getPackageStatus) {
                const packageStatusData = statusResult.data.getPackageStatus;
                setPackageStatus(packageStatusData);
                
                // Set snackbar message based on deployPackage response
                if (updateAvailable) {
                  setSnackbarMessage("Update Available, will be deployed in next 10mins");
                  setSnackbarSeverity('success');
                } else {
                  setSnackbarMessage(deployMessage || "Update Available, will be deployed in next 10mins");
                  setSnackbarSeverity('success');
                }
                
                setSnackbarOpen(true);
              } else {
                // Handle case where getPackageStatus returns empty or invalid data
                setSnackbarMessage('Could not retrieve package status information');
                setSnackbarSeverity('warning');
                setSnackbarOpen(true);
              }
            } catch (statusError) {
              console.error('Error getting package status:', statusError);
              setSnackbarMessage('Failed to retrieve package status');
              setSnackbarSeverity('error');
              setSnackbarOpen(true);
            }
          } else {
            // Handle empty version list
            setSnackbarMessage('No versions found for this device');
            setSnackbarSeverity('warning');
            setSnackbarOpen(true);
          }
        } else {
          // Handle invalid version result
          setSnackbarMessage('Invalid package version data received');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      } catch (versionError) {
        console.error('Error getting package version:', versionError);
        setSnackbarMessage('Failed to retrieve package version information');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error deploying package:', error);
      setSnackbarMessage('Failed to deploy package. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoadingStatus(false);
      setLoadingVersion(false);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box p={2.5} width="500px" role="presentation" style={{ borderTop: '10px solid #11a1cd' }}>
        <Typography variant="h6" style={{ fontWeight: '600' }}>Device Details:</Typography>
        
        {device && (
          <>
            <TableContainer component={Paper}>
              <Table style={{ boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px' }}>
                <TableBody>
                  <TableRow style={{ backgroundColor: '#fbfbfb' }}>
                    <TableCell><strong>ID:</strong></TableCell>
                    <TableCell>{device.deviceid}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Org Code:</strong></TableCell>
                    <TableCell>{device.orgcode}</TableCell>
                  </TableRow>
                  <TableRow style={{ backgroundColor: '#fbfbfb' }}>
                    <TableCell><strong>Code:</strong></TableCell>
                    <TableCell
                      onClick={handleDeviceCodeClick}
                      style={{ cursor: 'pointer', fontWeight: 'normal' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration = 'underline';
                        e.currentTarget.style.fontWeight = 'bold';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration = 'none';
                        e.currentTarget.style.fontWeight = 'normal';
                      }}
                    >
                      {device.devicecode} <LaunchIcon style={{ fontSize: 'large', marginBottom: '2px' }} />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Name:</strong></TableCell>
                    <TableCell>{device.devicename}</TableCell>
                  </TableRow>
                  <TableRow style={{ backgroundColor: '#fbfbfb' }}>
                    <TableCell><strong>Location:</strong></TableCell>
                    <TableCell>{device.devicelocation}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>IP Address:</strong></TableCell>
                    <TableCell>{deviceHeartbeat?.ipAddress || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow style={{ backgroundColor: '#fbfbfb' }}>
                    <TableCell><strong>Hostname:</strong></TableCell>
                    <TableCell>{deviceHeartbeat?.systemInfo?.hostname || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Cores:</strong></TableCell>
                    <TableCell>{deviceHeartbeat?.hardwareInfo?.cpuCores || 'N/A'} ( Usage: {deviceHeartbeat?.hardwareInfo?.cpuUsage ? `${deviceHeartbeat.hardwareInfo.cpuUsage}%` : 'N/A'} )</TableCell>
                  </TableRow>
                  <TableRow style={{ backgroundColor: '#fbfbfb' }}>
                    <TableCell><strong>Memory:</strong></TableCell>
                    <TableCell>{deviceHeartbeat?.hardwareInfo?.memoryUsage || '0'} / {deviceHeartbeat?.hardwareInfo?.totalMemory || 'N/A'} ( {deviceHeartbeat?.hardwareInfo?.memoryPercent || 'N/A'} )</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Last Seen:</strong></TableCell>
                    <TableCell>{deviceHeartbeat?.lastSeen || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow style={{ backgroundColor: '#fbfbfb' }}>
                    <TableCell><strong>Service Status:</strong></TableCell>
                    <TableCell>{deviceHeartbeat?.serviceStatus || 'N/A'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Package Status Section - Always shown */}
            <Box mt={3}>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <Typography variant="h6" style={{ fontWeight: '600', marginBottom: '10px' }}>
                  Package Details:
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCheckDeviceStatus}
                  disabled={!device}
                  style={{ 
                    backgroundColor: '#11a1cd',
                    fontSize: '13px',
                    fontWeight: '600',
                    height: '35px'
                  }}
                  startIcon={<Icon icon="material-symbols:deployed-code-update-outline-sharp" width="20" height="20" />}
                >
                  CHECK UPDATE
                </Button>
              </div>
              
              <TableContainer component={Paper}>
                <Table style={{ boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px' }}>
                  <TableBody>
                    <TableRow style={{ backgroundColor: '#fbfbfb' }}>
                      <TableCell><strong>Status:</strong></TableCell>
                      <TableCell>
                        {loadingStatus ? (
                          <CircularProgress size={20} color="primary" />
                        ) : packageStatus ? (
                          <Button
                            variant="contained"
                            style={{
                              height: '25px',
                              fontWeight: '600',
                              backgroundColor: packageStatus.packagestatus === 'deployed' ? '#DDF1EA' : 
                                           packageStatus.packagestatus === 'pending' ? '#FFFAEB' : '#FFF2F2',
                              color: packageStatus.packagestatus === 'deployed' ? '#007867' : 
                                   packageStatus.packagestatus === 'pending' ? '#946300' : '#E23428',
                              boxShadow: 'none',
                              textTransform: 'uppercase'
                            }}
                          >
                            {packageStatus.packagestatus}
                          </Button>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Version ID:</strong></TableCell>
                      <TableCell>
                        {loadingVersion ? (
                          <CircularProgress size={20} color="primary" />
                        ) : (
                          packageStatus ? packageStatus.versionid : (deviceHeartbeat?.configVersion?.versionId || 'N/A')
                        )}
                      </TableCell>
                    </TableRow>
                   
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </>
        )}
      </Box>
      
      {/* Single Snackbar */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={5000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ zIndex: 1500 }}  // Higher z-index than the default drawer
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Drawer>
  );
};

export default DeviceDetailsSidebar;