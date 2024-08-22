import React, { useState, useContext } from "react";
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
} from "@mui/material";
import DeviceDetailsSidebar from "./DeviceDetailsSidebar";
import "../index.css";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import computeranimation from "../assets/computeranimation.gif";

import { ImLocation2 } from "react-icons/im";
//@ts-ignore
import Lottie from "react-lottie";
import loadingAnimation from "../utils/Loading.json";
import { useHeartbeatStatus } from "../hooks/HeartBeatStatus";
import { DeviceContext } from "../utils/DeviceContext";
import { formatDistanceToNow, isValid, parseISO } from "date-fns";
import { GET_DEVICES_LIST, ADD_LC_DEVICE } from "../query/query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../index.css'
import { FaInfoCircle, } from "react-icons/fa";
import { LuCopy } from "react-icons/lu";

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

  const deviceContext = useContext(DeviceContext);
  const navigate = useNavigate();

  if (!deviceContext) {
    return <p>Error: DeviceContext is not available.</p>;
  }

  const { setSelectedDevice: setDeviceInContext } = deviceContext;

  // Add refetch to re-fetch data after mutation
  const {
    loading: devicesLoading,
    error: devicesError,
    data: devicesData,
    refetch,
  } = useQuery(GET_DEVICES_LIST, {
    variables: { input: { orgcode: orgCode, devicecode: deviceCode } },
  });

  const [addDevice] = useMutation(ADD_LC_DEVICE);

  const heartbeatStatus = useHeartbeatStatus(
    devicesData?.getLcdeviceList || []
  );

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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Lottie options={defaultOptions} height={200} width={200} />
      </div>
    );
  }

  if (devicesError) {
    return <p>Error loading devices: {devicesError.message}</p>;
  }

  const formatLastSeen = (lastSeen?: string | null) => {
    if (!lastSeen) return 'N/A';
  
    const lastSeenDate = parseISO(lastSeen);
  
    // Check if the parsed date is valid
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
    return `${codePrefix}_${locationPrefix}_${randomNumbers}`;
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

      refetch();
    } catch (error) {
      toast.error("Failed to add device. Please try again.");
    }
  };

  const copyToClipboard = () => {
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

  return (
    <div
      style={{
        marginTop: "4.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        gap: "1.3rem",
        width: "90%",
        marginInline: "3rem",
        height: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          padding: "2px",
          alignItems: "center",
        }}
      >
        <h3 style={{ color: "#5a5a5a", fontSize: "1.6rem" }}>
          Pipeline Managers
        </h3>
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
              <TableCell>
                <strong>Device Code</strong>
              </TableCell>
              <TableCell>
                <strong>Device Name</strong>
              </TableCell>

              <TableCell>
                <strong>Status</strong>
              </TableCell>
              <TableCell>
                <strong>Last Seen</strong>
              </TableCell>
              <TableCell>
                <strong>Device Location</strong>
              </TableCell>
              <TableCell style={{ textAlign: "center" }}>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devicesData?.getLcdeviceList.map((device: Device) => (
              <TableRow key={device.deviceid} hover style={{ cursor: "pointer" }}>
                <TableCell
                  component="th"
                  scope="row"
                  onClick={() => handleDeviceCodeClick(device)}
                  style={{
                    color: "#11a1cd",
                    fontSize: "15px",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={computeranimation}
                    alt=""
                    style={{ marginRight: "6px" }}
                  />
                  {device.devicecode}
                </TableCell>
                <TableCell>{device.devicename}</TableCell>
                <TableCell>
                  {heartbeatStatus[device.devicecode]?.serviceStatus ===
                  "active" ? (
                    <Button
                      variant="contained"
                      style={{
                        height: "25px",
                        fontWeight: "600",
                        backgroundColor: "#DDF1EA",
                        color: "#007867",
                        boxShadow: "none",
                      }}
                    >
                      ACTIVE
                    </Button>
                  ) : heartbeatStatus[device.devicecode]?.serviceStatus ===
                    "in-active" ? (
                    <Button
                      variant="contained"
                      style={{
                        height: "25px",
                        fontWeight: "600",
                        backgroundColor: "#FFF2F2",
                        color: "#E23428",
                        boxShadow: "none",
                      }}
                    >
                      INACTIVE
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      style={{
                        height: "25px",
                        fontWeight: "600",
                        backgroundColor: "#e6f3f7",
                        color: "#0F5EF7",
                        boxShadow: "none",
                      }}
                    >
                      PENDING
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  {formatLastSeen(heartbeatStatus[device.devicecode]?.lastSeen)}
                </TableCell>
                <TableCell> 
                  <ImLocation2 style={{marginRight:'5px', color:'#ff1919'}}/>
                  {device.devicelocation}</TableCell>
                <TableCell style={{ textAlign: "center" }}>
                  <VisibilityIcon
                    onClick={() => handleViewDetailsClick(device)}
                    style={{
                      color: "#191919",
                      fontSize: "25px",
                      cursor: "pointer",
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={formOpen} onClose={handleCloseForm} >
        <DialogTitle style={{borderTop:'7px solid #11a1cd', height:'40px', marginBottom:'0.5rem'}}>Add New Device</DialogTitle>
        <DialogContent  >


          <form onSubmit={handleFormSubmit}  >
            
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
             <p style={{fontSize:'16px', fontWeight:'600' , fontStyle:'',marginTop:'1rem',marginBottom:'0px'}}>Install Script :</p>
             <div
  style={{
    position: "relative",
    backgroundColor: "#F5F5F5",
    padding: "1rem",
    marginTop: "5px",
  }}
>
  <button
    onClick={copyToClipboard}
    style={{
      position: "absolute",
      bottom: "9.2rem",
      right: "0px",
      background: "transparent",
      border: "none",
      cursor: "pointer",
      color:'grey'
    }}
  >
     
   <p style={{fontSize:'13px', margin:'0px' , }}> <LuCopy style={{marginRight:'5px'}} />Copy</p>
  </button>
  <pre id="installScript">
    curl -Ls https://prod1-us.blusapphire.net/export/install/scripts/install-dpm.sh | bash -s -- \<br />
    --orgcode "{orgCode}" \<br />
    --devicecode "{newDevice.generatedCode}" \<br />
    --accesskey "{newDevice.accessKey}" \<br />
    --secretkey "{newDevice.secretKey}"
  </pre>
</div>

            <p style={{fontSize:'13px', marginTop:'5px', marginBottom:'0px'}}> <FaInfoCircle style={{fontSize:'13px'}}/> Copy this script and excute as root on DPM host </p>
            <DialogActions>
              <Button style={{color:'#11a1cd', }} onClick={handleCloseForm}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" style={{backgroundColor:'#11a1cd', height:'30px', fontWeight:'600'}}>
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
      />
      <ToastContainer />
    </div>
  );
};

export default Home;
