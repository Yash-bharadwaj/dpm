/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DeviceToolbar from "../components/devices/DeviceToolbar";
import DeviceList from "../components/devices/DeviceList";
import DeviceModal from "../components/devices/DeviceModal";
import DeleteConfirmationModal from "../components/devices/DeleteConfirmationModal";
import { DeviceContext } from "../utils/DeviceContext";
import { useQuery, useMutation } from "@apollo/client";
import {
  FETCH_ALL_DEVICES,
  CREATE_DEVICE,
  UPDATE_DEVICE,
  DELETE_DEVICE,
} from "../query/query";
import "../App.css";

// Interface for device data
interface Device {
  id: string;
  name: string;
  description: string;
  status: 'online' | 'offline' | 'warning' | 'error';
  lastSeen?: string;
  version?: string;
}

// Interface for form data
interface DeviceFormData {
  id?: string;
  name: string;
  description: string;
  status: 'online' | 'offline' | 'warning' | 'error';
}

const Home: React.FC = () => {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<Device | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);

  // Context and hooks
  const navigate = useNavigate();
  const deviceContext = useContext(DeviceContext);

  if (!deviceContext) {
    return <Alert variant="danger">Device context not available</Alert>;
  }

  const { selectedDevice, setSelectedDevice } = deviceContext;

  // GraphQL queries
  const { loading, error, data, refetch } = useQuery(FETCH_ALL_DEVICES);
  
  const [createDevice] = useMutation(CREATE_DEVICE, {
    onCompleted: () => {
      toast.success("Device created successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Error creating device: ${error.message}`);
    },
  });

  const [updateDevice] = useMutation(UPDATE_DEVICE, {
    onCompleted: () => {
      toast.success("Device updated successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Error updating device: ${error.message}`);
    },
  });

  const [deleteDevice] = useMutation(DELETE_DEVICE, {
    onCompleted: () => {
      toast.success("Device deleted successfully!");
      refetch();
      // Reset selected device if it was deleted
      if (selectedDevice === currentDevice?.id) {
        setSelectedDevice(null);
      }
    },
    onError: (error) => {
      toast.error(`Error deleting device: ${error.message}`);
    },
  });

  // Filter and sort devices
  useEffect(() => {
    if (data?.devices) {
      let filtered = [...data.devices];

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (device: Device) =>
            device.name.toLowerCase().includes(query) ||
            device.description.toLowerCase().includes(query)
        );
      }

      // Apply status filter
      if (statusFilter !== "all") {
        filtered = filtered.filter(
          (device: Device) => device.status === statusFilter
        );
      }

      // Apply sorting
      filtered.sort((a: any, b: any) => {
        let comparison = 0;
        
        if (a[sortField] < b[sortField]) {
          comparison = -1;
        } else if (a[sortField] > b[sortField]) {
          comparison = 1;
        }
        
        return sortDirection === "asc" ? comparison : -comparison;
      });

      setFilteredDevices(filtered);
    }
  }, [data, searchQuery, statusFilter, sortField, sortDirection]);

  // Event handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filter: string) => {
    setStatusFilter(filter);
  };

  const handleSortChange = (field: string, direction: "asc" | "desc") => {
    setSortField(field);
    setSortDirection(direction);
  };

  const handleSelectDevice = (id: string) => {
    setSelectedDevice(id);
    navigate("/routing");
  };

  const handleAddDevice = () => {
    setCurrentDevice(null);
    setIsEditMode(false);
    setShowDeviceModal(true);
  };

  const handleEditDevice = (id: string) => {
    const deviceToEdit = data?.devices.find((d: Device) => d.id === id);
    if (deviceToEdit) {
      setCurrentDevice(deviceToEdit);
      setIsEditMode(true);
      setShowDeviceModal(true);
    }
  };

  const handleDeleteClick = (id: string) => {
    const deviceToDelete = data?.devices.find((d: Device) => d.id === id);
    if (deviceToDelete) {
      setCurrentDevice(deviceToDelete);
      setShowDeleteModal(true);
    }
  };

  const handleSaveDevice = (formData: DeviceFormData) => {
    if (isEditMode && formData.id) {
      // Update existing device
      updateDevice({
        variables: {
          id: formData.id,
          input: {
            name: formData.name,
            description: formData.description,
            status: formData.status,
          },
        },
      });
    } else {
      // Create new device
      createDevice({
        variables: {
          input: {
            name: formData.name,
            description: formData.description,
            status: formData.status,
          },
        },
      });
    }
    
    setShowDeviceModal(false);
  };

  const handleConfirmDelete = () => {
    if (currentDevice) {
      deleteDevice({
        variables: { id: currentDevice.id },
      });
    }
    setShowDeleteModal(false);
  };

  // Error handling
  if (error) {
    return (
      <Container className="mt-5 pt-5">
        <Alert variant="danger">
          Error loading devices: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-5 pt-4 device-container slide-up">
      <Row className="mb-4">
        <Col>
          <h1 className="page-title mb-4">Device Management</h1>
          <p className="text-muted">
            Manage your pipeline devices. Select a device to view and configure its pipelines.
          </p>
        </Col>
      </Row>

      <DeviceToolbar
        onSearch={handleSearch}
        onAddDevice={handleAddDevice}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
      />

      <DeviceList
        devices={filteredDevices}
        isLoading={loading}
        onSelectDevice={handleSelectDevice}
        onEditDevice={handleEditDevice}
        onDeleteDevice={handleDeleteClick}
        selectedDeviceId={selectedDevice || undefined}
        emptyMessage={
          searchQuery || statusFilter !== "all"
            ? "No devices match your search criteria"
            : "No devices found. Click 'Add Device' to create one."
        }
      />

      {/* Device Add/Edit Modal */}
      <DeviceModal
        show={showDeviceModal}
        onHide={() => setShowDeviceModal(false)}
        onSave={handleSaveDevice}
        device={currentDevice || undefined}
        isEdit={isEditMode}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        itemName={currentDevice?.name || ""}
        itemType="device"
      />
    </Container>
  );
};

export default Home;
