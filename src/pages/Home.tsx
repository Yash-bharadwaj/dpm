import React, { useState, useContext, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
} from "@mui/material";
import DeviceDetailsSidebar from "./DeviceDetailsSidebar";
import "../index.css";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import computeranimation from "../assets/computeranimation.gif";
import { ImLocation2 } from "react-icons/im";
import { DeviceContext } from "../utils/DeviceContext";
import { differenceInMinutes, parseISO, formatDistanceToNow, isValid } from "date-fns";
import { GET_DEVICES_LIST, ADD_LC_DEVICE, DELETE_LC_DEVICE, GET_HEARTBEAT_STATUS } from "../query/query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../index.css';
import { FaInfoCircle } from "react-icons/fa";
import { LuCopy } from "react-icons/lu";
import { MdDeleteForever } from "react-icons/md";
import { IoIosWarning, IoMdRefresh } from "react-icons/io";

interface Device {
  versionid: any;
  deviceid: string;
  orgcode: string;
  devicecode: string;
  devicetype: string;
  devicename: string;
  devicelocation: string;
  deviceip: string;
}

interface HeartbeatStatus {
  status: string | null;
  lastSeen: string | null;
  serviceStatus: string | null;
  ipAddress: string | null;
  hardwareInfo: {
    cpuUsage: number | null;
    totalMemory: string | null;
    memoryUsage: string | null;
    memoryPercent: number | null;
    cpuCores: number | null;
  };
}

