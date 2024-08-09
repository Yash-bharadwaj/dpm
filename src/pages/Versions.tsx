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
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@mui/icons-material";
import { useQuery, useLazyQuery } from "@apollo/client";
// @ts-ignore
import Lottie from "react-lottie";
import { GET_CONFIG_VERSION, GET_CONFIG_TIMELINE } from "../query/query";
import loadingAnimation from "../utils/Loading.json";
import { WiMoonAltNew } from "react-icons/wi";
import { RiDraftFill, RiProgress6Fill } from "react-icons/ri";
// Define status colors and icons
const statusColors: Record<string, string> = {
  deployed: "green",
  "in progress": "#FFAF00",
  saved: "#399918",
  new: "blue",
  valid: "purple",
  "not deployed": "red",
  draft: "orange",
};

const statusIcons: Record<string, JSX.Element> = {
  deployed: <span style={{ fontSize: 24, color: statusColors.deployed }}>✔️</span>,
  "in progress": <span style={{ fontSize: 24, color: statusColors["in progress"] }}><RiProgress6Fill /></span>,
  saved: <span style={{ fontSize: 24, color: statusColors.saved }}>💾</span>,
  new: <span style={{ fontSize: 24, color: statusColors.new }}><WiMoonAltNew /></span>,
  valid: <span style={{ fontSize: 24, color: statusColors.valid }}>✅</span>,
  "not deployed": <span style={{ fontSize: 24, color: statusColors["not deployed"] }}>❌</span>,
  draft: <span style={{ fontSize: 24, color: statusColors.draft }}><RiDraftFill /></span>,
};

interface Version {
  id: string;
  lastUpdated: string;
  status: "deployed" | "in progress" | "saved" | "new" | "valid" | "not deployed" | "draft";
}

interface TimelineEventData {
  status: string;
  timestamp: string;
}

const Versions: React.FC = () => {
  const [versionsData, setVersionsData] = useState<Version[]>([]);
  const [timelineData, setTimelineData] = useState<Record<string, TimelineEventData[]>>({});
  const [openRowId, setOpenRowId] = useState<string | null>(null);

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
          height={200}
          width={200}
        />
      </div>
    );
  }
  if (versionsError) return <p>Error: {versionsError.message}</p>;
  if (timelineError) return <p>Error: {timelineError.message}</p>;

  const handleRowClick = (id: string) => {
    setOpenRowId((prevId) => (prevId === id ? null : id));
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
                    {openRowId === version.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
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
                  <Collapse in={openRowId === version.id} timeout="auto" unmountOnExit>
                    <Box margin={1}>
                      <Typography variant="h6" gutterBottom component="div">
                        Timeline
                      </Typography>
                      {timelineData[version.id]?.length > 0 ? (
                        <Stepper orientation="horizontal">
                          {timelineData[version.id].map((event: TimelineEventData, index: number) => (
                            <Step key={index} active={true}>
                              <StepLabel
                                StepIconComponent={() => (
                                  <div style={{ textAlign: 'center' }}>
                                      <Typography variant="caption" style={{ color: 'grey' }}>
                                      {event.timestamp}
                                    </Typography>
                                    <div style={{ fontSize: 24, color: statusColors[event.status] || 'grey' }}>
                                      {statusIcons[event.status]}
                                    </div>
                                  
                                    <Typography variant="body2" style={{ color: statusColors[event.status] || 'grey' }}>
                                      {event.status}
                                    </Typography>
                                  </div>
                                )}
                              >
                                {/* Additional content can be placed here if needed */}
                              </StepLabel>
                            </Step>
                          ))}
                        </Stepper>
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