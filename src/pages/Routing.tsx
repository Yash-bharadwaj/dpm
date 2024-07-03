/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button, Col, Container, Row } from "react-bootstrap";

import RoutingNavbar from "../components/RoutingNavbar";

import { useCallback, useState } from "react";

import SourceDrawer from "./AddNewRouting.tsx/SourceDrawer";
import DestinationDrawer from "./AddNewRouting.tsx/DestinationDrawer";

import ReactFlow, {
  Position,
  addEdge,
  applyEdgeChanges,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import PipelineModal from "./AddNewRouting.tsx/PipelineModal";
import EnrichmentModal from "./AddNewRouting.tsx/EnrichmentModal";

import { convert } from "@catalystic/json-to-yaml";
import EditSourceData from "./AddNewRouting.tsx/EditSourceData";
import EditDestinationData from "./AddNewRouting.tsx/EditDestinationData";

import toast, { toastConfig } from "react-simple-toasts";
import "react-simple-toasts/dist/theme/dark.css";
import "react-simple-toasts/dist/theme/failure.css";
import "react-simple-toasts/dist/theme/success.css";

toastConfig({ theme: "dark" });

const initialEdges = [];
const initialNodes = [];

const Routing = () => {
  const [showSource, setShowSource] = useState(false);
  const [showDestination, setShowDestination] = useState(false);
  const [addedSources, setAddedSources] = useState(Array);
  const [addedDestinations, setAddedDestinations] = useState(Array);
  const [edges, setEdges] = useState(initialEdges);
  const [showPipelines, setShowPipelines] = useState(false);
  const [showEnrichment, setShowEnrichments] = useState(false);
  const [addedPipelines, setPipelines] = useState(Array);
  const [enrichments, setEnrichments] = useState(Array);
  const [showEditSource, setShowEditSource] = useState(false);
  const [selectedSource, setSelectedSource] = useState(Object);
  const [selectedNode, setSelectedNode] = useState(Object);
  const [showEditDestination, setShowEditDestination] = useState(false);
  const [connectedNodes, setConnectedNodes] = useState(Array);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  const handleClose = () => {
    setShowSource(false);
    setShowDestination(false);
    setShowPipelines(false);
    setShowEnrichments(false);
  };

  const onAddSourceClick = () => {
    setShowSource(true);
  };

  const onAddDestinationClick = () => {
    setShowDestination(true);
  };

  const onAddPipelineClick = () => {
    setShowPipelines(true);
  };

  const onAddEnrichmentClick = () => {
    setShowEnrichments(true);
  };

  const onNodeClick = (event: object, node: object) => {
    let mainSource = {};
    let type = "";

    if (addedSources.length !== 0) {
      addedSources.forEach((source) => {
        if (source.id === node.id) {
          mainSource = source;
          type = "source";
        }
      });
    }

    if (addedDestinations.length !== 0) {
      addedDestinations.forEach((dest) => {
        if (dest.id === node.id) {
          mainSource = dest;
          type = "destination";
        }
      });
    }

    setSelectedSource(mainSource);
    setSelectedNode(node);

    if (type === "source") {
      setShowEditSource(true);
    } else if (type === "destination") {
      setShowEditDestination(true);
    }
  };

  const onAddSource = (source: object, sourceValues: object) => {
    let nodeData = { ...sourceValues };
    source.id = nodeData.name;

    const newNode = {
      id: sourceValues.name,
      data: { label: sourceValues.name, type: "source", nodeData },
      type: "input",
      sourcePosition: Position.Right,
      position: { x: -150, y: 0 },
    };

    addNode(newNode);

    handleClose();

    setAddedSources((prevList) => [...prevList, source]);
  };

  const onAddDestination = (destination: object, destinationValues: object) => {
    let nodeData = { ...destinationValues };
    destination.id = nodeData?.name;

    const newNode = {
      id: destinationValues.name,
      data: { label: destinationValues.name, type: "destination", nodeData },
      targetPosition: Position.Left,
      position: { x: 300, y: 100 },
      type: "output",
    };

    addNode(newNode);

    handleClose();
    setAddedDestinations((prevList) => [...prevList, destination]);
  };

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: any) => {
      let targetType = "";
      let sourceType = "";
      let sourceIndex = -1;
      //   let targetIndex = -1;

      let destPresent = false;

      console.log("nodes", nodes);

      nodes.forEach((node, index) => {
        if (params.target === node.id) {
          targetType = node.data.type;
          //   targetIndex = index;
        }
        if (params.source === node.id) {
          sourceType = node.data.type;
          //   sourceIndex = index;
        }
      });

      console.log("params", params);
      console.log("params", sourceType);

      if (sourceType === "source") {
        if (connectedNodes.length !== 0) {
          connectedNodes.forEach((connect: any, index: number) => {
            if (connect.source === params.source) {
              sourceIndex = index;
            }
          });
        }

        console.log("source index", sourceIndex);

        if (sourceIndex === -1) {
          const newConnection = {
            source: params.source,
            pipelines: targetType === "pipeline" ? [params.target] : [],
            enrichments: targetType === "enrichment" ? [params.target] : [],
            destinations: targetType === "destination" ? [params.target] : [],
          };

          console.log("new connection", newConnection);

          setConnectedNodes((prevList) => [...prevList, newConnection]);
        } else {
          console.log("connection present", targetType);
          if (targetType === "pipeline") {
            connectedNodes[sourceIndex].pipelines.push(params.target);
          }
          if (targetType === "enrichment") {
            connectedNodes[sourceIndex].enrichments.push(params.target);
          }
          if (targetType === "destination") {
            console.log("source to dest", connectedNodes[sourceIndex]);

            let currentDestIndex = connectedNodes[
              sourceIndex
            ].destinations.indexOf(params.target);

            if (currentDestIndex !== -1) {
              destPresent = true;
            } else {
              connectedNodes[sourceIndex].destinations.push(params.target);
            }
          }
        }
      } else {
        if (
          (sourceType === "pipeline" || sourceType === "enrichment") &&
          targetType === "destination"
        ) {
          if (connectedNodes.length !== 0) {
            const type =
              sourceType === "pipeline" ? "pipelines" : "enrichments";

            connectedNodes.forEach((node: any) => {
              const pipelineIndex = node[type].indexOf(params.source);

              if (pipelineIndex !== -1) {
                const destIndex = node.destinations.indexOf(params.target);
                if (destIndex !== -1) {
                  destPresent = true;
                } else {
                  node.destinations.push(params.target);
                }
              } else {
                node[type].push(params.source);
              }
            });
          } else {
            const newConnection = {
              source: "",
              pipelines: sourceType === "pipeline" ? [params.target] : [],
              enhancements: sourceType === "enrichment" ? [params.target] : [],
              destinations: targetType === "destination" ? [params.target] : [],
            };

            setConnectedNodes((prevList) => [...prevList, newConnection]);
          }
        }
      }

      if (destPresent) {
        toast("Source and Destinations connection already present!", {
          position: "top-right",
          zIndex: 9999,
          theme: "failure",
        });
      } else {
        setEdges((eds) => addEdge(params, eds));
      }

      console.log("connected", connectedNodes);
    },
    [nodes, connectedNodes]
  );

  const addNode = useCallback(
    (newNode: any) => {
      setNodes((n) => {
        return [...n, newNode];
      });
    },
    [setNodes]
  );

  const savePipeline = (pipeline: object) => {
    const nodeData = { ...pipeline };
    pipeline.id = nodeData.name;

    const newNode = {
      id: pipeline.name,
      data: {
        label: pipeline.name,
        type: "pipeline",
        nodeData,
      },
      position: { x: 50, y: 50 },
      type: "default",
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };

    addNode(newNode);

    setPipelines((prevList) => [...prevList, pipeline]);

    handleClose();
  };

  const onAddEnrichment = (enrichment: object) => {
    const nodeData = { ...enrichment };
    enrichment.id = nodeData.name;

    const newNode = {
      id: enrichment.name,
      data: {
        label: enrichment.name,
        type: "enrichment",
        nodeData,
      },
      position: { x: 70, y: 50 },
      type: "default",
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };

    addNode(newNode);

    setEnrichments((prevList) => [...prevList, enrichment]);

    handleClose();
  };

  const onSave = () => {
    let config = {
      node: {
        sources: {
          disabled: true,
        },
        pipelines: {
          disabled: true,
        },
        enrichments: {
          disabled: true,
        },
        destinations: {
          disabled: true,
        },
      },
    };

    if (enrichments.length === 0) {
      config.node.enrichments = {
        disabled: true,
      };
    }

    if (edges.length !== 0) {
      edges.map((edge) => {
        let sourceId = edge.source;
        let destId = edge.target;

        nodes.forEach((node) => {
          if (sourceId === node.id && node.data.type === "source") {
            let nodeData = node.data.nodeData;

            if (nodeData.outputs) {
              if (!nodeData.outputs.includes(destId)) {
                nodeData.outputs.push(destId);
              }
            } else {
              nodeData.outputs = [destId];
            }

            config.node.sources[nodeData.name] = nodeData;
            config.node.sources.disabled = false;
          }

          if (sourceId === node.id && node.data.type === "pipeline") {
            let nodeData = node.data.nodeData;

            if (nodeData.outputs) {
              if (!nodeData.outputs.includes(destId)) {
                nodeData.outputs.push(destId);
              }
            } else {
              nodeData.outputs = [destId];
            }

            config.node.pipelines[nodeData.name] = nodeData;
            config.node.pipelines.disabled = false;
          }

          if (destId === node.id && node.data.type === "pipeline") {
            let nodeData = node.data.nodeData;

            if (nodeData.inputs) {
              if (!nodeData.inputs.includes(sourceId)) {
                nodeData.inputs.push(sourceId);
              }
            } else {
              nodeData.inputs = [sourceId];
            }

            config.node.pipelines[nodeData.name] = nodeData;
            config.node.pipelines.disabled = false;
          }

          if (sourceId === node.id && node.data.type === "enrichment") {
            let nodeData = node.data.nodeData;

            if (nodeData.outputs) {
              if (!nodeData.outputs.includes(destId)) {
                nodeData.outputs.push(destId);
              }
            } else {
              nodeData.outputs = [destId];
            }

            config.node.enrichments[nodeData.name] = nodeData;
            config.node.enrichments.disabled = false;
          }

          if (destId === node.id && node.data.type === "enrichment") {
            let nodeData = node.data.nodeData;

            if (nodeData.inputs) {
              if (!nodeData.inputs.includes(sourceId)) {
                nodeData.inputs.push(sourceId);
              }
            } else {
              nodeData.inputs = [sourceId];
            }

            config.node.enrichments[nodeData.name] = nodeData;
            config.node.enrichments.disabled = false;
          }

          if (destId === node.id && node.data.type === "destination") {
            let nodeData = node.data.nodeData;

            if (nodeData.inputs) {
              if (!nodeData.inputs.includes(sourceId)) {
                nodeData.inputs.push(sourceId);
              }
            } else {
              nodeData.inputs = [];
              nodeData.inputs = [sourceId];
            }

            config.node.destinations[nodeData.name] = nodeData;
            config.node.destinations.disabled = false;
          }
        });
      });

      const yaml = convert(config);

      console.log("yaml string", yaml);
    } else {
      toast("No source-destination connections found!", {
        position: "top-right",
        zIndex: 9999,
      });
    }
  };

  const handleCloseEdit = () => {
    setShowEditSource(false);
    setShowEditDestination(false);
    setSelectedSource(Object);
  };

  const onEditSettings = (value: any) => {
    setShowEditSource(false);

    let selectedIndex = -1;
    let nodeIndex = -1;

    addedSources.forEach((source, index) => {
      if (source.id === selectedSource.id) {
        selectedIndex = index;
      }
    });

    nodes.forEach((node, index) => {
      if (node.id === selectedSource.id) {
        nodeIndex = index;
      }
    });

    let prevSources = addedSources;
    let prevNodes = nodes;

    if (value === "delete") {
      prevSources.splice(selectedIndex, 1);

      prevNodes.splice(nodeIndex, 1);

      setAddedSources((prevList) => [...prevSources]);
      setNodes((prevList) => [...prevNodes]);
    } else {
      if (value.name !== selectedSource.id) {
        prevSources[selectedIndex].id = value.name;
        setAddedSources((prevList) => [...prevSources]);
      }

      prevNodes[nodeIndex].id = value.name;
      prevNodes[nodeIndex].data = {
        label: value.name,
        nodeData: value,
        type: "source",
      };

      setNodes((prevList) => [...prevNodes]);
    }
  };

  const onEditDestSettings = (value: any) => {
    setShowEditDestination(false);

    let selectedIndex = -1;
    let nodeIndex = -1;

    addedDestinations.forEach((source, index) => {
      if (source.id === selectedSource.id) {
        selectedIndex = index;
      }
    });

    nodes.forEach((node, index) => {
      if (node.id === selectedSource.id) {
        nodeIndex = index;
      }
    });

    let prevDestinations = addedDestinations;
    let prevNodes = nodes;

    if (value === "delete") {
      prevDestinations.splice(selectedIndex, 1);

      prevNodes.splice(nodeIndex, 1);

      setAddedDestinations((prevList) => [...prevDestinations]);
      setNodes((prevList) => [...prevNodes]);
    } else {
      if (value.name !== selectedSource.id) {
        prevDestinations[selectedIndex].id = value.name;
        setAddedDestinations((prevList) => [...prevDestinations]);
      }

      prevNodes[nodeIndex].id = value.name;
      prevNodes[nodeIndex].data = {
        label: value.name,
        nodeData: value,
        type: "destination",
      };

      setNodes((prevList) => [...prevNodes]);
    }
  };

  return (
    <>
      <RoutingNavbar />

      <div className="main-page-div">
        <Container>
          {/* <Row className="justify-content-md-center">
            <Col xl={11} lg={12} md={10} sm={10}>
              <InputGroup className="mb-3">
                <InputGroup.Text id="filter">@</InputGroup.Text>
                <Form.Control
                  placeholder="Start typing to filter results"
                  aria-label="filter"
                  aria-describedby="filter"
                />
              </InputGroup>
            </Col>
          </Row> */}

          <Row className="justify-content-md-center mt-3">
            <Col xl={11} lg={12} md={10} sm={10}>
              <Button
                variant="primary"
                size="sm"
                onClick={onSave}
                style={{ float: "right", marginBottom: "12px" }}
              >
                Save Configuration
              </Button>
            </Col>

            <Col xl={11} lg={12} md={10} sm={10}>
              <div className="source-dest-div">
                <div style={{ width: "20%" }}>
                  <div className="source-dest-sub-div">
                    <div>Sources</div>

                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={onAddSourceClick}
                    >
                      Add Source
                    </Button>
                  </div>
                </div>

                <div style={{ width: "20%" }}>
                  <div className="source-dest-sub-div">
                    <div>Pipelines</div>

                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={onAddPipelineClick}
                    >
                      Add Pipeline
                    </Button>
                  </div>
                </div>

                <div style={{ width: "20%" }}>
                  <div className="source-dest-sub-div">
                    <div>Enrichments</div>

                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={onAddEnrichmentClick}
                    >
                      Add Enrichments
                    </Button>
                  </div>
                </div>

                <div style={{ width: "20%" }}>
                  <div className="source-dest-sub-div">
                    <div>Destinations</div>

                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={onAddDestinationClick}
                    >
                      Add Destination
                    </Button>
                  </div>
                </div>
              </div>

              <div style={{ height: "65vh" }}>
                <ReactFlow
                  nodes={nodes}
                  onNodesChange={onNodesChange}
                  onNodeClick={onNodeClick}
                  edges={edges}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  fitView
                  maxZoom={1.3}
                  minZoom={1.3}
                ></ReactFlow>
              </div>
            </Col>
          </Row>
        </Container>

        <SourceDrawer
          show={showSource}
          handleClose={handleClose}
          onAddSource={onAddSource}
          addedNodes={nodes}
        />

        <DestinationDrawer
          show={showDestination}
          handleClose={handleClose}
          onAddDestination={onAddDestination}
          addedNodes={nodes}
        />

        {showPipelines && (
          <PipelineModal
            show={showPipelines}
            handleClose={handleClose}
            savePipeline={savePipeline}
            addedSources={addedSources}
            addedPipelines={addedPipelines}
          />
        )}

        {showEnrichment && (
          <EnrichmentModal
            show={showEnrichment}
            handleClose={handleClose}
            onAddEnrichment={onAddEnrichment}
            enrichments={enrichments}
          />
        )}

        {showEditSource && (
          <EditSourceData
            show={showEditSource}
            onClose={handleCloseEdit}
            selectedSource={selectedSource}
            onSaveSettings={onEditSettings}
            selectedNode={selectedNode}
            addedNodes={nodes}
          />
        )}

        {showEditDestination && (
          <EditDestinationData
            show={showEditDestination}
            onHide={handleCloseEdit}
            selectedDestination={selectedSource}
            onSaveSettings={onEditDestSettings}
            selectedNode={selectedNode}
            addedNodes={nodes}
          />
        )}
      </div>
    </>
  );
};

export default Routing;
