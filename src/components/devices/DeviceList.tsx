import React from 'react';
import { Row, Col } from 'react-bootstrap';
import DeviceCard from './DeviceCard';
import Loader from '../common/Loader';

interface Device {
  id: string;
  name: string;
  description?: string;
  status: 'online' | 'offline' | 'warning' | 'error';
  lastSeen?: string;
  version?: string;
}

interface DeviceListProps {
  devices: Device[];
  isLoading?: boolean;
  onSelectDevice: (id: string) => void;
  onEditDevice?: (id: string) => void;
  onDeleteDevice?: (id: string) => void;
  selectedDeviceId?: string;
  emptyMessage?: string;
}

const DeviceList: React.FC<DeviceListProps> = ({
  devices,
  isLoading = false,
  onSelectDevice,
  onEditDevice,
  onDeleteDevice,
  selectedDeviceId,
  emptyMessage = 'No devices found',
}) => {
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <Loader size="md" text="Loading devices..." />
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="text-center my-5 py-5">
        <div className="text-muted mb-3">
          <i className="fa fa-search fa-3x"></i>
        </div>
        <h5>{emptyMessage}</h5>
      </div>
    );
  }

  return (
    <Row xs={1} md={2} lg={3} xl={4} className="g-4">
      {devices.map((device) => (
        <Col key={device.id}>
          <DeviceCard
            id={device.id}
            name={device.name}
            description={device.description}
            status={device.status}
            lastSeen={device.lastSeen}
            version={device.version}
            onSelect={onSelectDevice}
            onEdit={onEditDevice}
            onDelete={onDeleteDevice}
            selected={selectedDeviceId === device.id}
          />
        </Col>
      ))}
    </Row>
  );
};

export default DeviceList;
