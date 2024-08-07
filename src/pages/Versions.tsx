import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  Box,
  Chip,
  Typography,
  IconButton,
} from "@mui/material";
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@mui/icons-material";
import { useQuery } from "@apollo/client";
import Lottie from "react-lottie";
import { GET_CONFIG_VERSION } from "../query/query";
import loadingAnimation from "../utils/Loading.json";

interface Version {
  id: string;
  lastUpdated: string;
  status: "deployed" | "in progress" | "saved" | "new" | "valid" | "not deployed" | "draft";
  timeline: { status: string; date: string; time: string }[];
}

const statusColors: any = {
  deployed: "green",
  "in progress": "#FFAF00",
  saved: "#399918",
  new: "blue",
  valid: "purple",
  "not deployed": "red",
  draft: "orange",
};

const Versions: React.FC = () => {
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});

  const getCurrentTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };

  const getCurrentTimezoneOffset = () => {
    const offset = new Date().getTimezoneOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset % 60);
    const sign = offset <= 0 ? "+" : "-";
    return `UTC ${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };
  const { loading, error, data } = useQuery(GET_CONFIG_VERSION, {
    variables: {
      orgcode: "d3b6842d",
      devicecode: "DM_HY_D01",
      timezone: getCurrentTimezone(),
    },
  });

  useEffect(() => {
    if (data) {
      console.log("API Response:", data);
    }
  }, [data]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Lottie 
          options={{
            loop: true,
            autoplay: true,
            animationData: loadingAnimation,
            rendererSettings: {
              preserveAspectRatio: "xMidYMid slice"
            }
          }}
          height={400}
          width={400}
        />
      </div>
    );
  }
  if (error) return <p>Error: {error.message}</p>;

  const versions = data?.getConfigVersion.map((version: any) => ({
    id: version.versionid,
    lastUpdated: version.lastmodified,
    status: version.status,
    timeline: [], // Replace with actual timeline if available
  }));

  const handleRowClick = (id: string) => {
    setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <TableContainer style={{ marginTop: "5rem" }} component={Paper}>
      <Table>
        <TableHead>
          <TableRow style={{ backgroundColor: "#EEEEEE", fontWeight: "600" }}>
            <TableCell style={{ width: "30px" }} />
            <TableCell style={{ fontWeight: "600" }}>Version ID</TableCell>
            <TableCell style={{ fontWeight: "600" }}>
              Last Updated <span style={{ fontSize: '13px' }}>({getCurrentTimezoneOffset()}) </span>
            </TableCell>
            <TableCell style={{ fontWeight: "600" }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {versions.map((version: Version) => (
            <React.Fragment key={version.id}>
              <TableRow>
                <TableCell>
                  <IconButton
                    aria-label="expand row"
                    size="small"
                    onClick={() => handleRowClick(version.id)}
                  >
                    {openRows[version.id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </TableCell>
                <TableCell>{version.id}</TableCell>
                <TableCell>{version.lastUpdated}</TableCell>
                <TableCell>
                  <Chip
                    label={version.status}
                    style={{
                      backgroundColor: statusColors[version.status],
                      color: "white",
                      fontWeight: "600",
                      borderRadius: "7px",
                      height: "26px"
                    }}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                  <Collapse in={openRows[version.id]} timeout="auto" unmountOnExit>
                    <Box margin={1}>
                      <Typography variant="h6" gutterBottom component="div">
                        Timeline
                      </Typography>
                      {version.timeline.length > 0 ? (
                        <Table size="small" aria-label="timeline">
                          <TableHead>
                            <TableRow>
                              <TableCell>Status</TableCell>
                              <TableCell>Date</TableCell>
                              <TableCell>Time</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {version.timeline.map((event, index) => (
                              <TableRow key={index}>
                                <TableCell>{event.status}</TableCell>
                                <TableCell>{event.date}</TableCell>
                                <TableCell>{event.time}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <Typography>No timeline data available.</Typography>
                      )}
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Versions;