import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Button, Divider, List, ListItem, ListItemText } from '@mui/material';
import { GET_DEVICES_LIST, GET_HEARTBEAT_STATUS } from '../query/query';
import DeviceDetailsSidebar from './DeviceDetailsSidebar';
import '../index.css';
import { useNavigate } from 'react-router-dom';

interface Device {
  deviceid: string;
  orgcode: string;
  devicecode: string;
  devicetype: string;
  devicename: string;
  devicelocation: string;
  deviceip: string;
}

const Home: React.FC = () => {

  const orgCode = "d3b6842d";
  const [deviceCode, setDeviceCode] = useState<string>("DM_HY_D01");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const navigate = useNavigate();

  const { loading: devicesLoading, error: devicesError, data: devicesData } = useQuery(GET_DEVICES_LIST, {
    variables: { input: { orgcode: orgCode, devicecode: deviceCode } },
  });

  const [getHeartbeatStatus] = useMutation(GET_HEARTBEAT_STATUS, {
    onError: (error: any) => {
      console.error("Error fetching heartbeat status:", error);
    },
    onCompleted: (data: any) => {
      if (data.getHeartbeat.data) {
        const parsedData = JSON.parse(data.getHeartbeat.data);
        console.log("Heartbeat Status:", parsedData);
      }
    },
  });

  const handleDeviceCodeClick = (device: Device) => {
    navigate('/config', { state: { device } });
  };

  const handleViewDetailsClick = (device: Device) => {
    setSelectedDevice(device);
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setSelectedDevice(null);
  };

  if (devicesLoading) return <p>Loading devices...</p>;
  if (devicesError) return <p>Error loading devices: {devicesError.message}</p>;

  return (
    <div style={{ marginTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <h3 style={{ alignSelf: 'self-start', marginLeft: '20rem' }}>List of LC Devices</h3>
      <div style={{ width: '50%', backgroundColor: '#fbfbfb', borderRadius: '10px', boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px' }}>
        <List>
          {devicesData?.getLcdeviceList.map((device: Device) => (
            <ListItem 
              key={device.deviceid} 
              button 
              onClick={() => handleDeviceCodeClick(device)} // Move the click handler to ListItem
              style={{ cursor: 'pointer' }}
            >
              <ListItemText 
                primary={device.devicecode}
                style={{ fontWeight: 'normal' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                  e.currentTarget.style.fontWeight = '600';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                  e.currentTarget.style.fontWeight = 'normal';
                }}
              />
              <Button 
                className='button-19'
                variant="outlined" 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent the button click from triggering the ListItem onClick
                  handleViewDetailsClick(device);
                }}
              >
                View Details
              </Button>
            </ListItem>
          ))}
        </List>
      </div>
      <DeviceDetailsSidebar open={sidebarOpen} onClose={handleCloseSidebar} device={selectedDevice} />
    </div>
  );
};

export default Home;