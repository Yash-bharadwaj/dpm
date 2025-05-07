import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import { Container, Row, Col, Form, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Node, Edge, Connection, NodeChange, EdgeChange, XYPosition } from "reactflow";
import PipelineFlow from "../components/pipeline/PipelineFlow";
import PipelineControls from "../components/pipeline/PipelineControls";
import { FaSave, FaExclamationTriangle, FaCheck, FaCode, FaWrench, FaSync } from "react-icons/fa";
import { DeviceContext } from "../utils/DeviceContext";
import { useMutation, useQuery } from "@apollo/client";
import "../App.css";
import { FETCH_DEVICE_ROUTING, SAVE_ROUTING, PUBLISH_ROUTING } from "../query/query";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import Alert from "../components/common/Alert";
import Modal from "../components/common/Modal";
import TextField from "../components/common/TextField";
import { CSSTransition } from "react-transition-group";
import DeleteConfirmationModal from "../components/devices/DeleteConfirmationModal";

// Define pipeline item types
type NodeType = 'source' | 'destination' | 'transform' | 'function';

// Initial nodes
const initialNodes: Node[] = [
  {
    id: "1",
    type: "source",
    position: { x: 100, y: 100 },
    data: { 
      label: "Source 1", 
      description: "Data input source", 
      status: "active" 
    },
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
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [nodeCount, setNodeCount] = useState(1);
  const [nodeName, setNodeName] = useState("");
  const [nodeDescription, setNodeDescription] = useState("");
  const [nodeStatus, setNodeStatus] = useState("active");
  const [elementsPanelOpen, setElementsPanelOpen] = useState(true);

  // Context and hooks
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const deviceContext = useContext(DeviceContext);

  if (!deviceContext) {
    return (
      <Alert variant="danger">
        Device context not available. Please return to the home page and select a device.
      </Alert>
    );
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
    fetchPolicy: "cache-and-network",
  });

  // Save routing mutation
  const [saveRouting, { loading: saving }] = useMutation(SAVE_ROUTING, {
    onCompleted: () => {
      toast.success("Pipeline configuration saved successfully!");
      setIsUnsaved(false);
    },
    onError: (error) => {
      toast.error(`Error saving pipeline: ${error.message}`);
    },
  });

  // Publish routing mutation
  const [publishRouting, { loading: publishing }] = useMutation(PUBLISH_ROUTING, {
    onCompleted: () => {
      toast.success("Pipeline configuration published successfully!");
      setShowPublishModal(false);
    },
    onError: (error) => {
      toast.error(`Error publishing pipeline: ${error.message}`);
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

  // Update selected node form values when node is selected
  useEffect(() => {
    if (selectedNode) {
      setNodeName(selectedNode.data.label || "");
      setNodeDescription(selectedNode.data.description || "");
      setNodeStatus(selectedNode.data.status || "active");
    } else {
      setNodeName("");
      setNodeDescription("");
      setNodeStatus("active");
    }
  }, [selectedNode]);

  // Handle node changes
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => {
      const newNodes = [...nds];
      // Apply changes to nodes
      changes.forEach(change => {
        if (change.type === 'remove') {
          // Handle node removal
          const index = newNodes.findIndex(n => n.id === change.id);
          if (index !== -1) {
            newNodes.splice(index, 1);
            
            // If the removed node was selected, deselect it
            if (selectedNode && selectedNode.id === change.id) {
              setSelectedNode(null);
            }
          }
        } else if (change.type === 'position' && change.position) {
          // Handle node position change
          const node = newNodes.find(n => n.id === change.id);
          if (node) {
            node.position = change.position;
          }
        }
      });
      
      setIsUnsaved(true);
      return newNodes;
    });
  }, [selectedNode]);

  // Handle edge changes
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => {
      const newEdges = [...eds];
      
      // Apply changes to edges
      changes.forEach(change => {
        if (change.type === 'remove') {
          // Handle edge removal
          const index = newEdges.findIndex(e => e.id === change.id);
          if (index !== -1) {
            newEdges.splice(index, 1);
          }
        }
      });
      
      setIsUnsaved(true);
      return newEdges;
    });
  }, []);

  // Handle connection between nodes
  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    
    setEdges((eds) => {
      const newEdge = {
        ...connection,
        id: `edge-${connection.source}-${connection.target}`,
        animated: false,
      };
      setIsUnsaved(true);
      return [...eds, newEdge];
    });
  }, []);

  // Handle node selection
  const onNodeSelect = useCallback((node: Node | null) => {
    setSelectedNode(node);
  }, []);

  // Add new node of a specific type
  const addNodeOfType = useCallback((type: NodeType) => {
    // Default positions, in a real app you'd want to position them better
    const position = {
      x: 100 + (nodeCount % 3) * 200,
      y: 100 + Math.floor(nodeCount / 3) * 150,
    };
    
    const newNode = {
      id: `${nodeCount + 1}`,
      type,
      position,
      data: {
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${nodeCount + 1}`,
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} node description`,
        status: "active",
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
    setNodeCount((count) => count + 1);
    setIsUnsaved(true);
  }, [nodeCount]);

  // Add source node
  const handleAddSource = useCallback(() => {
    addNodeOfType('source');
  }, [addNodeOfType]);

  // Add destination node
  const handleAddDestination = useCallback(() => {
    addNodeOfType('destination');
  }, [addNodeOfType]);

  // Add transform node
  const handleAddTransform = useCallback(() => {
    addNodeOfType('transform');
  }, [addNodeOfType]);

  // Add function node
  const handleAddFunction = useCallback(() => {
    addNodeOfType('function');
  }, [addNodeOfType]);

  // Auto layout pipeline nodes
  const handleAutoLayout = useCallback(() => {
    // Implement auto layout logic here
    // This is a simple implementation - in a real application you'd want a more sophisticated layout algorithm
    let sourceCount = 0;
    let destCount = 0;
    let transformCount = 0;
    let functionCount = 0;
    
    setNodes((nds) => {
      return nds.map(node => {
        const newNode = { ...node };
        let xPos = 0;
        let yPos = 0;
        
        switch (node.type) {
          case 'source':
            xPos = 100;
            yPos = 100 + sourceCount * 150;
            sourceCount++;
            break;
          case 'destination':
            xPos = 800;
            yPos = 100 + destCount * 150;
            destCount++;
            break;
          case 'transform':
            xPos = 400;
            yPos = 100 + transformCount * 150;
            transformCount++;
            break;
          case 'function':
            xPos = 600;
            yPos = 100 + functionCount * 150;
            functionCount++;
            break;
        }
        
        newNode.position = { x: xPos, y: yPos };
        return newNode;
      });
    });
    
    toast.info("Pipeline layout has been automatically arranged");
    setIsUnsaved(true);
  }, []);

  // Save pipeline
  const handleSavePipeline = useCallback(() => {
    if (!selectedDevice) {
      toast.error("No device selected");
      return;
    }
    
    const routingData = JSON.stringify({ nodes, edges });
    saveRouting({
      variables: {
        id: selectedDevice,
        routing: routingData,
      },
    });
  }, [selectedDevice, nodes, edges, saveRouting]);

  // Show publish modal
  const handleShowPublishModal = useCallback(() => {
    if (isUnsaved) {
      toast.warning("Please save your changes before publishing");
    } else {
      setShowPublishModal(true);
    }
  }, [isUnsaved]);

  // Publish pipeline
  const handlePublishPipeline = useCallback(() => {
    if (!selectedDevice) {
      toast.error("No device selected");
      return;
    }
    
    publishRouting({
      variables: {
        id: selectedDevice,
      },
    });
  }, [selectedDevice, publishRouting]);

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

  // Update node properties
  const handleUpdateNode = useCallback(() => {
    if (!selectedNode) return;
    
    setNodes((nds) => {
      return nds.map((node) => {
        if (node.id === selectedNode.id) {
          const updatedNode = {
            ...node,
            data: {
              ...node.data,
              label: nodeName,
              description: nodeDescription,
              status: nodeStatus,
            },
          };
          return updatedNode;
        }
        return node;
      });
    });
    
    toast.success("Node updated successfully");
    setIsUnsaved(true);
  }, [selectedNode, nodeName, nodeDescription, nodeStatus]);

  // If loading
  if (loading && !data) {
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
          <div className="mt-3">
            <Button 
              onClick={() => navigate("/")}
              variant="primary"
            >
              Return to Home
            </Button>
          </div>
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
                <p className="text-muted mb-0">
                  Configure data pipeline for your device
                </p>
                <div className="mt-1">
                  <Badge variant="primary" size="md">
                    Device ID: {selectedDevice}
                  </Badge>
                </div>
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleSavePipeline}
                  disabled={!isUnsaved || saving}
                  loading={saving}
                >
                  <FaSave className="me-2" />
                  Save Pipeline
                </Button>
                <Button
                  variant="success"
                  onClick={handleShowPublishModal}
                  disabled={isUnsaved}
                >
                  <FaCheck className="me-2" />
                  Publish
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
          <Col md={3} lg={2} className="mb-3">
            <PipelineControls
              onAddSource={handleAddSource}
              onAddDestination={handleAddDestination}
              onAddTransform={handleAddTransform}
              onAddFunction={handleAddFunction}
              onSave={handleSavePipeline}
              onClear={handleClearPipeline}
              onAutoLayout={handleAutoLayout}
              onPublish={handleShowPublishModal}
            />
          </Col>
          
          <Col md={9} lg={10}>
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

        <CSSTransition
          in={!!selectedNode}
          timeout={300}
          classNames="fade"
          unmountOnExit
        >
          <Row className="mt-4">
            <Col>
              <Card
                title={`Node Configuration: ${selectedNode?.data.label || ''}`}
                subtitle={selectedNode?.type ? `Type: ${selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)}` : ''}
                className="slide-up"
              >
                <Form className="node-config-form mt-3">
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Node Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={nodeName}
                          onChange={(e) => setNodeName(e.target.value)}
                          placeholder="Enter node name"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                          value={nodeStatus}
                          onChange={(e) => setNodeStatus(e.target.value)}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="error">Error</option>
                          <option value="warning">Warning</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={nodeDescription}
                      onChange={(e) => setNodeDescription(e.target.value)}
                      placeholder="Enter node description"
                    />
                  </Form.Group>
                  
                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedNode(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleUpdateNode}
                    >
                      <FaWrench className="me-2" />
                      Update Node
                    </Button>
                  </div>
                </Form>
              </Card>
            </Col>
          </Row>
        </CSSTransition>
      </Container>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmClear}
        itemName="pipeline configuration"
        itemType="pipeline configuration"
      />

      {/* Publish Confirmation Modal */}
      <Modal
        show={showPublishModal}
        onHide={() => setShowPublishModal(false)}
        title="Publish Pipeline Configuration"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowPublishModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handlePublishPipeline}
              loading={publishing}
            >
              <FaCheck className="me-2" />
              Publish
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to publish this pipeline configuration?
          This will create a new version and deploy it to the selected device.
        </p>
        <Alert variant="info">
          <FaSync className="me-2" />
          After publishing, you can view and manage versions in the Version Management page.
        </Alert>
      </Modal>
    </div>
  );
};

export default Routing;