const Home: React.FC = () => {
  const orgCode = "d3b6842d";
  const [deviceCode, setDeviceCode] = useState<string>("DEM-HYD-248");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);
  const [deleteInput, setDeleteInput] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [newDevice, setNewDevice] = useState<{
    code: string;
    location: string;
    generatedCode: string;
    accessKey: string;
    secretKey: string;
  }>({
    code: "",
    location: "",
    generatedCode: "",
    accessKey: "",
    secretKey: "",
  });
  const [heartbeatStatus, setHeartbeatStatus] = useState<{ [key: string]: HeartbeatStatus }>({});
  const [refreshingDevices, setRefreshingDevices] = useState<string[]>([]);

  const [deleteDevice] = useMutation(DELETE_LC_DEVICE);
  const [getHeartbeatStatus] = useMutation(GET_HEARTBEAT_STATUS);

  const deviceContext = useContext(DeviceContext);
  const navigate = useNavigate();

  if (!deviceContext) {
    return <p>Error: DeviceContext is not available.</p>;
  }

  const { setSelectedDevice: setDeviceInContext } = deviceContext;

  const {
    loading: devicesLoading,
    error: devicesError,
    data: devicesData,
    refetch: refetchDevices,
  } = useQuery(GET_DEVICES_LIST, {
    variables: { input: { orgcode: orgCode, devicecode: deviceCode } },
  });

  const [addDevice] = useMutation(ADD_LC_DEVICE);

  const refreshHeartbeatStatus = useCallback(async (device: Device) => {
    setRefreshingDevices(prev => [...prev, device.devicecode]);
    try {
      const { data } = await getHeartbeatStatus({
        variables: {
          input: {
            orgcode: device.orgcode,
            devicecode: device.devicecode,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        },
      });

      if (data.getHeartbeat && data.getHeartbeat.responsestatus) {
        const responseData = JSON.parse(data.getHeartbeat.responsedata);
        setHeartbeatStatus(prev => ({
          ...prev,
          [device.devicecode]: {
            status: responseData.status || null,
            lastSeen: responseData.system_info?.last_seen || null,
            serviceStatus: responseData.service_status || null,
            ipAddress: responseData.system_info?.ip_address || null,
            hardwareInfo: {
              cpuUsage: responseData.hardware_info?.cpu_usage || null,
              totalMemory: responseData.hardware_info?.total_memory || null,
              memoryUsage: responseData.hardware_info?.used_memory_gb || null,
              memoryPercent: responseData.hardware_info?.memory_usage_percent || null,
              cpuCores: responseData.hardware_info?.cpu_cores || null,
            },
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching heartbeat status:", error);
      toast.error(`Failed to refresh status for device ${device.devicecode}`);
    } finally {
      setRefreshingDevices(prev => prev.filter(code => code !== device.devicecode));
    }
  }, [getHeartbeatStatus]);

  const handleRefresh = useCallback(() => {
    devicesData?.getLcdeviceList.forEach((device: Device) => {
      refreshHeartbeatStatus(device);
    });
  }, [devicesData, refreshHeartbeatStatus]);

  useEffect(() => {
    if (devicesData?.getLcdeviceList && !devicesLoading) {
      handleRefresh();
    }
  }, [devicesData, devicesLoading, handleRefresh]);

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

  if (devicesLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <img src={import.meta.env.VITE_BLUSAPPHIRE_LOADING_GIF} height="50em" alt="Loading" />
      </div>
    );
  }

  if (devicesError) {
    return <p>Error loading devices: {devicesError.message}</p>;
  }

  const formatLastSeen = (lastSeen?: string | null) => {
    if (!lastSeen) return 'N/A';
    const lastSeenDate = parseISO(lastSeen);
    if (!isValid(lastSeenDate)) return 'N/A';
    return formatDistanceToNow(lastSeenDate, { addSuffix: true });
  };

  const handleAddDeviceClick = () => {
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setNewDevice({
      code: "",
      location: "",
      generatedCode: "",
      accessKey: "",
      secretKey: "",
    });
  };

  const generateDeviceCode = (code: string, location: string) => {
    const codePrefix = code.slice(0, 3).toUpperCase();
    const locationPrefix = location.slice(0, 3).toUpperCase();
    const randomNumbers = Math.floor(100 + Math.random() * 900);
    return `${codePrefix}-${locationPrefix}-${randomNumbers}`;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const devicecode = newDevice.generatedCode;
    try {
      const { data } = await addDevice({
        variables: {
          input: {
            orgcode: orgCode,
            devicecode: devicecode,
            devicename: newDevice.code,
            devicelocation: newDevice.location,
          },
        },
      });
      toast.success(data.addLcDevice.message);
      handleCloseForm();
      refetchDevices();
    } catch (error) {
      toast.error("Failed to add device. Please try again.");
    }
  };

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();  
    e.preventDefault();  
    const copyText = document.getElementById("installScript")?.textContent || "";
    navigator.clipboard.writeText(copyText).then(() => {
      toast.success("Copied to clipboard");
    }).catch(() => {
      toast.error("Failed to copy");
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedDevice = { ...newDevice, [name]: value };

    if (name === "code" || name === "location") {
      const generatedCode = generateDeviceCode(
        updatedDevice.code,
        updatedDevice.location
      );
      updatedDevice.generatedCode = generatedCode;
    }

    setNewDevice(updatedDevice);
  };

  const handleDeleteClick = (device: Device) => {
    setDeviceToDelete(device);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deviceToDelete) return;
  
    const input = {
      orgcode: deviceToDelete.orgcode,
      devicecode: deviceToDelete.devicecode,
      devicename: deviceToDelete.devicename,
      devicelocation: deviceToDelete.devicelocation,
      versionid: deviceToDelete.deviceid, 
    };
  
    try {
      const response = await deleteDevice({ variables: { input } });
      toast.success(`${deviceToDelete.devicename} deleted successfully`);
      setDeleteDialogOpen(false);
      setDeleteInput("");
      refetchDevices();
    } catch (error) {
      console.error('Error details:', error);
      toast.error("Failed to delete device. Please try again.");
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteInput("");
  };

  return (
    <div style={{ marginTop: "4.5rem", display: "flex", flexDirection: "column", alignItems: "start", gap: "1.3rem", width: "90%", marginInline: "3rem", height: "100vh" }}>
      <div style={{ display: "flex", width: "100%", justifyContent: "space-between", padding: "2px", alignItems: "center" }}>
        <h3 style={{ color: "#5a5a5a", fontSize: "1.6rem" }}>Pipeline Managers</h3>
        <div>
          <Button
            variant="outlined"
            onClick={handleRefresh}
            style={{
              marginLeft: "auto",
              color: "#11a1cd",
              fontWeight: "600",
              border: "1px solid #11a1cd",
              margin: '4px'
            }}
          >
            <IoMdRefresh style={{marginRight:'4px'}} />
            refresh
          </Button>
          <Button
            variant="outlined"
            onClick={handleAddDeviceClick}
            style={{
              marginLeft: "auto",
              color: "#11a1cd",
              fontWeight: "600",
              border: "1px solid #11a1cd",
            }}
          >
            + Add Device
          </Button>
        </div>
      </div>

      <TableContainer component={Paper} style={{ width: "100%", marginInline: "auto", display: "flex", flexDirection: "column" }}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "#EEEEEE", color: "black" }}>
              <TableCell><strong>Device Code</strong></TableCell>
              <TableCell><strong>Device Name</strong></TableCell>
              <TableCell><strong>IP Address</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Last Heartbeat</strong></TableCell>
              <TableCell><strong>Memory</strong></TableCell>
              <TableCell><strong>Device Location</strong></TableCell>
              <TableCell style={{ textAlign: "center" }}><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devicesData?.getLcdeviceList.map((device: Device) => (
              <TableRow key={device.deviceid} hover style={{ cursor: "pointer" }}>
                <TableCell component="th" scope="row" onClick={() => handleDeviceCodeClick(device)} style={{ color: "#11a1cd", fontSize: "15px", textDecoration: "underline", cursor: "pointer" }}>
                  <img src={computeranimation} alt="" style={{ marginRight: "6px" }} />
                  {device.devicecode}
                </TableCell>
                <TableCell>{device.devicename}</TableCell>
                <TableCell>{heartbeatStatus[device.devicecode]?.ipAddress}</TableCell>
                <TableCell>
                  {refreshingDevices.includes(device.devicecode) ? (
                    <CircularProgress size={20} />
                  ) : heartbeatStatus[device.devicecode]?.serviceStatus === "active" &&
                    heartbeatStatus[device.devicecode]?.lastSeen &&
                    differenceInMinutes(new Date(), parseISO(heartbeatStatus[device.devicecode].lastSeen || '')) <= 10 ? (
                    <Button variant="contained" style={{ height: "25px", fontWeight: "600", backgroundColor: "#DDF1EA", color: "#007867", boxShadow: "none" }}>
                      ACTIVE
                    </Button>
                  ) : (
                    <Button variant="contained" style={{ height: "25px", fontWeight: "600", backgroundColor: "#FFF2F2", color: "#E23428", boxShadow: "none" }}>
                      INACTIVE
                    </Button>
                  )}
                </TableCell>
                <TableCell>{formatLastSeen(heartbeatStatus[device.devicecode]?.lastSeen)}</TableCell>
                <TableCell>
                  {refreshingDevices.includes(device.devicecode) ? (
                    <CircularProgress size={20} />
                  ) : (
                    `${heartbeatStatus[device.devicecode]?.hardwareInfo?.memoryUsage || "0"} / ${heartbeatStatus[device.devicecode]?.hardwareInfo?.totalMemory || '0'} (${heartbeatStatus[device.devicecode]?.hardwareInfo?.memoryPercent || '0'})`
                  )}
                </TableCell>
                <TableCell>
                  <ImLocation2 style={{ marginRight: '5px', color: '#ff1919' }} />
                  {device.devicelocation}
                </TableCell>
                <TableCell style={{ textAlign: "center", display: 'flex', justifyContent: 'center', gap: '15px' }}>
                  <VisibilityIcon
                    onClick={() => handleViewDetailsClick(device)}
                    style={{
                      color: "#5a5a5a",
                      fontSize: "25px",
                      cursor: "pointer",
                    }}
                  />
                  <MdDeleteForever
                    onClick={() => handleDeleteClick(device)}
                    style={{
                      color: "#c70000",
                      fontSize: "24px",
                      cursor: "pointer",
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle style={{fontWeight:'600', height:'55px'}}>
          <IoIosWarning style={{ color: '#c70000', marginRight: '4px', marginBottom:'3px' }} /> Confirm Deletion
        </DialogTitle>
        <DialogTitle style={{ borderTop: '2px solid #c70000', height: '9rem' }}>
          <p style={{ fontSize: '16px', padding: '08px' }}>
            <p>
              Are you sure you want to permanently delete the device <b>{deviceToDelete?.devicename}</b>
              <br />and its configuration?
            </p>
            <div style={{ marginTop: '8px' }}>
              <span>
                Device Name: <b>{deviceToDelete?.devicename}</b>
                <br />
                Device Location: <b>{deviceToDelete?.devicelocation}</b>
              </span>
            </div>
          </p>
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Enter device name"
            placeholder="Enter device Name to delete.."
            value={deleteInput}
            onChange={(e) => setDeleteInput(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions style={{marginBottom:'1rem', marginRight:'10px'}}>
          <Button onClick={handleCloseDeleteDialog} style={{ color: '#11a1cd' }}>
            No, Keep it
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            style={{
              backgroundColor: deleteInput === deviceToDelete?.devicename ? '#c70000' : '#D3D3D3',
              color: deleteInput === deviceToDelete?.devicename ? 'white' : '#3b3b3b',
            }}
            disabled={deleteInput !== deviceToDelete?.devicename}
          >
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={formOpen} onClose={handleCloseForm}>
        <DialogTitle style={{ borderTop: '7px solid #11a1cd', height: '40px', marginBottom: '0.5rem' }}>Add New Device</DialogTitle>
        <DialogContent>
          <form onSubmit={handleFormSubmit}>
            <TextField
              label="Device Name"
              name="code"
              value={newDevice.code}
              onChange={handleInputChange}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              label="Device Location"
              name="location"
              value={newDevice.location}
              onChange={handleInputChange}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              label="Access Key"
              name="accessKey"
              value={newDevice.accessKey}
              onChange={handleInputChange}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              label="Secret Key"
              name="secretKey"
              value={newDevice.secretKey}
              onChange={handleInputChange}
              required
              fullWidth
              margin="normal"
              type="password"
            />
            <TextField
              label="Device Code"
              name="generatedCode"
              value={newDevice.generatedCode}
              disabled
              fullWidth
              margin="normal"
            />
            <p style={{ fontSize: '16px', fontWeight: '600', fontStyle: '', marginTop: '1rem', marginBottom: '0px' }}>Install Script :  <button
                onClick={copyToClipboard}
                style={{
                  position: "absolute",
                  bottom: "10.2rem",
                  right: "5px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: 'grey'
                }}
              >
                <p style={{ fontSize: '13px', margin: '0px' }}> <LuCopy style={{ marginRight: '5px' }} />Copy</p>
              </button></p>
            <div
              style={{
                position: "relative",
                backgroundColor: "#F5F5F5",
                padding: "1rem",
                marginTop: "5px",
              }}
            >
             
              <pre id="installScript">
                curl -Ls https://prod1-us.blusapphire.net/export/install/scripts/install-dpm.sh | bash -s -- \
                --orgcode "{orgCode}" \
                --devicecode "{newDevice.generatedCode}" \
                --accesskey "{newDevice.accessKey}" \
                --secretkey "{newDevice.secretKey}"
              </pre>
            </div>
            <p style={{ fontSize: '13px', marginTop: '5px', marginBottom: '0px' }}> <FaInfoCircle style={{ fontSize: '13px' }} /> Copy this script and execute as root on DPM host </p>
            <DialogActions>
              <Button style={{ color: '#11a1cd' }} onClick={handleCloseForm}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" style={{ backgroundColor: '#11a1cd', height: '30px', fontWeight: '600' }}>
                Add
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      <DeviceDetailsSidebar
        open={sidebarOpen}
        onClose={handleCloseSidebar}
        device={selectedDevice}
        heartbeatStatus={heartbeatStatus[selectedDevice?.devicecode || '']}
      />
      <ToastContainer />
    </div>
  );
};

export default Home;