/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useContext, useCallback } from "react";
import { Container, Row, Col, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import { DeviceContext } from "../utils/DeviceContext";
import {
  FETCH_DEVICES,
  DELETE_DEVICE,
  ADD_DEVICE,
  UPDATE_DEVICE,
} from "../query/query";
import { FaPlus, FaSearch, FaSyncAlt } from "react-icons/fa";
import DeviceList from "../components/devices/DeviceList";
import DeviceToolbar from "../components/devices/DeviceToolbar";
import DeviceModal from "../components/devices/DeviceModal";
import DeleteConfirmationModal from "../components/devices/DeleteConfirmationModal";
import Button from "../components/common/Button";
import { colors } from "../theme/theme";

// Define types
interface Device {
  id: string;
  name: string;
  description: string;
  status: "online" | "offline" | "warning" | "error";
}

interface DeviceFormData {
  id?: string;
  name: string;
  description: string;
  status: "online" | "offline" | "warning" | "error";
}

// Status Options for filtering
const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
  { value: "warning", label: "Warning" },
  { value: "error", label: "Error" },
];

const Home: React.FC = () => {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Context and hooks
  const navigate = useNavigate();
  const deviceContext = useContext(DeviceContext);

  if (!deviceContext) {
    return <div>Device context not available</div>;
  }

  const { setSelectedDevice: setGlobalSelectedDevice } = deviceContext;

  // GraphQL query to fetch devices
  const {
    loading,
    error,
    data,
    refetch,
  } = useQuery(FETCH_DEVICES, {
    fetchPolicy: "cache-and-network",
  });

  // Delete device mutation
  const [deleteDevice] = useMutation(DELETE_DEVICE, {
    onCompleted: () => {
      toast.success(`Device "${selectedDevice?.name}" deleted successfully`);
      refetch();
    },
    onError: (error) => {
      toast.error(`Error deleting device: ${error.message}`);
    },
  });

  // Add device mutation
  const [addDevice] = useMutation(ADD_DEVICE, {
    onCompleted: () => {
      toast.success("Device added successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Error adding device: ${error.message}`);
    },
  });

  // Update device mutation
  const [updateDevice] = useMutation(UPDATE_DEVICE, {
    onCompleted: () => {
      toast.success(`Device "${selectedDevice?.name}" updated successfully`);
      refetch();
    },
    onError: (error) => {
      toast.error(`Error updating device: ${error.message}`);
    },
  });

  // Filter devices based on search query and status filter
  useEffect(() => {
    if (data?.devices) {
      let filtered = [...data.devices];

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (device) =>
            device.name.toLowerCase().includes(query) ||
            device.description.toLowerCase().includes(query)
        );
      }

      // Filter by status
      if (statusFilter !== "all") {
        filtered = filtered.filter((device) => device.status === statusFilter);
      }

      setFilteredDevices(filtered);
    }
  }, [data, searchQuery, statusFilter]);

  // Show add device modal
  const handleShowAddModal = () => {
    setSelectedDevice(null);
    setIsEditing(false);
    setShowAddModal(true);
  };

  // Show edit device modal
  const handleShowEditModal = (device: Device) => {
    setSelectedDevice(device);
    setIsEditing(true);
    setShowAddModal(true);
  };

  // Show delete device modal
  const handleShowDeleteModal = (device: Device) => {
    setSelectedDevice(device);
    setShowDeleteModal(true);
  };

  // Hide modals
  const handleHideModal = () => {
    setShowAddModal(false);
    setShowDeleteModal(false);
  };

  // Handle device selection for pipeline configuration
  const handleDeviceSelect = (device: Device) => {
    setGlobalSelectedDevice(device.id);
    navigate("/routing");
  };

  // Handle save device
  const handleSaveDevice = (formData: DeviceFormData) => {
    if (isEditing && formData.id) {
      // Update existing device
      updateDevice({
        variables: {
          id: formData.id,
          name: formData.name,
          description: formData.description,
          status: formData.status,
        },
      });
    } else {
      // Add new device
      addDevice({
        variables: {
          name: formData.name,
          description: formData.description,
          status: formData.status,
        },
      });
    }
  };

  // Handle delete device
  const handleDeleteDevice = () => {
    if (selectedDevice) {
      deleteDevice({
        variables: {
          id: selectedDevice.id,
        },
      });
      setShowDeleteModal(false);
    }
  };

  // Handle refetch
  const handleRefetch = () => {
    refetch();
    toast.info("Refreshing device list...");
  };

  // Render loading state
  if (loading && !data) {
    return (
      <Container className="mt-5 pt-5 text-center">
        <Spinner animation="border" role="status" className="me-2" />
        <span>Loading devices...</span>
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container className="mt-5 pt-5 text-center">
        <div className="alert alert-danger">
          Error loading devices: {error.message}
        </div>
        <Button onClick={handleRefetch} className="mt-3" variant="primary">
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
                <h1 className="page-title mb-2">Device Management</h1>
                <p className="text-muted">
                  Manage your data pipeline devices and configure their routes
                </p>
              </div>
              <div>
                <Button 
                  variant="primary" 
                  onClick={handleShowAddModal}
                  className="d-flex align-items-center"
                >
                  <FaPlus className="me-2" /> Add Device
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        <DeviceToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onRefresh={handleRefetch}
          statusOptions={statusOptions}
        />

        <DeviceList
          devices={filteredDevices}
          onEdit={handleShowEditModal}
          onDelete={handleShowDeleteModal}
          onSelect={handleDeviceSelect}
        />

        {/* Add/Edit Device Modal */}
        <DeviceModal
          show={showAddModal}
          onHide={handleHideModal}
          onSave={handleSaveDevice}
          device={selectedDevice || undefined}
          isEdit={isEditing}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          show={showDeleteModal}
          onHide={handleHideModal}
          onConfirm={handleDeleteDevice}
          itemName={selectedDevice?.name || ""}
          itemType="device"
        />
      </Container>
    </div>
  );
};

export default Home;