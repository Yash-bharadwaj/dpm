import React, { useContext, useEffect, useState } from "react";
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
  Dialog,
  Button,
  DialogActions,
  DialogContent,
  Checkbox,
  FormControlLabel,
  DialogTitle,
} from "@mui/material";
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@mui/icons-material";
import { useQuery, useLazyQuery } from "@apollo/client";
//@ts-ignore
import Lottie from "react-lottie";
import { GET_CONFIG_VERSION, GET_CONFIG_TIMELINE} from "../query/query";
import loadingAnimation from "../utils/Loading.json";
import { FaRegCheckCircle } from "react-icons/fa";
import { RxCrossCircled } from "react-icons/rx";
import { TbAlertTriangleFilled } from "react-icons/tb";
import { useParams } from "react-router-dom";
import { DeviceContext } from "../utils/DeviceContext";
import { MdOutlineFilterList } from "react-icons/md";
import "../App.css";

// Define status colors and icons for table chips
const statusIcons: Record<string, JSX.Element> = {
  invalid: <TbAlertTriangleFilled style={{ color: '#a70000' }} />,
  notvalid: <TbAlertTriangleFilled style={{ color: '#a70000' }} />,
  notdeployed: <RxCrossCircled style={{ color: '#d51a22' }} />,
  failed: <TbAlertTriangleFilled style={{ color: '#d51a22' }} />,
  draft: <FaRegCheckCircle style={{ color: '#4BB543' }} />,
  new: <FaRegCheckCircle style={{ color: '#4BB543' }} />,
  converted: <FaRegCheckCircle style={{ color: '#4BB543' }} />,
  deployed: <FaRegCheckCircle style={{ color: '#4BB543' }} />,
  valid: <FaRegCheckCircle style={{ color: '#4BB543' }} />,
  received: <FaRegCheckCircle style={{ color: '#4BB543' }} />,
  inprogress: <FaRegCheckCircle style={{ color: '#4BB543' }} />,
  "in-progress": <FaRegCheckCircle style={{ color: '#4BB543' }}/>,
  "not-deployed": <RxCrossCircled style={{ color: '#d51a22' }} />,

 
};

const statusColors: Record<string, string> = {
  invalid: "#ffbaba",
  notvalid: "#d51a22",
  notdeployed: "#d51a22",
  failed: "#d51a22",
  draft: "#DDF1EA",
  new: "#4BB543",
  converted: "#4BB543",
  deployed: "#DDF1EA",
  valid: "#4BB543",
  received: "#4BB543",
  inprogress: "#007867",
};

const timelineColors: Record<string, { iconColor: string; textColor: string }> = {
  invalid: { iconColor: 'black', textColor: 'black' },
  notdeployed: { iconColor: '#d51a22', textColor: 'red' },
  failed: { iconColor: '#d51a22', textColor: 'red' },
  draft: { iconColor: '#007867', textColor: 'black' },
  new: { iconColor: '#007867', textColor: 'black' },
  converted: { iconColor: '#007867', textColor: 'black' },
  deployed: { iconColor: '#007867', textColor: 'black' },
  valid: { iconColor: '#4BB543', textColor: 'black' },
  received: { iconColor: '#4BB543', textColor: 'black' },
  inprogress: { iconColor: '#4BB543', textColor: 'black' },
  "in-progress": { iconColor: '#4BB543', textColor: 'black' },
  "not-deployed": { iconColor: '#d51a22', textColor: 'black' },
};

interface Version {
  id: string;
  lastUpdated: string;
  status: keyof typeof statusIcons;
  comment:string;
}

interface TimelineEventData {
  status: keyof typeof statusIcons;
  timestamp: string;
}

