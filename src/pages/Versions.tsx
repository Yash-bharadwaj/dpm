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
import { useQuery, useLazyQuery } from "@apollo/client";
import Lottie from "react-lottie";
import { GET_CONFIG_VERSION, GET_CONFIG_TIMELINE } from "../query/query";
import loadingAnimation from "../utils/Loading.json";
import { Display } from "react-bootstrap-icons";

interface Version {
  id: string;
  lastUpdated: string;
  status: "deployed" | "in progress" | "saved" | "new" | "valid" | "not deployed" | "draft";
}

const statusColors: Record<string, string> = {
  deployed: "green",
  "in progress": "#FFAF00",
  saved: "#399918",
  new: "blue",
  valid: "purple",
  "not deployed": "red",
  draft: "orange",
};

const Timeline: React.FC<{ timeline: { status: string; timestamp: string }[] }> = ({ timeline }) => {
  return (
    <Box style={{ position: 'relative', overflowX: 'auto', whiteSpace: 'nowrap', padding: '10px', display: 'flex', alignItems: 'center', gap:'6rem' }}>
      {timeline.map((event, index) => (
        <Box
          key={index}
          style={{
            display: 'inline-block',
            textAlign: 'center',
            position: 'relative',
            marginRight: index < timeline.length - 1 ? '40px' : '0', // Increased space for the line
          }}
        >
          {/* Line connecting statuses */}
          {index > 0 && (
            <Box
              style={{
                position: 'absolute',
                top: '50%',
                left: '-20px', // Position the line to the left of the current circle
                width: '20px',
                height: '2px',
                backgroundColor: statusColors[timeline[index - 1].status], // Match the color with the previous status
                zIndex: -1,
                transform: 'translateY(-50%)',
              }}
            />
          )}
          <Typography variant="caption" style={{ fontWeight: 'bold' }}>
            {event.timestamp}
          </Typography>
          <Box
            style={{
              border: `2px solid ${statusColors[event.status]}`,
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              margin: '0 auto',
              backgroundColor: statusColors[event.status],
              position: 'relative',
              zIndex: 1,
            }}
          />
          <Typography variant="caption" style={{ fontSize: '16px' }}>{event.status}</Typography>
        </Box>
      ))}
    </Box>
  );
};


// const Timeline: React.FC<{ timeline: { status: string; timestamp: string }[] }> = ({ timeline }) => {
//   return (
//     <Box style={{ overflowX: 'auto', whiteSpace: 'nowrap', padding: '10px' , display:'flex', gap:'8rem'}}>
//       {timeline.map((event, index) => (
//         <Box
//           key={index}
//           style={{
//             display: 'inline-block',
//             marginRight: '20px',
//             textAlign: 'center',
//           }}
//         >
//           <Typography variant="caption" style={{ fontWeight: 'bold' }}>
//             {event.timestamp}
//           </Typography>
//           <Box
//             style={{
//               border: `2px solid ${statusColors[event.status]}`,
//               borderRadius: '40%',
//               width: '20px',
//               height: '20px',
//               margin: '0 auto',
//               backgroundColor: statusColors[event.status],
//             }}
//           />
//           <Typography variant="caption" style={{fontSize:'16px'}}>{event.status}</Typography>
//         </Box>
//       ))}
//     </Box>
//   );
// };




const Versions: React.FC = () => {
  const [versionsData, setVersionsData] = useState<Version[]>([]);
  const [timelineData, setTimelineData] = useState<Record<string, { status: string; timestamp: string }[]>>({});
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

  const { loading: versionsLoading, error: versionsError, data: versionsDataResponse } = useQuery(GET_CONFIG_VERSION, {
    variables: {
      orgcode: "d3b6842d",
      devicecode: "DM_HY_D01",
      timezone: getCurrentTimezone(),
    },
  });

  const [fetchTimeline, { loading: timelineLoading, error: timelineError }] = useLazyQuery(GET_CONFIG_TIMELINE);

  useEffect(() => {
    if (versionsDataResponse) {
      const fetchedVersions = versionsDataResponse.getConfigVersion.map((version: any) => ({
        id: version.versionid,
        lastUpdated: version.lastmodified,
        status: version.status,
      }));
      setVersionsData(fetchedVersions);

      // Fetch timelines for each version
      fetchedVersions.forEach((version: Version) => {
        fetchTimelineData(version.id);
      });
    }
  }, [versionsDataResponse]);

  const fetchTimelineData = async (versionid: string) => {
    try {
      const { data } = await fetchTimeline({
        variables: {
          input: {
            orgcode: "d3b6842d",
            devicecode: "DM_HY_D01",
            versionid: versionid,
            timezone: getCurrentTimezone(),
          },
        },
      });

      const timeline = data?.getConfigTimeline || [];
      setTimelineData((prevData) => ({
        ...prevData,
        [versionid]: timeline,
      }));
    } catch (error) {
      console.error(`Error fetching timeline for version ${versionid}:`, error);
    }
  };

  if (versionsLoading || timelineLoading) {
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
  if (versionsError) return <p>Error: {versionsError.message}</p>;
  if (timelineError) return <p>Error: {timelineError.message}</p>;

  const handleRowClick = (id: string) => {
    const isCurrentlyOpen = openRows[id];
    setOpenRows((prev) => ({ ...prev, [id]: !isCurrentlyOpen }));
  };

  return (
    <TableContainer style={{ marginTop: "5rem" }} component={Paper}>
      <Table>
        <TableHead>
          <TableRow style={{ backgroundColor: "#EEEEEE", fontWeight: "600" }}>
            <TableCell style={{ width: "30px" }} />
            <TableCell style={{ fontWeight: "600" }}>Version ID</TableCell>
            <TableCell style={{ fontWeight: "600" }}>
              Last Updated <span style={{ fontSize: '13px' }}>({getCurrentTimezoneOffset()})</span>
            </TableCell>
            <TableCell style={{ fontWeight: "600" }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {versionsData.map((version: Version) => (
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
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                  <Collapse in={openRows[version.id]} timeout="auto" unmountOnExit>
                    <Box margin={1}>
                      <Typography variant="h6" gutterBottom component="div">
                        Timeline
                      </Typography>
                      {timelineData[version.id]?.length > 0 ? (
                        <Timeline timeline={timelineData[version.id]} />
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