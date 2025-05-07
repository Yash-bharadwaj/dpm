/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import { Container, Row, Col, Tab, Nav, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Node, Edge, Connection } from "reactflow";
import PipelineFlow from "../components/pipeline/PipelineFlow";
import PipelineControls from "../components/pipeline/PipelineControls";
import { FaSave, FaUpload, FaEye, FaClone, FaCode, FaExclamationTriangle } from "react-icons/fa";
import { DeviceContext } from "../utils/DeviceContext";
import { useMutation, useQuery } from "@apollo/client";
import "../App.css";
import { FETCH_DEVICE_ROUTING, SAVE_ROUTING } from "../query/query";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import { colors } from "../theme/theme";
import DeleteConfirmationModal from "../components/devices/DeleteConfirmationModal";

// Node items for the pipeline
const nodeItems = [
  {
    type: "source",
    label: "Source",
    description: "Data input source",
    icon: <FaUpload />,
  },
  {
    type: "destination",
    label: "Destination",
    description: "Data output destination",
    icon: <FaEye />,
  },
  {
    type: "transform",
    label: "Transform",
    description: "Data transformation",
    icon: <FaCode />,
  },
  {
    type: "function",
    label: "Function",
    description: "Data processing function",
    icon: <FaClone />,
  },
];

// Initial nodes
const initialNodes: Node[] = [
  {
    id: "1",
    type: "source",
    position: { x: 100, y: 100 },
    data: { label: "Source 1", status: "active" },
  },
];

// Initial edges
const initialEdges: Edge[] = [];

const Routing: React.FC = () => {
  // State
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [nodeCount, setNodeCount] = useState(1);

  // Context and hooks
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const deviceContext = useContext(DeviceContext);

  if (!deviceContext) {
    return <Alert variant="danger">Device context not available</Alert>;
  }

  const { selectedDevice } = deviceContext;

  // Redirect if no device is selected
  useEffect(() => {
    if (!selectedDevice) {
      navigate("/");
      toast.warning("Please select a device first.");
    }
  }, [selectedDevice, navigate]);

  // GraphQL queries
  const { loading, error, data } = useQuery(FETCH_DEVICE_ROUTING, {
    variables: { id: selectedDevice },
    skip: !selectedDevice,
  });

  const [saveRouting] = useMutation(SAVE_ROUTING, {
    onCompleted: () => {
      toast.success("Pipeline configuration saved successfully!");
      setIsUnsaved(false);
    },
    onError: (error) => {
      toast.error(`Error saving pipeline: ${error.message}`);
    },
  });

  // Load routing data from the server
  useEffect(() => {
    if (data?.device?.routing) {
      try {
        const routingData = JSON.parse(data.device.routing);
        if (routingData.nodes && routingData.edges) {
          setNodes(routingData.nodes);
          setEdges(routingData.edges);
          
          // Update node count for new node IDs
          const maxId = Math.max(
            ...routingData.nodes.map((node: Node) => parseInt(node.id)),
            0
          );
          setNodeCount(maxId + 1);
        }
      } catch (e) {
        console.error("Error parsing routing data:", e);
        toast.error("Error loading pipeline configuration");
      }
    }
  }, [data]);

  // Handle node changes
  const onNodesChange = useCallback((changes: any) => {
    setNodes((nds) => {
      const newNodes = [...nds];
      // Apply changes
      // Logic would be here to handle node changes
      setIsUnsaved(true);
      return newNodes;
    });
  }, []);

  // Handle edge changes
  const onEdgesChange = useCallback((changes: any) => {
    setEdges((eds) => {
      const newEdges = [...eds];
      // Apply changes
      // Logic would be here to handle edge changes
      setIsUnsaved(true);
      return newEdges;
    });
  }, []);

  // Handle connection between nodes
  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => {
      const newEdge = {
        ...connection,
        id: `edge-${connection.source}-${connection.target}`,
      };
      setIsUnsaved(true);
      return [...eds, newEdge];
    });
  }, []);

  // Handle node selection
  const onNodeSelect = useCallback((node: Node | null) => {
    setSelectedNode(node);
  }, []);

  // Add new node
  const onAddNode = useCallback((type: string, position: { x: number; y: number }) => {
    const newNode = {
      id: `${nodeCount + 1}`,
      type,
      position,
      data: { 
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${nodeCount + 1}`,
        status: "inactive" 
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
    setNodeCount((count) => count + 1);
    setIsUnsaved(true);
  }, [nodeCount]);

  // Save pipeline
  const handleSavePipeline = useCallback(() => {
    if (selectedDevice) {
      const routingData = JSON.stringify({ nodes, edges });
      saveRouting({
        variables: {
          id: selectedDevice,
          routing: routingData,
        },
      });
    }
  }, [selectedDevice, nodes, edges, saveRouting]);

  // Clear pipeline
  const handleClearPipeline = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  // Confirm clear pipeline
  const handleConfirmClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setIsUnsaved(true);
    setShowDeleteModal(false);
    toast.info("Pipeline cleared. Don't forget to save your changes.");
  }, []);

  // If loading
  if (loading) {
    return (
      <Container className="mt-5 pt-5 text-center">
        <Spinner animation="border" role="status" className="me-2" />
        <span>Loading pipeline configuration...</span>
      </Container>
    );
  }

  // If error
  if (error) {
    return (
      <Container className="mt-5 pt-5">
        <Alert variant="danger">
          Error loading pipeline configuration: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <div className="routing-container mt-5 pt-4 slide-up">
      <Container fluid>
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center flex-wrap">
              <div>
                <h1 className="page-title mb-2">Pipeline Configuration</h1>
                <p className="text-muted">
                  Configure data pipeline for device{" "}
                  <Badge variant="primary" size="md">
                    {selectedDevice}
                  </Badge>
                </p>
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  className="d-flex align-items-center"
                  onClick={handleSavePipeline}
                  disabled={!isUnsaved}
                >
                  <FaSave className="me-2" />
                  Save Pipeline
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {isUnsaved && (
          <Row className="mb-3">
            <Col>
              <Alert variant="warning">
                <FaExclamationTriangle className="me-2" />
                You have unsaved changes. Don't forget to save your pipeline configuration.
              </Alert>
            </Col>
          </Row>
        )}

        <Row>
          <Col xs={12} md={3} lg={2}>
            <PipelineControls
              nodeItems={nodeItems}
              onClearPipeline={handleClearPipeline}
              onSavePipeline={handleSavePipeline}
              isReadOnly={false}
            />
          </Col>
          <Col xs={12} md={9} lg={10}>
            <Card elevation="sm" className="pipeline-flow-container">
              <div style={{ height: "70vh", width: "100%" }} ref={reactFlowWrapper}>
                <PipelineFlow
                  initialNodes={nodes}
                  initialEdges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onNodeSelect={onNodeSelect}
                  showControls={true}
                  showMiniMap={true}
                />
              </div>
            </Card>
          </Col>
        </Row>

        {selectedNode && (
          <Row className="mt-4">
            <Col>
              <Card 
                title={`Node Configuration: ${selectedNode.data.label}`}
                subtitle={`Type: ${selectedNode.type}`}
                className="slide-up"
              >
                <div className="node-config-form">
                  <p>Node configuration form would go here...</p>
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </Container>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmClear}
        itemName="pipeline configuration"
        itemType="pipeline configuration"
      />
    </div>
  );
};

export default Routing;
