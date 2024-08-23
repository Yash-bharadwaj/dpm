import React from 'react';
import { Drawer, Typography, Box, Table, TableBody, TableCell, TableRow, Paper, TableContainer } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import { useNavigate } from 'react-router-dom';

//@ts-ignore
import { HeartbeatStatuses } from '../hooks/HeartBeatStatus'; // Adjust the import path

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

const DeviceDetailsSidebar: React.FC<DeviceDetailsSidebarProps> = ({ open, onClose, device, heartbeatStatus }) => {
  const navigate = useNavigate();
  const deviceHeartbeat = device ? heartbeatStatus[device.devicecode] : {};

  const handleDeviceCodeClick = () => {
    if (device) {
      navigate(`/config/${device.orgcode}/${device.devicecode}`);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box p={2.5} width="500px" role="presentation" style={{ borderTop: '10px solid #11a1cd' }}>
        <Typography variant="h6" style={{ fontWeight: '600' }} gutterBottom>
          Device Details:
        </Typography>
        {device && (
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
                <TableRow style={{ backgroundColor: '#fbfbfb' }}>
                  <TableCell><strong>Name:</strong></TableCell>
                  <TableCell>{device.devicename}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Location:</strong></TableCell>
                  <TableCell>{device.devicelocation}</TableCell>
                </TableRow>
                <TableRow style={{ backgroundColor: '#fbfbfb' }}>
                  <TableCell><strong>IP Address:</strong></TableCell>
                  <TableCell>{deviceHeartbeat?.systemInfo?.ipAddress || 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Hostname:</strong></TableCell>
                  <TableCell>{deviceHeartbeat?.systemInfo?.hostname || 'N/A'}</TableCell>
                </TableRow>
                <TableRow style={{ backgroundColor: '#fbfbfb' }}>
                  <TableCell><strong>CPU Usage:</strong></TableCell>
                  <TableCell>{deviceHeartbeat?.hardwareInfo?.cpuUsage ? `${deviceHeartbeat.hardwareInfo.cpuUsage}%` : 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Total Memory:</strong></TableCell>
                  <TableCell>{deviceHeartbeat?.hardwareInfo?.totalMemory || 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Memory Usage:</strong></TableCell>
                  <TableCell>{deviceHeartbeat?.hardwareInfo?.memoryPercent || 'N/A'}</TableCell>
                </TableRow>
                <TableRow style={{ backgroundColor: '#fbfbfb' }}>
                  <TableCell><strong>Memory Usage:</strong></TableCell>
                  <TableCell>{deviceHeartbeat?.hardwareInfo?.memoryUsage || 'N/A'}</TableCell>
                </TableRow>
                {/* <TableRow>
                  <TableCell><strong>Config Version:</strong></TableCell>
                  <TableCell>{deviceHeartbeat?.configVersion?.versionId || 'N/A'}</TableCell>
                </TableRow> */}
                <TableRow style={{ backgroundColor: '#fbfbfb' }}>
                  <TableCell><strong>Last Modified:</strong></TableCell>
                  <TableCell>{deviceHeartbeat?.configVersion?.lastModified || 'N/A'}</TableCell>
                </TableRow>
                {/* <TableRow>
                  <TableCell><strong>Last Seen:</strong></TableCell>
                  <TableCell>{deviceHeartbeat?.lastSeen || 'N/A'}</TableCell>
                </TableRow> */}
                {/* <TableRow style={{ backgroundColor: '#fbfbfb' }}>
                  <TableCell><strong>Service Status:</strong></TableCell>
                  <TableCell>{deviceHeartbeat?.serviceStatus || 'N/A'}</TableCell>
                </TableRow> */}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Drawer>
  );
};

export default DeviceDetailsSidebar;
