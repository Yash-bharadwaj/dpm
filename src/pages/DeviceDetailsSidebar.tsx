import React, { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import { Drawer, Typography, Box, Table, TableBody, TableCell, TableContainer, TableRow, Paper, Button } from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import { GET_HEARTBEAT_STATUS } from '../query/query';
import { useNavigate } from 'react-router-dom';
import CircleIcon from '@mui/icons-material/Circle';

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
  const [heartbeatStatus, setHeartbeatStatus] = useState<string | null>(null);

  const navigate = useNavigate();

  const [getHeartbeatStatus] = useMutation(GET_HEARTBEAT_STATUS, {
    onError: (error: any) => {
      console.error("Error fetching heartbeat status:", error);
      setHeartbeatStatus('Error fetching status');
    },
    onCompleted: (data: any) => {
      if (data.getHeartbeat && data.getHeartbeat.resposestatus) {
        setHeartbeatStatus(data.getHeartbeat.resposestatus);
      }
    },
  });

  useEffect(() => {
    if (device) {
      getHeartbeatStatus({
        variables: {
          input: {
            orgcode: device.orgcode,
            devicecode: device.devicecode,
          },
        },
      });
    }
  }, [device, getHeartbeatStatus]);

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
                <TableRow>
                  <TableCell><strong>Heartbeat Status:</strong></TableCell>
                  <TableCell>{heartbeatStatus === "true" ? (
                      <Button variant="outlined" color="success"><CircleIcon style={{fontSize:'9px' , marginRight:'3px'}}/>  Active</Button>
                    ) : (
                      heartbeatStatus || "Loading..."
                    )}</TableCell>
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