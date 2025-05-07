import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { FaSave, FaTimes } from 'react-icons/fa';

interface DeviceFormData {
  id?: string;
  name: string;
  description: string;
  status: 'online' | 'offline' | 'warning' | 'error';
}

interface DeviceModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (device: DeviceFormData) => void;
  device?: DeviceFormData;
  isEdit?: boolean;
}

const DeviceModal: React.FC<DeviceModalProps> = ({
  show,
  onHide,
  onSave,
  device,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState<DeviceFormData>({
    name: '',
    description: '',
    status: 'offline',
  });

  const [validated, setValidated] = useState(false);

  // Update form when device changes
  useEffect(() => {
    if (device) {
      setFormData({
        id: device.id,
        name: device.name,
        description: device.description,
        status: device.status,
      });
    } else {
      // Reset form for new device
      setFormData({
        name: '',
        description: '',
        status: 'offline',
      });
    }
    // Reset validation state
    setValidated(false);
  }, [device, show]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    onSave(formData);
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      size="lg"
      aria-labelledby="device-modal-title"
    >
      <Modal.Header closeButton>
        <Modal.Title id="device-modal-title">
          {isEdit ? 'Edit Device' : 'Add New Device'}
        </Modal.Title>
      </Modal.Header>

      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="deviceName">
            <Form.Label>Device Name *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter device name"
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a device name.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="deviceDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter device description"
              rows={3}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="deviceStatus">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide}>
            <FaTimes className="me-1" />
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            <FaSave className="me-1" />
            {isEdit ? 'Update' : 'Save'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default DeviceModal;
