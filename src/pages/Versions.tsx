import React, { useContext, useEffect, useState } from "react";
import { Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery, useLazyQuery } from "@apollo/client";
import { DeviceContext } from "../utils/DeviceContext";
import { GET_CONFIG_VERSION, GET_CONFIG_TIMELINE } from "../query/query";
import VersionTable, { Version, TimelineEvent } from "../components/versions/VersionTable";
import StatusFilterModal from "../components/versions/StatusFilterModal";
import { FaHistory, FaFilter } from "react-icons/fa";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import { colors } from "../theme/theme";
import "../App.css";

// Status mapping for icon reference
const statusIcons = {
  invalid: true,
  notvalid: true,
  notdeployed: true,
  failed: true,
  draft: true,
  new: true,
  converted: true,
  deployed: true,
  valid: true,
  received: true,
  inprogress: true,
  "in-progress": true,
  "not-deployed": true,
};

const Versions: React.FC = () => {
  // Get device code from URL params or context
  const { devicecode } = useParams();
  const context = useContext(DeviceContext);

  if (context === undefined) {
    throw new Error("DeviceContext must be used within a DeviceProvider");
  }

  const { selectedDevice } = context;
  const deviceCodeFromContext = selectedDevice || devicecode;

  // Get organization code from URL params
  const [searchParams] = useSearchParams();
  const orgCode = searchParams.get("orgCode") || "d3b6842d";

  // State management
  const [versionsData, setVersionsData] = useState<Version[]>([]);
  const [timelineData, setTimelineData] = useState<Record<string, TimelineEvent[]>>({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(
    new Set(Object.keys(statusIcons))
  );

  // Get current timezone information
  const getCurrentTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };

  const getCurrentTimezoneOffset = () => {
    const offset = new Date().getTimezoneOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset % 60);
    const sign = offset <= 0 ? "+" : "-";
    return `UTC ${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  // GraphQL queries
  const {
    loading: versionsLoading,
    error: versionsError,
    data: versionsDataResponse,
  } = useQuery(GET_CONFIG_VERSION, {
    variables: {
      orgcode: orgCode,
      devicecode: deviceCodeFromContext,
      timezone: getCurrentTimezone(),
    },
  });

  const [fetchTimeline, { error: timelineError }] = useLazyQuery(GET_CONFIG_TIMELINE);

  // Process versions data when it's loaded
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

  // Fetch timeline data for a specific version
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

  // Filter toggle handlers
  const handleStatusChange = (status: string) => {
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

  const handleSelectAllStatuses = () => {
    setSelectedStatuses(new Set(Object.keys(statusIcons)));
  };

  const handleClearAllStatuses = () => {
    setSelectedStatuses(new Set());
  };

  // Filter versions based on selected statuses
  const filteredVersionsData = versionsData.filter((version) =>
    selectedStatuses.has(version.status)
  );

  // Loading state
  if (versionsLoading) {
    return (
      <Container className="mt-5 pt-5 d-flex justify-content-center">
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary" />
          <p className="mt-3">Loading versions...</p>
        </div>
      </Container>
    );
  }

  // Error state
  if (versionsError || timelineError) {
    return (
      <Container className="mt-5 pt-5">
        <Alert variant="danger">
          {versionsError 
            ? `Error loading versions: ${versionsError.message}` 
            : `Error loading timeline: ${timelineError?.message}`}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-5 pt-4 versions-container slide-up">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h1 className="page-title">Version History</h1>
            <div>
              <Badge variant="primary" size="lg" icon={<FaHistory />}>
                Device: {deviceCodeFromContext}
              </Badge>
            </div>
          </div>
          <p className="text-muted">
            View and manage device configuration versions and their deployment status.
          </p>
        </Col>
      </Row>

      <Row>
        <Col>
          <VersionTable
            versions={filteredVersionsData}
            timelineData={timelineData}
            onFetchTimeline={fetchTimelineData}
            currentTimezoneOffset={getCurrentTimezoneOffset()}
            onFilterClick={() => setShowFilterModal(true)}
          />
        </Col>
      </Row>

      {/* Status Filter Modal */}
      <StatusFilterModal
        show={showFilterModal}
        onHide={() => setShowFilterModal(false)}
        availableStatuses={Object.keys(statusIcons)}
        selectedStatuses={selectedStatuses}
        onStatusChange={handleStatusChange}
        onSelectAll={handleSelectAllStatuses}
        onClearAll={handleClearAllStatuses}
      />
    </Container>
  );
};

export default Versions;
