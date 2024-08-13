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
  TablePagination,
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
import { CiCirclePlus, CiCircleCheck } from "react-icons/ci";
import { TfiReload } from "react-icons/tfi";
import { MdVerified } from "react-icons/md";
import { RxCrossCircled } from "react-icons/rx";
import { FaRegArrowAltCircleDown } from "react-icons/fa";
import { GrInProgress } from "react-icons/gr";

// Define status colors and icons
const statusColors: Record<string, string> = {
  draft: "#1063ff",
  new: "#156cb3",
  converted: "#f4a460",
  deployed: "#75ee1b",
  valid: "#1c36bf",
  invalid: "#d51a22",
  received: "#00c853",
  inprogress: "#eb6c19",
};

const statusIcons: Record<string, JSX.Element> = {
  draft: <RiDraftFill />,
  new: <WiMoonAltNew />,
  converted: <TfiReload />,
  deployed: <MdVerified />,
  valid: <CiCircleCheck />,
  invalid: <RxCrossCircled />,
  received: <FaRegArrowAltCircleDown />,
  inprogress: <GrInProgress />,
};

interface Version {
  id: string;
  lastUpdated: string;
  status: keyof typeof statusColors;
}

interface TimelineEventData {
  status: keyof typeof statusColors;
  timestamp: string;
}

const Versions: React.FC = () => {
  const [versionsData, setVersionsData] = useState<Version[]>([]);
  const [timelineData, setTimelineData] = useState<Record<string, TimelineEventData[]>>({});
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

const handleChangePage = (event: unknown, newPage: number) => {
  setPage(newPage);
};

const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
  setRowsPerPage(parseInt(event.target.value, 10));
  setPage(0);
};

return (
  <TableContainer style={{ marginTop: "7rem", width: '70%', marginInline: '7rem' }} component={Paper}>
    <Table>
      <TableHead>
        <TableRow style={{ backgroundColor: "#EEEEEE", fontWeight: "600" }}>
          <TableCell style={{ width: "20px" }} />
          <TableCell style={{ fontWeight: "600", width:'10rem' }}>Version ID</TableCell>
          <TableCell style={{ fontWeight: "600", width: '20rem' }}>
            Last Updated
            <span style={{ fontSize: '13px' }}>({getCurrentTimezoneOffset()})</span>
          </TableCell>
          <TableCell style={{ fontWeight: "600", width: '10rem' }}>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {versionsData
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((version: Version) => (
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
                    icon={statusIcons[version.status]} // Add the icon
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
                        <Typography variant="body1">No timeline events available.</Typography>
                      )}
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}

</TableBody>
  </Table>
  <TablePagination
    rowsPerPageOptions={[5, 10, 25]}
    component="div"
    count={versionsData.length}
    rowsPerPage={rowsPerPage}
    page={page}
    onPageChange={handleChangePage}
    onRowsPerPageChange={handleChangeRowsPerPage}
  />
</TableContainer>

);
};

export default Versions;