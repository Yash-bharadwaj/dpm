import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaExclamationTriangle, FaTrash, FaTimes } from 'react-icons/fa';
import { colors } from '../../theme/theme';

interface DeleteConfirmationModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  show,
  onHide,
  onConfirm,
  itemName,
  itemType = 'item',
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      size="md"
      aria-labelledby="delete-confirmation-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title id="delete-confirmation-modal" className="text-danger">
          <FaExclamationTriangle className="me-2" /> Confirm Deletion
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          Are you sure you want to delete the {itemType}{' '}
          <strong>"{itemName}"</strong>?
        </p>
        <p className="text-danger">
          <strong>Warning:</strong> This action cannot be undone. All associated data will be permanently deleted.
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          <FaTimes className="me-1" /> Cancel
        </Button>
        <Button 
          variant="danger" 
          onClick={onConfirm}
          style={{ backgroundColor: colors.status.error }}
        >
          <FaTrash className="me-1" /> Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmationModal;