const Versions: React.FC = () => {
  const { devicecode } = useParams();
  const context = useContext(DeviceContext);

  if (context === undefined) {
    throw new Error("DeviceContext must be used within a DeviceProvider");
  }

  const { selectedDevice } = context;
  const deviceCodeFromContext = selectedDevice || devicecode;

  const orgCode = "d3b6842d";

  const [versionsData, setVersionsData] = useState<Version[]>([]);
  const [timelineData, setTimelineData] = useState<Record<string, TimelineEventData[]>>({});
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<Set<keyof typeof statusIcons>>(
    new Set(Object.keys(statusIcons) as Array<keyof typeof statusIcons>)
  );

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
      orgcode: orgCode,
      devicecode: deviceCodeFromContext,
      timezone: getCurrentTimezone(),
    },
  });

  const [fetchTimeline, {  error: timelineError }] = useLazyQuery(GET_CONFIG_TIMELINE);

  useEffect(() => {
    if (versionsDataResponse) {
      const fetchedVersions = versionsDataResponse.getConfigVersion.map((version: any) => ({
        id: version.versionid,
        lastUpdated: version.lastmodified,
        status: version.status,
        comment: version.comment || "No comment",
      }));
      setVersionsData(fetchedVersions);
    }
  }, [versionsDataResponse]);


  
  const fetchTimelineData = async (versionid: string) => {
    try {
      const { data } = await fetchTimeline({
        variables: {
          input: {
            orgcode: orgCode,
            devicecode: deviceCodeFromContext,
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

  if (versionsLoading) {
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
    setOpenRowId((prevId) => {
      if (prevId === id) {
        return null; // Close the row if it's already open
      } else {
        fetchTimelineData(id); // Fetch timeline data only when the row is being opened
        return id;
      }
    });
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterDialogOpen = () => {
    setOpenFilterDialog(true);
  };

  const handleFilterDialogClose = () => {
    setOpenFilterDialog(false);
  };

  const handleStatusChange = (status: keyof typeof statusIcons) => {
    setSelectedStatuses((prev) => {
      const newStatuses = new Set(prev);
      if (newStatuses.has(status)) {
        newStatuses.delete(status);
      } else {
        newStatuses.add(status);
      }
      return newStatuses;
    });
  };

  const filteredVersionsData = versionsData.filter((version) =>
    selectedStatuses.has(version.status)
  );

  return (
    <>
     

      <TableContainer style={{ marginTop: "1.3rem", width: '95%', marginInline: '2rem' }} component={Paper}>
  <Table>
    <TableHead sx={{}} >
      <TableRow style={{ backgroundColor: "#EEEEEE", fontWeight: "600" }}>
        <TableCell style={{ width: "20px" }}></TableCell>
        <TableCell style={{ fontWeight: "600", width: '10rem' }}>Version ID</TableCell>
        <TableCell style={{ fontWeight: "600", width: '20rem' }}>
          Last Updated
          <span style={{ fontSize: '13px' }}>({getCurrentTimezoneOffset()})</span>
        </TableCell>
        <TableCell style={{ fontWeight: "600", width: '10rem' }}>
          <IconButton onClick={handleFilterDialogOpen}>
            <MdOutlineFilterList />
          </IconButton>
          Status
        </TableCell>
        <TableCell style={{ fontWeight: "600", width: '10rem' }}>Comments</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {filteredVersionsData
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
                    color: "#007867",
                    fontWeight: "600",
                    borderRadius: "7px",
                    height: "26px"
                  }}
                />
              </TableCell>
              <TableCell>
                    {version.comment}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
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
                                  <Typography variant="caption" style={{ color: timelineColors[event.status]?.textColor || 'grey' }}>
                                    {event.timestamp}
                                  </Typography>
                                  <div style={{ fontSize: 24, color: timelineColors[event.status]?.iconColor || 'grey' }}>
                                    {statusIcons[event.status]}
                                  </div>
                                  <Typography variant="body2" style={{ color: timelineColors[event.status]?.textColor || 'grey' }}>
                                    {event.status}
                                  </Typography>
                                </div>
                              )}
                            />
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
    count={filteredVersionsData.length}
    rowsPerPage={rowsPerPage}
    page={page}
    onPageChange={handleChangePage}
    onRowsPerPageChange={handleChangeRowsPerPage}
  />
</TableContainer>


      {/* Filter Dialog */}
      <Dialog open={openFilterDialog} onClose={handleFilterDialogClose}>
        <DialogTitle>Filter by Status</DialogTitle>
        <DialogContent>
          {Object.keys(statusIcons).map((status) => (
            <FormControlLabel
              key={status}
              control={
                <Checkbox
                  checked={selectedStatuses.has(status as keyof typeof statusIcons)}
                  onChange={() => handleStatusChange(status as keyof typeof statusIcons)}
                />
              }
              label={status}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFilterDialogClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Versions;