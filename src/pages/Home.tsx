import React, { useState, useContext } from "react";
import { useQuery } from "@apollo/client";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { GET_DEVICES_LIST } from "../query/query";
import DeviceDetailsSidebar from "./DeviceDetailsSidebar";
import "../index.css";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import computeranimation from "../assets/computeranimation.gif";
import { ImLocation2 } from "react-icons/im";
import Lottie from 'react-lottie';
import loadingAnimation from '../utils/Loading.json';
import { useHeartbeatStatus } from "../hooks/HeartBeatStatus";
import { DeviceContext } from "../utils/DeviceContext";

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
  } = useQuery(GET_DEVICES_LIST, {
    variables: { input: { orgcode: orgCode, devicecode: deviceCode } },
  });

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

  if (devicesError) return <p>Error loading devices: {devicesError.message}</p>;

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
      <h3 style={{ alignSelf: "self-start", color: '#5a5a5a', fontSize: '1.6rem' }}>
        Pipeline Managers
      </h3>
      <TableContainer
        component={Paper}
        style={{
          marginTop: '0rem',
          width: "100%",
          marginInline: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: "#EEEEEE", color: "black" }}>
              <TableCell style={{ color: "black", flex: 1 }}>
                <strong>Device Code</strong>
              </TableCell>
              <TableCell style={{ color: "black", flex: 1 }}>
                <strong>Status</strong>
              </TableCell>
              <TableCell style={{ color: "black", flex: 1 }}>
                <strong>Last Seen</strong>
              </TableCell>
              <TableCell style={{ color: "black", flex: 1 }}>
                <strong>Device Location</strong>
              </TableCell>
              <TableCell
                style={{
                  color: "black",
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <strong>Actions</strong>
              </TableCell>
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
                  style={{
                    fontWeight: "normal",
                    color: "#11a1cd",
                    fontSize: "15px",
                    textDecoration: "underline",
                    cursor: "pointer"
                  }}
                  onClick={() => handleDeviceCodeClick(device)}
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
                  {heartbeatStatus[device.devicecode]?.lastSeen || "N/A"}
                </TableCell>
                <TableCell>
                  <div style={{ height: '1.4rem', width: '7rem', display: 'flex', gap: '5px', alignItems: 'center', }}>
                    <ImLocation2 style={{ color: '#ff0000', fontSize: '14px', marginLeft: '.5rem' }} /> {device.devicelocation || "N/A"}
                  </div>
                </TableCell>
                <TableCell style={{ display: "flex", justifyContent: "center" }}>
                  <VisibilityIcon
                    style={{ color: "#222222" }}
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
    </div>
  );
};

export default Home;