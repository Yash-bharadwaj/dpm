import React, { useState } from 'react';
import { Table, Pagination, Button } from 'react-bootstrap';
import { FaFilter, FaChevronDown, FaChevronUp, FaRegCheckCircle } from 'react-icons/fa';
import { RxCrossCircled } from 'react-icons/rx';
import { TbAlertTriangleFilled } from 'react-icons/tb';
import Badge from '../common/Badge';
import Card from '../common/Card';
import { colors } from '../../theme/theme';

// Define status colors and icons for table badges
const statusIcons: Record<string, JSX.Element> = {
  invalid: <TbAlertTriangleFilled />,
  notvalid: <TbAlertTriangleFilled />,
  notdeployed: <RxCrossCircled />,
  failed: <TbAlertTriangleFilled />,
  draft: <FaRegCheckCircle />,
  new: <FaRegCheckCircle />,
  converted: <FaRegCheckCircle />,
  deployed: <FaRegCheckCircle />,
  valid: <FaRegCheckCircle />,
  received: <FaRegCheckCircle />,
  inprogress: <FaRegCheckCircle />,
  'in-progress': <FaRegCheckCircle />,
  'not-deployed': <RxCrossCircled />,
};

// Status to badge variant mapping
const statusVariants: Record<string, string> = {
  invalid: 'danger',
  notvalid: 'danger',
  notdeployed: 'danger',
  failed: 'danger',
  draft: 'success',
  new: 'success',
  converted: 'success',
  deployed: 'success',
  valid: 'success',
  received: 'success',
  inprogress: 'info',
  'in-progress': 'info',
  'not-deployed': 'danger',
};

export interface Version {
  id: string;
  lastUpdated: string;
  status: keyof typeof statusIcons;
  comment: string;
}

export interface TimelineEvent {
  status: keyof typeof statusIcons;
  timestamp: string;
}

interface VersionTableProps {
  versions: Version[];
  timelineData: Record<string, TimelineEvent[]>;
  onFetchTimeline: (versionId: string) => void;
  currentTimezoneOffset: string;
  onFilterClick: () => void;
}

const VersionTable: React.FC<VersionTableProps> = ({
  versions,
  timelineData,
  onFetchTimeline,
  currentTimezoneOffset,
  onFilterClick,
}) => {
  const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  
  // Calculate total pages
  const totalPages = Math.ceil(versions.length / rowsPerPage);
  
  // Get current page's data
  const currentVersions = versions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Toggle row expansion
  const toggleRowExpansion = (versionId: string) => {
    if (expandedVersionId === versionId) {
      setExpandedVersionId(null);
    } else {
      setExpandedVersionId(versionId);
      onFetchTimeline(versionId);
    }
  };

  // Handle pagination
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Card elevation="sm" className="version-table-container">
      <Table responsive hover className="version-table">
        <thead>
          <tr>
            <th style={{ width: '50px' }}></th>
            <th>Version ID</th>
            <th>
              Last Updated
              <small className="ms-2 text-muted">
                ({currentTimezoneOffset})
              </small>
            </th>
            <th>
              <Button 
                variant="light" 
                size="sm" 
                className="me-2 p-1" 
                onClick={onFilterClick}
              >
                <FaFilter />
              </Button>
              Status
            </th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {currentVersions.map((version) => (
            <React.Fragment key={version.id}>
              <tr className={expandedVersionId === version.id ? 'expanded-row' : ''}>
                <td className="text-center">
                  <Button
                    variant="light"
                    size="sm"
                    className="p-1"
                    onClick={() => toggleRowExpansion(version.id)}
                  >
                    {expandedVersionId === version.id ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
                  </Button>
                </td>
                <td>{version.id}</td>
                <td>{version.lastUpdated}</td>
                <td>
                  <Badge
                    variant={statusVariants[version.status] || 'light'}
                    icon={statusIcons[version.status]}
                    size="sm"
                  >
                    {version.status}
                  </Badge>
                </td>
                <td>{version.comment}</td>
              </tr>
              {expandedVersionId === version.id && (
                <tr className="timeline-row">
                  <td colSpan={5} className="p-3 bg-light border-0">
                    <h6 className="mb-3">Timeline</h6>
                    {timelineData[version.id]?.length > 0 ? (
                      <div className="timeline-container">
                        <div className="timeline">
                          {timelineData[version.id].map((event, index) => (
                            <div key={index} className="timeline-step">
                              <div className="timeline-icon" style={{ color: colors.primary.main }}>
                                {statusIcons[event.status]}
                              </div>
                              <div className="timeline-content">
                                <div className="timeline-time">{event.timestamp}</div>
                                <div className="timeline-status">
                                  <Badge
                                    variant={statusVariants[event.status] || 'light'}
                                    size="sm"
                                  >
                                    {event.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted">No timeline events available.</p>
                    )}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
          
          {versions.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-4">
                No versions found with the selected filters.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      
      {totalPages > 1 && (
        <div className="d-flex justify-content-end mt-3">
          <Pagination>
            <Pagination.Prev
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            
            {[...Array(totalPages)].map((_, index) => (
              <Pagination.Item
                key={index + 1}
                active={currentPage === index + 1}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
            
            <Pagination.Next
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}
    </Card>
  );
};

export default VersionTable;
