import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Spinner, Form } from 'react-bootstrap';
import { useMutation, useQuery } from '@apollo/client';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaFilter, FaRedo, FaSyncAlt, FaCheck, FaTimes, FaInfoCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FETCH_VERSIONS, DEPLOY_VERSION } from '../query/query';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { formatDate } from '../utils/formatters';
import { colors } from '../theme/theme';

// Define interface for version data
interface Version {
  id: string;
  timestamp: string;
  deviceId: string;
  deviceName: string;
  user: string;
  status: 'deployed' | 'pending' | 'failed';
  changes: string[];
}

const Versions: React.FC = () => {
  // State
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filteredVersions, setFilteredVersions] = useState<Version[]>([]);
  
  const navigate = useNavigate();

  // GraphQL query to fetch versions
  const { loading, error, data, refetch } = useQuery(FETCH_VERSIONS, {
    fetchPolicy: 'cache-and-network',
  });

  // Mutation to deploy a version
  const [deployVersion, { loading: deploying }] = useMutation(DEPLOY_VERSION, {
    onCompleted: () => {
      toast.success(`Version deployed successfully`);
      setShowDeployModal(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Error deploying version: ${error.message}`);
    },
  });

  // Filter versions based on status
  useEffect(() => {
    if (data?.versions) {
      const filtered = statusFilter === 'all'
        ? [...data.versions]
        : data.versions.filter((version: Version) => version.status === statusFilter);

      setFilteredVersions(filtered);
    }
  }, [data, statusFilter]);

  // Handle row expansion
  const handleRowClick = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  // Handle version deployment
  const handleDeployClick = (version: Version) => {
    setSelectedVersion(version);
    setShowDeployModal(true);
  };

  // Confirm deployment
  const handleConfirmDeploy = () => {
    if (selectedVersion) {
      deployVersion({
        variables: {
          id: selectedVersion.id,
        },
      });
    }
  };

  // Render version status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'deployed':
        return <Badge variant="success" pill>Deployed</Badge>;
      case 'pending':
        return <Badge variant="warning" pill>Pending</Badge>;
      case 'failed':
        return <Badge variant="danger" pill>Failed</Badge>;
      default:
        return <Badge variant="secondary" pill>{status}</Badge>;
    }
  };

  // Render loading state
  if (loading && !data) {
    return (
      <Container className="mt-5 pt-5 text-center">
        <Spinner animation="border" role="status" className="me-2" />
        <span>Loading versions...</span>
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container className="mt-5 pt-5 text-center">
        <div className="alert alert-danger">
          Error loading versions: {error.message}
        </div>
        <Button onClick={() => refetch()} className="mt-3" variant="primary">
          <FaSyncAlt className="me-2" /> Try Again
        </Button>
      </Container>
    );
  }

  return (
    <div className="page-container slide-up">
      <Container fluid className="pt-4 mt-5">
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center flex-wrap">
              <div>
                <h1 className="page-title mb-2">Version Management</h1>
                <p className="text-muted">
                  View and manage pipeline deployment versions
                </p>
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilterModal(true)}
                  className="d-flex align-items-center"
                >
                  <FaFilter className="me-2" /> Filter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  className="d-flex align-items-center"
                >
                  <FaRedo className="me-2" /> Refresh
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        <Card>
          <Table responsive hover className="version-table mb-0">
            <thead>
              <tr>
                <th>Device</th>
                <th>Version</th>
                <th>User</th>
                <th>Timestamp</th>
                <th>Status</th>
                <th>Actions</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredVersions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    <FaInfoCircle className="me-2" size={18} />
                    No versions found. Create a pipeline configuration first.
                  </td>
                </tr>
              ) : (
                filteredVersions.map((version) => (
                  <React.Fragment key={version.id}>
                    <tr
                      onClick={() => handleRowClick(version.id)}
                      className={expandedRowId === version.id ? 'expanded-row' : ''}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{version.deviceName}</td>
                      <td>{version.id.substring(0, 8)}...</td>
                      <td>{version.user}</td>
                      <td>{formatDate(version.timestamp)}</td>
                      <td>{renderStatusBadge(version.status)}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={version.status === 'deployed'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeployClick(version);
                          }}
                        >
                          <FaCheck className="me-1" /> Deploy
                        </Button>
                      </td>
                      <td className="text-center">
                        {expandedRowId === version.id ? (
                          <FaChevronUp color={colors.neutral.darkGray} />
                        ) : (
                          <FaChevronDown color={colors.neutral.darkGray} />
                        )}
                      </td>
                    </tr>
                    {expandedRowId === version.id && (
                      <tr className="expanded-row">
                        <td colSpan={7}>
                          <div className="p-3 slide-up">
                            <h6 className="mb-3">Changes</h6>
                            <div className="timeline-container">
                              <div className="timeline">
                                {version.changes.map((change, index) => (
                                  <div className="timeline-step" key={index}>
                                    <div className="timeline-icon">
                                      <FaClock />
                                    </div>
                                    <div className="timeline-content">
                                      <div className="timeline-time">
                                        {formatDate(new Date(new Date(version.timestamp).getTime() - (index * 60000)).toISOString())}
                                      </div>
                                      <div className="timeline-status">
                                        {change}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </Table>
        </Card>
      </Container>

      {/* Deploy Confirmation Modal */}
      <Modal
        show={showDeployModal}
        onHide={() => setShowDeployModal(false)}
        title="Deploy Version"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDeployModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmDeploy}
              loading={deploying}
            >
              Deploy Version
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to deploy the selected version to
          <strong> {selectedVersion?.deviceName}</strong>?
        </p>
        <p>This will replace the currently deployed configuration for this device.</p>
      </Modal>

      {/* Status Filter Modal */}
      <Modal
        show={showFilterModal}
        onHide={() => setShowFilterModal(false)}
        title="Filter Versions"
        footer={
          <Button
            variant="primary"
            onClick={() => setShowFilterModal(false)}
          >
            Apply Filters
          </Button>
        }
      >
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="deployed">Deployed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal>
    </div>
  );
};

export default Versions;