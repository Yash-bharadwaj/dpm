import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { GET_DEVICES_LIST, GET_HEARTBEAT_STATUS } from '../query/query';
import DeviceDetailsSidebar from './DeviceDetailsSidebar';
import '../index.css';
import { useNavigate } from 'react-router-dom';
import CircleIcon from '@mui/icons-material/Circle';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import VisibilityIcon from '@mui/icons-material/Visibility';
import eyeAnimationGif from "../assets/eyeanimation.gif";
import computeranimation from "../assets/computeranimation.gif";

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
  const [heartbeatStatus, setHeartbeatStatus] = useState<{ [key: string]: string | null }>({});

  const navigate = useNavigate();

  const { loading: devicesLoading, error: devicesError, data: devicesData } = useQuery(GET_DEVICES_LIST, {
    variables: { input: { orgcode: orgCode, devicecode: deviceCode } },
  });

  const [getHeartbeatStatus] = useMutation(GET_HEARTBEAT_STATUS, {
    onError: (error: any) => {
      console.error("Error fetching heartbeat status:", error);
    },
    onCompleted: (data: any, { variables }: any) => {
      if (data.getHeartbeat && data.getHeartbeat.resposestatus) {
        setHeartbeatStatus((prev) => ({
          ...prev,
          [variables.input.devicecode]: data.getHeartbeat.resposestatus,
        }));
      }
    },
  });

  useEffect(() => {
    if (devicesData) {
      devicesData.getLcdeviceList.forEach((device: Device) => {
        getHeartbeatStatus({
          variables: {
            input: {
              orgcode: device.orgcode,
              devicecode: device.devicecode,
            },
          },
        });
      });
    }
  }, [devicesData, getHeartbeatStatus]);

  const handleDeviceCodeClick = (device: Device) => {
    navigate('/config', { state: { orgcode: orgCode, devicecode: device.devicecode } });
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
    <div style={{ marginTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'start', gap: '1.3rem', width: '100%', height: '100vh' }}>
      <h3 style={{ alignSelf: 'self-start' }}>List of LC Devices</h3>
      <TableContainer component={Paper} style={{ width: '70%', borderRadius: '10px', boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px' }}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: '#11a1cd', color: 'white' }}>
              <TableCell style={{ color: 'white', flex: 1 }}><strong>Device Code</strong></TableCell>
              <TableCell style={{ color: 'white', flex: 1, }}><strong>Status</strong></TableCell>
              <TableCell style={{ color: 'white', flex: 1, display:'flex', justifyContent:'center' }}><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devicesData?.getLcdeviceList.map((device: Device) => (
              <TableRow
                key={device.deviceid}
                hover
                onClick={() => handleDeviceCodeClick(device)}
                style={{ cursor: 'pointer' }}
              >

                <TableCell
               
                  component="th"
                  scope="row"
                  style={{ fontWeight: 'normal', color: '#11a1cd', fontSize: "15px" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline';
                    e.currentTarget.style.fontWeight = '600';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none';
                    e.currentTarget.style.fontWeight = 'normal';
                  }}
                >
                   {/* <LaptopMacIcon style={{marginRight:'6px', fontSize:'22px'}}/> */}
                   <img src={computeranimation} alt="" style={{marginRight:'6px',}} />
                  {device.devicecode}
                </TableCell>
                <TableCell >
                  {heartbeatStatus[device.devicecode] === "true" ? (
                    <Button variant="outlined" color="success" style={{height:'25px'}}>
                      <CircleIcon style={{ fontSize: '9px', marginRight: '5px' }} /> Active
                    </Button>
                  ) : heartbeatStatus[device.devicecode] === "false" ? (
                    <Button variant="outlined" color="error">
                      <CircleIcon style={{ fontSize: '9px', marginRight: '3px', }} /> Inactive
                    </Button>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell style={{display:'flex', justifyContent:'center'}}>
                <img
                    src={eyeAnimationGif}
                    alt="View Details"
                    style={{
                      width: '25px',
                      cursor: 'pointer',
                      

                    }}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the button click from triggering the TableRow onClick
                      handleViewDetailsClick(device);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <DeviceDetailsSidebar open={sidebarOpen} onClose={handleCloseSidebar} device={selectedDevice} />
    </div>
  );
};

export default Home;