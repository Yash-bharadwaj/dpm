/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState } from 'react';
import { Drawer, Typography, Box, Table, TableBody, TableCell, TableRow, Paper, TableContainer, Button, Snackbar, Alert, CircularProgress } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import { useNavigate } from 'react-router-dom';
import { useMutation, useLazyQuery } from '@apollo/client';
import { gql } from '@apollo/client';

//@ts-ignore
import { HeartbeatStatuses } from '../hooks/HeartBeatStatus'; // Adjust the import path

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
  heartbeatStatus: HeartbeatStatuses;
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

interface PackageVersion {
  lastmodified: string;
  comment: string;
  status: string;
  versionid: string;
}

const DeviceDetailsSidebar: React.FC<DeviceDetailsSidebarProps> = ({ open, onClose, device, heartbeatStatus }) => {
  const navigate = useNavigate();
  const deviceHeartbeat = device ? heartbeatStatus[device.devicecode] : {};
  
  // State for deploy snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  // State for package status snackbar
  const [statusSnackbarOpen, setStatusSnackbarOpen] = useState(false);
  const [statusSnackbarMessage, setStatusSnackbarMessage] = useState('');
  const [statusSnackbarSeverity, setStatusSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  
  // State for package version snackbar
  const [versionSnackbarOpen, setVersionSnackbarOpen] = useState(false);
  const [versionSnackbarMessage, setVersionSnackbarMessage] = useState('');
  const [versionSnackbarSeverity, setVersionSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  
  // State for package status
  const [packageStatus, setPackageStatus] = useState<PackageStatus | null>(null);
  
  // State for loading
  const [loading, setLoading] = useState(false);

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

  const handleStatusSnackbarClose = () => {
    setStatusSnackbarOpen(false);
  };

  const handleVersionSnackbarClose = () => {
    setVersionSnackbarOpen(false);
  };

  const handleCheckDeviceStatus = async () => {
    if (!device) return;
    
    setLoading(true);
    setPackageStatus(null); // Reset package status when starting a new check
    
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
      
      // Show success/error message based on responsestatus
      const message = deployData.responsestatus 
        ? 'Device deployed successfully' 
        : `Deploy unsuccessful: ${deployData.message || 'Unknown error'}`;
        
      setSnackbarMessage(message);
      setSnackbarSeverity(deployData.responsestatus ? 'success' : 'error');
      setSnackbarOpen(true);
      
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
            
            // Show version success message
            setVersionSnackbarMessage(`Latest version found: ${latestVersionId}`);
            setVersionSnackbarSeverity('success');
            setVersionSnackbarOpen(true);
            
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
                
                // Show package status in a separate snackbar
                setStatusSnackbarMessage(`Package Status: ${packageStatusData.packagestatus}`);
                
                // Set severity based on package status
                let severity: 'success' | 'error' | 'info' | 'warning' = 'info';
                if (packageStatusData.packagestatus === 'deployed') {
                  severity = 'success';
                } else if (packageStatusData.packagestatus === 'failed') {
                  severity = 'error';
                } else if (packageStatusData.packagestatus === 'pending') {
                  severity = 'warning';
                }
                
                setStatusSnackbarSeverity(severity);
                setStatusSnackbarOpen(true);
              } else {
                // Handle case where getPackageStatus returns empty or invalid data
                setStatusSnackbarMessage('Could not retrieve package status information');
                setStatusSnackbarSeverity('warning');
                setStatusSnackbarOpen(true);
              }
            } catch (statusError) {
              console.error('Error getting package status:', statusError);
              setStatusSnackbarMessage('Failed to retrieve package status');
              setStatusSnackbarSeverity('error');
              setStatusSnackbarOpen(true);
            }
          } else {
            // Handle empty version list
            setVersionSnackbarMessage('No versions found for this device');
            setVersionSnackbarSeverity('warning');
            setVersionSnackbarOpen(true);
          }
        } else {
          // Handle invalid version result
          setVersionSnackbarMessage('Invalid package version data received');
          setVersionSnackbarSeverity('error');
          setVersionSnackbarOpen(true);
        }
      } catch (versionError) {
        console.error('Error getting package version:', versionError);
        setVersionSnackbarMessage('Failed to retrieve package version information');
        setVersionSnackbarSeverity('error');
        setVersionSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error deploying package:', error);
      setSnackbarMessage('Failed to deploy package. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box p={2.5} width="500px" role="presentation" style={{ borderTop: '10px solid #11a1cd' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <Typography variant="h6" style={{ fontWeight: '600' }}>
            Device Details:
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCheckDeviceStatus}
            disabled={loading || !device}
            style={{ 
              backgroundColor: '#11a1cd',
              fontSize: '13px',
              fontWeight: '600',
              height: '35px'
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'UPLOAD DEVICE'}
          </Button>
        </div>
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
                    <TableCell>{deviceHeartbeat?.systemInfo?.ipAddress || 'N/A'}</TableCell>
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
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Package Status Section */}
            {packageStatus && (
              <Box mt={3}>
                <Typography variant="h6" style={{ fontWeight: '600', marginBottom: '10px' }}>
                  Package Status:
                </Typography>
                <TableContainer component={Paper}>
                  <Table style={{ boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px' }}>
                    <TableBody>
                      <TableRow style={{ backgroundColor: '#fbfbfb' }}>
                        <TableCell><strong>Status:</strong></TableCell>
                        <TableCell>
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
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Version ID:</strong></TableCell>
                        <TableCell>{packageStatus.versionid}</TableCell>
                      </TableRow>
                      <TableRow style={{ backgroundColor: '#fbfbfb' }}>
                        <TableCell><strong>Comment:</strong></TableCell>
                        <TableCell>{packageStatus.comment || 'No comment'}</TableCell>
                      </TableRow>
                      
                      {/* Package Tags */}
                      {packageStatus.packagetags && packageStatus.packagetags.length > 0 ? (
                        packageStatus.packagetags.map((tag, index) => (
                          <TableRow key={tag.tagkey} style={{ backgroundColor: index % 2 === 0 ? '#fbfbfb' : 'white' }}>
                            <TableCell><strong>{tag.tagkey.replace('timestamp_', '').replace(/-/g, ' ').charAt(0).toUpperCase() + tag.tagkey.replace('timestamp_', '').replace(/-/g, ' ').slice(1)}:</strong></TableCell>
                            <TableCell>{tag.tagvalue}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} style={{ textAlign: 'center' }}>No tags available</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </>
        )}
      </Box>
      
      {/* Deploy Snackbar */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Version Snackbar */}
      <Snackbar 
        open={versionSnackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleVersionSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleVersionSnackbarClose} severity={versionSnackbarSeverity} sx={{ width: '100%' }}>
          {versionSnackbarMessage}
        </Alert>
      </Snackbar>

      {/* Status Snackbar */}
      <Snackbar 
        open={statusSnackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleStatusSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleStatusSnackbarClose} severity={statusSnackbarSeverity} sx={{ width: '100%' }}>
          {statusSnackbarMessage}
        </Alert>
      </Snackbar>
    </Drawer>
  );
};

export default DeviceDetailsSidebar;