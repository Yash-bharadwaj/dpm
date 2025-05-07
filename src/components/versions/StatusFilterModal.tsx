import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { FaFilter, FaTimes, FaCheck } from 'react-icons/fa';

interface StatusFilterModalProps {
  show: boolean;
  onHide: () => void;
  availableStatuses: string[];
  selectedStatuses: Set<string>;
  onStatusChange: (status: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

const StatusFilterModal: React.FC<StatusFilterModalProps> = ({
  show,
  onHide,
  availableStatuses,
  selectedStatuses,
  onStatusChange,
  onSelectAll,
  onClearAll,
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="sm"
      aria-labelledby="status-filter-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title id="status-filter-modal">
          <FaFilter className="me-2" /> Filter by Status
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <div className="d-flex justify-content-between mb-3">
          <Button variant="outline-primary" size="sm" onClick={onSelectAll}>
            <FaCheck className="me-1" /> Select All
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={onClearAll}>
            <FaTimes className="me-1" /> Clear All
          </Button>
        </div>
        
        <Form>
          {availableStatuses.map((status) => (
            <Form.Check
              key={status}
              type="checkbox"
              id={`status-${status}`}
              label={status}
              checked={selectedStatuses.has(status)}
              onChange={() => onStatusChange(status)}
              className="mb-2"
            />
          ))}
        </Form>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="primary" onClick={onHide}>
          Apply Filters
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StatusFilterModal;
