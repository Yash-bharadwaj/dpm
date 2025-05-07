import React from 'react';
import { Card as BootstrapCard } from 'react-bootstrap';
import { colors, shadows, borders } from '../../theme/theme';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { FaCircle, FaEdit, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';

interface DeviceProps {
  id: string;
  name: string;
  description?: string;
  status: 'online' | 'offline' | 'warning' | 'error';
  lastSeen?: string;
  version?: string;
  onSelect: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  selected?: boolean;
}

const DeviceCard: React.FC<DeviceProps> = ({
  id,
  name,
  description,
  status,
  lastSeen,
  version,
  onSelect,
  onEdit,
  onDelete,
  selected = false,
}) => {
  // Status color mapping
  const statusColors = {
    online: colors.status.success,
    offline: colors.neutral.gray,
    warning: colors.status.warning,
    error: colors.status.error,
  };

  // Get badge for status
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'offline':
        return 'light';
      case 'warning':
        return 'warning';
      case 'error':
        return 'danger';
      default:
        return 'light';
    }
  };

  // Handle card click
  const handleClick = () => {
    onSelect(id);
  };

  // Handle edit button click
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(id);
    }
  };

  // Handle delete button click
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <Card
      className={`device-card ${selected ? 'selected' : ''}`}
      hoverable
      elevation={selected ? 'md' : 'sm'}
      onClick={handleClick}
      title={name}
      subtitle={description}
      headerClassName={selected ? 'bg-light' : ''}
      actions={
        <>
          {onEdit && (
            <button
              className="btn btn-sm btn-link"
              onClick={handleEdit}
              title="Edit device"
            >
              <FaEdit color={colors.neutral.darkGray} />
            </button>
          )}
          {onDelete && (
            <button
              className="btn btn-sm btn-link"
              onClick={handleDelete}
              title="Delete device"
            >
              <FaTrash color={colors.status.error} />
            </button>
          )}
        </>
      }
    >
      <div className="d-flex justify-content-between align-items-center mb-2">
        <Badge
          variant={getBadgeVariant(status)}
          size="sm"
          pill
          icon={<FaCircle size={8} />}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
        
        {version && (
          <span className="text-muted small">
            Version: {version}
          </span>
        )}
      </div>
      
      {lastSeen && (
        <div className="small text-muted mt-2">
          Last activity: {lastSeen}
        </div>
      )}
      
      <div className="mt-3">
        <button
          className="btn btn-sm btn-outline-primary w-100"
          onClick={handleClick}
        >
          <FaExternalLinkAlt className="me-1" size={12} />
          View Details
        </button>
      </div>
    </Card>
  );
};

export default DeviceCard;
