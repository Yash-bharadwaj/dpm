import React from 'react';
import { FaEdit, FaTrash, FaRoute } from 'react-icons/fa';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { colors } from '../../theme/theme';

interface Device {
  id: string;
  name: string;
  description: string;
  status: 'online' | 'offline' | 'warning' | 'error';
}

interface DeviceCardProps {
  device: Device;
  onEdit: (device: Device) => void;
  onDelete: (device: Device) => void;
  onSelect: (device: Device) => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  onEdit,
  onDelete,
  onSelect,
}) => {
  // Get appropriate status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge variant="success" pill>{status}</Badge>;
      case 'offline':
        return <Badge variant="secondary" pill>{status}</Badge>;
      case 'warning':
        return <Badge variant="warning" pill>{status}</Badge>;
      case 'error':
        return <Badge variant="danger" pill>{status}</Badge>;
      default:
        return <Badge variant="light" pill>{status}</Badge>;
    }
  };

  // Handle card actions
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(device);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(device);
  };

  const handleSelect = () => {
    onSelect(device);
  };

  // Create actions for the card
  const cardActions = (
    <>
      <Button
        size="sm"
        variant="light"
        onClick={handleEdit}
        className="action-button"
        title="Edit device"
      >
        <FaEdit />
      </Button>
      <Button
        size="sm"
        variant="light"
        onClick={handleDelete}
        className="action-button"
        title="Delete device"
      >
        <FaTrash style={{ color: colors.status.error }} />
      </Button>
    </>
  );

  return (
    <Card
      title={device.name}
      actions={cardActions}
      hoverable
      onClick={handleSelect}
      elevation="sm"
      className="device-card h-100 w-100"
      footer={
        <div className="d-flex justify-content-between align-items-center">
          <div>{getStatusBadge(device.status)}</div>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleSelect();
            }}
            title="Configure pipeline"
            className="configure-btn"
          >
            <FaRoute className="me-1" /> Configure
          </Button>
        </div>
      }
    >
      <div className="card-description">
        {device.description || (
          <span className="text-muted">No description available</span>
        )}
      </div>
    </Card>
  );
};

export default DeviceCard;