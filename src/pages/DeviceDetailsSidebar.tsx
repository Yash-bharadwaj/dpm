import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Drawer, Typography, Box, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';

interface DeviceDetailsSidebarProps {
  open: boolean;
  onClose: () => void;
  device: Device | null;
}

interface Device {
  deviceid: string;
  orgcode: string;
  devicecode: string;
  devicetype: string;
  devicename: string;
  devicelocation: string;
  deviceip: string;
}

const DeviceDetailsSidebar: React.FC<DeviceDetailsSidebarProps> = ({ open, onClose, device }) => {
  const navigate = useNavigate();

  const handleDeviceCodeClick = () => {
    if (device) {
      navigate('/config', { state: { device } });
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box p={2.5} width="500px" role="presentation">
        <Typography variant="h6" style={{ fontWeight: '600' }} gutterBottom>
          Device Details:
        </Typography>
        {device && (
          <TableContainer component={Paper}>
            <Table style={{ boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px' }}>
              <TableBody>
                <TableRow style={{ backgroundColor: '#fbfbfb' }}>
                  <TableCell><strong>Device ID:</strong></TableCell>
                  <TableCell>{device.deviceid}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Org Code:</strong></TableCell>
                  <TableCell>{device.orgcode}</TableCell>
                </TableRow>
                <TableRow style={{ backgroundColor: '#fbfbfb' }}>
                  <TableCell><strong>Device Code:</strong></TableCell>
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
                  <TableCell><strong>Device Type:</strong></TableCell>
                  <TableCell>{device.devicetype}</TableCell>
                </TableRow>
                <TableRow style={{ backgroundColor: '#fbfbfb' }}>
                  <TableCell><strong>Device Name:</strong></TableCell>
                  <TableCell>{device.devicename}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Device Location:</strong></TableCell>
                  <TableCell>{device.devicelocation}</TableCell>
                </TableRow>
                <TableRow style={{ backgroundColor: '#fbfbfb' }}>
                  <TableCell><strong>Device IP:</strong></TableCell>
                  <TableCell>{device.deviceip}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Drawer>
  );
};

export default DeviceDetailsSidebar;
