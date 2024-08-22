import React, { useState, useContext } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import DeviceDetailsSidebar from "./DeviceDetailsSidebar";
import "../index.css";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import computeranimation from "../assets/computeranimation.gif";

import { ImLocation2 } from "react-icons/im";
//@ts-ignore
import Lottie from 'react-lottie';
import loadingAnimation from '../utils/Loading.json';
import { useHeartbeatStatus } from "../hooks/HeartBeatStatus";
import { DeviceContext } from "../utils/DeviceContext";
import { formatDistanceToNow, parseISO } from 'date-fns';
import { GET_DEVICES_LIST, ADD_LC_DEVICE } from '../query/query'
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [newDevice, setNewDevice] = useState<{ code: string; location: string }>({ code: '', location: '' });

  const deviceContext = useContext(DeviceContext);
  const navigate = useNavigate();

  if (!deviceContext) {
    return <p>Error: DeviceContext is not available.</p>;
  }

  const { setSelectedDevice: setDeviceInContext } = deviceContext;

  // Add refetch to re-fetch data after mutation
  const { loading: devicesLoading, error: devicesError, data: devicesData, refetch } = useQuery(GET_DEVICES_LIST, {
    variables: { input: { orgcode: orgCode, devicecode: deviceCode } },
  });

  const [addDevice] = useMutation(ADD_LC_DEVICE);

  const heartbeatStatus = useHeartbeatStatus(devicesData?.getLcdeviceList || []);

  const handleDeviceCodeClick = (device: Device) => {
    setDeviceInContext(device.devicecode); 
    navigate(`/config/${device.orgcode}/${device.devicecode}`);
  };

  const handleViewDetailsClick = (device: Device) => {
    setSelectedDevice(device);
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setSelectedDevice(null);
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  if (devicesLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Lottie options={defaultOptions} height={200} width={200} />
      </div>
    );
  }

  if (devicesError) {
    return <p>Error loading devices: {devicesError.message}</p>;
  }

  const formatLastSeen = (lastSeen?: string | null) => {
    if (!lastSeen) return "N/A";
    
    const now = new Date();
    const lastSeenDate = parseISO(lastSeen);
    return formatDistanceToNow(lastSeenDate, { addSuffix: true });
  };

  const handleAddDeviceClick = () => {
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setNewDevice({ code: '', location: '' });
  };

  const generateDeviceCode = (code: string, location: string) => {
    const codePrefix = code.slice(0, 3).toUpperCase();
    const locationPrefix = location.slice(0, 3).toUpperCase();
    const randomNumbers = Math.floor(100 + Math.random() * 900);
    return `${codePrefix}_${locationPrefix}_${randomNumbers}`;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const devicecode = generateDeviceCode(newDevice.code, newDevice.location);
    try {
      const { data } = await addDevice({
        variables: { 
          input: {
            orgcode: orgCode,
            devicecode: devicecode,
            devicename: newDevice.code,  // As per the mutation, we're submitting the device name here
            devicelocation: newDevice.location
          }
        },
      });
      toast.success(data.addLcDevice.message);
      handleCloseForm();
      // Refresh data after adding a new device
      refetch();
    } catch (error) {
      toast.error("Failed to add device. Please try again.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewDevice(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div
      style={{
        marginTop: '4.5rem',
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        gap: "1.3rem",
        width: "90%",
        marginInline: '3rem',
        height: "100vh",
      }}
    >
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', padding: '2px', alignItems: 'center' }}>
        <h3 style={{ color: '#5a5a5a', fontSize: '1.6rem' }}>
          Pipeline Managers
        </h3>
        <Button
          variant="outlined"
          onClick={handleAddDeviceClick}
          style={{ marginLeft: 'auto', color: '#11a1cd', fontWeight: '600', border: '1px solid #11a1cd' }}
        >
          + Add Device
        </Button>
      </div>

      <TableContainer
        component={Paper}
        style={{
          width: "100%",
          marginInline: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "#EEEEEE", color: "black" }}>
              <TableCell><strong>Device Code</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Last Seen</strong></TableCell>
              <TableCell><strong>Device Location</strong></TableCell>
              <TableCell style={{ textAlign: "center" }}><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devicesData?.getLcdeviceList.map((device: Device) => (
              <TableRow
                key={device.deviceid}
                hover
                style={{ cursor: "pointer" }}
              >
                <TableCell
                  component="th"
                  scope="row"
                  onClick={() => handleDeviceCodeClick(device)}
                  style={{
                    color: "#11a1cd",
                    fontSize: "15px",
                    textDecoration: "underline",
                    cursor: "pointer"
                  }}
                >
                  <img
                    src={computeranimation}
                    alt=""
                    style={{ marginRight: "6px" }}
                  />
                  {device.devicecode}
                </TableCell>
                <TableCell>
                  {heartbeatStatus[device.devicecode]?.serviceStatus === "active" ? (
                    <Button
                      variant="contained"
                      style={{ height: "25px", fontWeight: "600", backgroundColor: '#DDF1EA', color: '#007867', boxShadow: 'none' }}
                    >
                      ACTIVE
                    </Button>
                  ) : heartbeatStatus[device.devicecode]?.serviceStatus === "in-active" ? (
                    <Button
                      variant="contained"
                      style={{ height: "25px", fontWeight: '600', backgroundColor: '#FFE6E2', color: '#B71C18', boxShadow: 'none' }}
                    >
                      INACTIVE
                    </Button>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell>
                  {heartbeatStatus[device.devicecode]?.lastSeen ? formatLastSeen(heartbeatStatus[device.devicecode]?.lastSeen) : "N/A"}
                </TableCell>
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ImLocation2 style={{ color: '#ff0000', fontSize: '14px', marginRight: '5px' }} />
                    {device.devicelocation || "N/A"}
                  </div>
                </TableCell>
                <TableCell style={{ textAlign: "center" }}>
                  <VisibilityIcon
                    style={{ color: "#222222", cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetailsClick(device);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <DeviceDetailsSidebar
        open={sidebarOpen}
        onClose={handleCloseSidebar}
        device={selectedDevice}
      />

      {/* Add Device Form Dialog */}
      <Dialog open={formOpen} onClose={handleCloseForm} fullWidth maxWidth="sm">
        <DialogTitle style={{borderTop: '10px solid #11a1cd'}}>Add New Device</DialogTitle>
        <DialogContent>
          <form onSubmit={handleFormSubmit} id="add-device-form">
            <TextField
              autoFocus
              margin="dense"
              id="code"
              name="code"
              label="Enter Device Code"
              type="text"
              fullWidth
              variant="outlined"
              value={newDevice.code}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="dense"
              id="location"
              name="location"
              label="Device Location"
              type="text"
              fullWidth
              variant="outlined"
              value={newDevice.location}
              onChange={handleInputChange}
              required
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} color="primary">
            Cancel
          </Button>
          <Button type="submit" form="add-device-form" color="primary" variant="contained" style={{backgroundColor: '#11a1cd', height: '29px'}}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </div>
  );
};

export default Home;
