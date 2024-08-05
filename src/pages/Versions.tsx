import React, { useState } from "react";
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
} from "@mui/material";
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@mui/icons-material";

interface Version {
  id: string;
  lastUpdated: string;
  status: "deployed" | "in progress" | "saved" | "new" | "valid";
  timeline: { status: string; date: string; time: string }[];
}

const dummyData: Version[] = [
  {
    id: "v1",
    lastUpdated: "2024-07-01",
    status: "deployed",
    timeline: [
      { status: "new", date: "2024-06-25", time: "08:00 AM" },
      { status: "in progress", date: "2024-06-26", time: "10:00 AM" },
      { status: "valid", date: "2024-06-28", time: "02:00 PM" },
      { status: "deployed", date: "2024-07-01", time: "04:00 PM" },
    ],
  },
  {
    id: "v2",
    lastUpdated: "2024-07-02",
    status: "in progress",
    timeline: [
        { status: "new", date: "2024-06-25", time: "08:00 AM" },
        { status: "in progress", date: "2024-06-26", time: "10:00 AM" },
        { status: "valid", date: "2024-06-28", time: "02:00 PM" },
        { status: "deployed", date: "2024-07-01", time: "04:00 PM" },
    ],
  },
  {
    id: "v3",
    lastUpdated: "2024-07-03",
    status: "saved",
    timeline: [
        { status: "new", date: "2024-06-25", time: "08:00 AM" },
        { status: "in progress", date: "2024-06-26", time: "10:00 AM" },
        { status: "valid", date: "2024-06-28", time: "02:00 PM" },
        { status: "deployed", date: "2024-07-01", time: "04:00 PM" },
    ],
  },
  {
    id: "v4",
    lastUpdated: "2024-07-04",
    status: "new",
    timeline: [
        { status: "new", date: "2024-06-25", time: "08:00 AM" },
        { status: "in progress", date: "2024-06-26", time: "10:00 AM" },
        { status: "valid", date: "2024-06-28", time: "02:00 PM" },
        { status: "deployed", date: "2024-07-01", time: "04:00 PM" },
    ],
  },
  {
    id: "v5",
    lastUpdated: "2024-07-05",
    status: "valid",
    timeline: [
        { status: "new", date: "2024-06-25", time: "08:00 AM" },
        { status: "in progress", date: "2024-06-26", time: "10:00 AM" },
        { status: "valid", date: "2024-06-28", time: "02:00 PM" },
        { status: "deployed", date: "2024-07-01", time: "04:00 PM" },
    ],
  },
];

const statusColors:any = {
  deployed: "green",
  "in progress": "blue",
  saved: "orange",
  new: "gray",
  valid: "purple",
};

const statusOrder = ["new", "in progress", "valid", "deployed"];

const Versions: React.FC = () => {
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});

  const handleRowClick = (id: string) => {
    setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getTimelineStep = (status: string, timeline: any[]) => {
    const event = timeline.find((event) => event.status === status);
    return event ? (
      <div style={{ textAlign: "center", width: "100px" }}>
        <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
          <div
            style={{
              width: "8rem",
              height: "29px",
            borderRadius:'30px',
              backgroundColor: statusColors[status],
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight:'bold',
              padding:'10px'
            }}
          >
            {status.toUpperCase()}
          </div>
          <Typography style={{ marginTop: "8px" }}>{event.date}</Typography>
          <Typography>{event.time}</Typography>
        </div>
      </div>
    ) : (
      <div style={{ textAlign: "center", width: "100px" }}>
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: "lightgray",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      </div>
    );
  };

  return (
    <div style={{ marginTop: "3.5rem" }}>
      <h4>Versions:</h4>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow style={{backgroundColor:'#11a1cd'}}>
              <TableCell  style={{color:'white', fontWeight:'bold',width:'10vh'}}  />
              <TableCell style={{color:'white', fontWeight:'bold',width:'20vh'}}>Version ID</TableCell>
              <TableCell style={{color:'white', fontWeight:'bold', width:'20vh'}}>Last Updated</TableCell>
              <TableCell style={{color:'white', fontWeight:'bold', width:'20vh'}}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dummyData.map((version) => (
              <React.Fragment key={version.id}>
                <TableRow onClick={() => handleRowClick(version.id)} style={{ cursor: "pointer" }}>
                  <TableCell>
                    {openRows[version.id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </TableCell>
                  <TableCell>{version.id}</TableCell>
                  <TableCell>{version.lastUpdated}</TableCell>
                  <TableCell>
                    <Chip
                      label={version.status}
                      style={{backgroundColor:'transparent',color: "black" , borderRadius:'10px',border:`3px solid ${statusColors[version.status]}` }}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                    <Collapse in={openRows[version.id]} timeout="auto" unmountOnExit>
                      <Box margin={1}>
                        <Typography variant="h6" gutterBottom component="div" style={{ marginBottom: '16px', fontSize:'16px' }}>
                          Version Timeline :
                        </Typography>
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                          {statusOrder.map((status, index) => (
                            <React.Fragment key={status}>
                              {getTimelineStep(status, version.timeline)}
                              {index < statusOrder.length - 1 && (
                                <div
                                  style={{
                                    flexGrow: 1,
                                    height: "2px",
                                    backgroundColor: "lightgray",
                                    position: "relative",
                                    top: "12px",
                                  }}
                                />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Versions;