/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button, Col, Container, Row } from "react-bootstrap";

import RoutingNavbar from "../components/RoutingNavbar";

import { useCallback, useEffect, useState } from "react";

import SourceDrawer from "./AddNewRouting.tsx/SourceDrawer";
import DestinationDrawer from "./AddNewRouting.tsx/DestinationDrawer";

import ReactFlow, {
  Controls,
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
  const [currentSource, setCurrentSource] = useState("");

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
    const nodeData = { ...sourceValues };
    let sourceData = { ...source };

    sourceData.id = nodeData.name;

    const newNode = {
      id: sourceValues.name,
      data: { label: sourceValues.name, type: "source", nodeData },
      type: "input",
      sourcePosition: Position.Right,
      position: { x: -150, y: 0 },
    };

    addNode(newNode);

    handleClose();

    setAddedSources((prevList) => {
      return [...prevList, sourceData];
    });
  };

  const onAddDestination = (destination: object, destinationValues: object) => {
    const nodeData = { ...destinationValues };

    let destData = { ...destination };
    destData.id = nodeData?.name;

    const newNode = {
      id: destinationValues.name,
      data: { label: destinationValues.name, type: "destination", nodeData },
      targetPosition: Position.Left,
      position: { x: 300, y: 100 },
      type: "output",
    };

    addNode(newNode);

    handleClose();
    setAddedDestinations((prevList) => [...prevList, destData]);
  };

  const onEdgesChange = useCallback((changes: any) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback(
    (params: any) => {
      let targetType = "";
      let sourceType = "";
      let sourceIndex = -1;

      let destPresent = false;
      let sourcePresent = true;

      nodes.forEach((node) => {
        if (params.target === node.id) {
          targetType = node.data.type;
        }
        if (params.source === node.id) {
          sourceType = node.data.type;
        }
      });

      if (sourceType === "source") {
        if (connectedNodes.length !== 0) {
          connectedNodes.forEach((connect: any, index: number) => {
            if (connect.source === params.source) {
              sourceIndex = index;
              sourcePresent = true;
            }
          });
        }

        if (sourceIndex === -1) {
          let destinationArray: Array<string> = [];

          if (
            connectedNodes.length !== 0 &&
            (targetType === "pipeline" || targetType === "enrichment")
          ) {
            let prevNodes = [...connectedNodes];
            const type =
              targetType === "pipeline" ? "pipelines" : "enrichments";

            connectedNodes.forEach((connect: any) => {
              const index = connect[type].indexOf(params.target);

              if (index !== -1 && connect.destinations.length !== 0) {
                destinationArray = [...connect.destinations];
              }
            });

            const newConnection = {
              source: params.source,
              pipelines: targetType === "pipeline" ? [params.target] : [],
              enrichments: targetType === "enrichment" ? [params.target] : [],
              destinations: destinationArray,
            };

            prevNodes.push(newConnection);

            setConnectedNodes((prevList) => [...prevNodes]);
            setCurrentSource(params.source);
          } else {
            const newConnection = {
              source: params.source,
              pipelines: targetType === "pipeline" ? [params.target] : [],
              enrichments: targetType === "enrichment" ? [params.target] : [],
              destinations: targetType === "destination" ? [params.target] : [],
            };

            setConnectedNodes((prevList) => [...prevList, newConnection]);
            setCurrentSource(params.source);
          }
        } else {
          let prevNodes = [...connectedNodes];

          if (targetType === "pipeline") {
            prevNodes[sourceIndex].pipelines.push(params.target);
          }
          if (targetType === "enrichment") {
            prevNodes[sourceIndex].enrichments.push(params.target);
          }
          if (targetType === "destination") {
            let currentDestIndex = prevNodes[sourceIndex].destinations.indexOf(
              params.target
            );

            if (currentDestIndex !== -1) {
              destPresent = true;
            } else {
              prevNodes[sourceIndex].destinations.push(params.target);
            }

            setCurrentSource(params.source);
            // setConnectedNodes((prevList) => [...prevNodes]);
          }
        }
      } else {
        if (sourceType === "pipeline" || sourceType === "enrichment") {
          if (connectedNodes.length !== 0) {
            let prevNodes = [...connectedNodes];

            const type =
              sourceType === "pipeline" ? "pipelines" : "enrichments";

            const destType =
              targetType === "pipeline"
                ? "pipelines"
                : targetType === "enrichment"
                ? "enrichments"
                : "destinations";

            prevNodes.forEach((node: any) => {
              const edgeSourceIndex = node[type].indexOf(params.source);
              const edgeTargetIndex = node[destType].indexOf(params.target);

              if (targetType !== "destination") {
                if (edgeTargetIndex === -1) {
                  node[destType].push(params.target);
                }

                if (edgeSourceIndex === -1) {
                  node[type].push(params.source);
                }
              } else {
                if (edgeSourceIndex !== -1) {
                  const destIndex = node.destinations.indexOf(params.target);

                  if (node.source === currentSource) {
                    if (destIndex !== -1) {
                      destPresent = true;
                    } else {
                      node.destinations.push(params.target);
                      destPresent = false;
                    }
                  }
                } else {
                  node[type].push(params.source);
                }
              }
            });

            setConnectedNodes((prevList) => [...prevNodes]);
          } else {
            sourcePresent = false;
          }
        }
      }

      if (destPresent) {
        toast("Source and Destination connection already present!", {
          position: "top-right",
          zIndex: 9999,
          theme: "failure",
        });
      } else if (!sourcePresent) {
        toast("No source node connected!", {
          position: "top-right",
          zIndex: 9999,
          theme: "failure",
        });
      } else {
        let newEdge = { ...params };
        newEdge.animated = true;
        newEdge.type = "smoothstep";

        setEdges((eds) => addEdge(newEdge, eds));
      }
    },
    [nodes, connectedNodes, currentSource]
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

    const pipelineData = { ...pipeline };

    const newNode = {
      id: pipeline.id,
      data: {
        label: pipeline.id,
        type: "pipeline",
        nodeData,
      },
      position: { x: 50, y: 50 },
      type: "default",
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };

    addNode(newNode);

    setPipelines((prevList) => [...prevList, pipelineData]);

    handleClose();
  };

  const onAddEnrichment = (enrichment: object) => {
    const nodeData = { ...enrichment };

    let enrichData = { ...enrichment };
    enrichData.id = nodeData.name;

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

    setEnrichments((prevList) => [...prevList, enrichData]);

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
        const sourceId = edge.source;
        const destId = edge.target;

        let sourceIndex = -1;
        let destIndex = -1;

        nodes.forEach((node, index) => {
          if (sourceId === node.id) {
            sourceIndex = index;
          }

          if (destId === node.id) {
            destIndex = index;
          }
        });

        nodes.forEach((node) => {
          if (sourceId === node.id && node.data.type === "source") {
            const configNodeData = { ...node.data.nodeData };

            if (!config.node.sources[configNodeData.name]) {
              config.node.sources = {
                ...config.node.sources,
                [configNodeData.name]: {
                  ...configNodeData,
                  outputs: [],
                },
              };
            }

            let configOutputs =
              config.node.sources[configNodeData.name].outputs || [];

            if (destIndex !== -1) {
              if (configOutputs) {
                if (!configOutputs.includes(destId)) {
                  configOutputs.push(destId);
                }
              } else {
                configOutputs = [destId];
              }
            }

            config.node.sources[configNodeData.name].outputs = configOutputs;
            config.node.sources.disabled = false;
          }

          if (sourceId === node.id && node.data.type === "pipeline") {
            const configNodeData = { ...node.data.nodeData };

            if (!config.node.pipelines[configNodeData.name]) {
              config.node.pipelines = {
                ...config.node.pipelines,
                [configNodeData.name]: {
                  ...configNodeData,
                  inputs: [],
                  outputs: [],
                },
              };
            }

            let configOutputs =
              config.node.pipelines[configNodeData.name].outputs || [];

            if (destIndex !== -1) {
              if (configOutputs) {
                if (!configOutputs.includes(destId)) {
                  configOutputs.push(destId);
                }
              } else {
                configOutputs = [destId];
              }
            }

            config.node.pipelines[configNodeData.name].outputs = configOutputs;
            config.node.pipelines.disabled = false;
          }

          if (destId === node.id && node.data.type === "pipeline") {
            const configNodeData = { ...node.data.nodeData };

            if (!config.node.pipelines[configNodeData.name]) {
              config.node.pipelines = {
                ...config.node.pipelines,
                [configNodeData.name]: {
                  ...configNodeData,
                  inputs: [],
                  outputs: [],
                },
              };
            }

            let configInputs =
              config.node.pipelines[configNodeData.name].inputs || [];

            if (sourceIndex !== -1) {
              if (configInputs) {
                if (!configInputs.includes(sourceId)) {
                  configInputs.push(sourceId);
                }
              } else {
                configInputs = [sourceId];
              }
            }

            config.node.pipelines[configNodeData.name].inputs = configInputs;
            config.node.pipelines.disabled = false;
          }

          if (sourceId === node.id && node.data.type === "enrichment") {
            const configNodeData = { ...node.data.nodeData };

            if (!config.node.enrichments[configNodeData.name]) {
              config.node.enrichments = {
                ...config.node.enrichments,
                [configNodeData.name]: {
                  ...configNodeData,
                  inputs: [],
                  outputs: [],
                },
              };
            }

            let configOutputs =
              config.node.enrichments[configNodeData.name].outputs || [];

            if (destIndex !== -1) {
              if (configOutputs) {
                if (!configOutputs.includes(destId)) {
                  configOutputs.push(destId);
                }
              } else {
                configOutputs = [destId];
              }
            }

            config.node.enrichments[configNodeData.name].outputs =
              configOutputs;
            config.node.enrichments.disabled = false;
          }

          if (destId === node.id && node.data.type === "enrichment") {
            const configNodeData = { ...node.data.nodeData };

            if (!config.node.enrichments[configNodeData.name]) {
              config.node.enrichments = {
                ...config.node.enrichments,
                [configNodeData.name]: {
                  ...configNodeData,
                  inputs: [],
                  outputs: [],
                },
              };
            }

            let configInputs =
              config.node.enrichments[configNodeData.name].inputs || [];

            if (sourceIndex !== -1) {
              if (configInputs) {
                if (!configInputs.includes(sourceId)) {
                  configInputs.push(sourceId);
                }
              } else {
                configInputs = [sourceId];
              }
            }

            config.node.enrichments[configNodeData.name].inputs = configInputs;
            config.node.enrichments.disabled = false;
          }

          if (destId === node.id && node.data.type === "destination") {
            const configNodeData = { ...node.data.nodeData };

            if (!config.node.destinations[configNodeData.name]) {
              config.node.destinations = {
                ...config.node.destinations,
                [configNodeData.name]: {
                  ...configNodeData,
                  inputs: [],
                },
              };
            }

            let configInputs =
              config.node.destinations[configNodeData.name].inputs || [];

            if (sourceIndex !== -1) {
              if (configInputs) {
                if (!configInputs.includes(sourceId)) {
                  configInputs.push(sourceId);
                }
              } else {
                configInputs = [sourceId];
              }
            }

            config.node.destinations[configNodeData.name].inputs = configInputs;
            config.node.destinations.disabled = false;
          }
        });
      });

      if (
        config.node.destinations.disabled === true ||
        config.node.sources.disabled === true
      ) {
        toast("No source-destination connections found!", {
          position: "top-right",
          zIndex: 9999,
          theme: "failure",
        });
      } else {
        const yaml = convert(config);
        console.log(yaml);
      }
    } else {
      toast("No source-destination connections found!", {
        position: "top-right",
        zIndex: 9999,
        theme: "failure",
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

      let changes = [];

      if (edges.length !== 0) {
        edges.forEach((edge) => {
          if (
            edge.source === selectedSource.id ||
            edge.target === selectedSource.id
          ) {
            let removeEdge = {
              id: edge.id,
              type: "remove",
            };

            changes.push(removeEdge);
          }
        });
      }

      if (changes.length !== 0) {
        onEdgesChange(changes);
      }

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

      let changes = [];

      if (edges.length !== 0) {
        edges.forEach((edge) => {
          if (
            edge.source === selectedSource.id ||
            edge.target === selectedSource.id
          ) {
            const removeEdge = {
              id: edge.id,
              type: "remove",
            };

            changes.push(removeEdge);
          }
        });
      }

      if (changes.length !== 0) {
        onEdgesChange(changes);
      }

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

  const handleEdgeChange = () => {
    let newEdges = [];

    edges.forEach((edge) => {
      let targetType = "";
      let sourceType = "";
      let sourceIndex = -1;

      nodes.forEach((node) => {
        if (edge.target === node.id) {
          targetType = node.data.type;
        }
        if (edge.source === node.id) {
          sourceType = node.data.type;
        }
      });

      if (sourceType === "source") {
        if (newEdges.length !== 0) {
          newEdges.forEach((connect: any, index: number) => {
            if (connect.source === edge.source) {
              sourceIndex = index;
            }
          });
        }

        if (sourceIndex === -1) {
          const newConnection = {
            source: edge.source,
            pipelines: targetType === "pipeline" ? [edge.target] : [],
            enrichments: targetType === "enrichment" ? [edge.target] : [],
            destinations: targetType === "destination" ? [edge.target] : [],
          };

          newEdges.push(newConnection);
        } else {
          if (targetType === "pipeline") {
            const index = newEdges[sourceIndex].pipelines.indexOf(edge.target);

            if (index === -1) {
              newEdges[sourceIndex].pipelines.push(edge.target);
            }
          }
          if (targetType === "enrichment") {
            const index = newEdges[sourceIndex].enrichments.indexOf(
              edge.target
            );

            if (index === -1) {
              newEdges[sourceIndex].enrichments.push(edge.target);
            }
          }
          if (targetType === "destination") {
            const index = newEdges[sourceIndex].destinations.indexOf(
              edge.target
            );

            if (index === -1) {
              newEdges[sourceIndex].destinations.push(edge.target);
            }
          }
          setCurrentSource(edge.source);
        }
      } else {
        if (sourceType === "pipeline" || sourceType === "enrichment") {
          let prevConnection = [...connectedNodes];

          if (prevConnection.length !== 0) {
            const type =
              sourceType === "pipeline" ? "pipelines" : "enrichments";

            const destType =
              targetType === "enrichment" ? "enrichments" : "destinations";

            prevConnection.forEach((node: any, index: number) => {
              const edgeSourceIndex = node[type].indexOf(edge.source);
              const edgeTargetIndex = node[destType].indexOf(edge.target);

              if (targetType !== "destination") {
                if (edgeTargetIndex !== -1) {
                  if (newEdges[index]) {
                    newEdges[index][destType].push(edge.target);
                  } else {
                    const newConnection = {
                      source: node.source,
                      pipelines: type === "pipelines" ? [edge.source] : [],
                      enrichments:
                        destType === "enrichments" || type === "enrichments"
                          ? [edge.target]
                          : [],
                      destinations:
                        destType === "destinations" ? [edge.target] : [],
                    };

                    newEdges.push(newConnection);
                  }
                } else {
                  const newConnection = {
                    source: node.source,
                    pipelines: type === "pipelines" ? [edge.source] : [],
                    enrichments:
                      destType === "enrichments" ? [edge.target] : [],
                    destinations: [],
                  };

                  newEdges.push(newConnection);
                }
              } else {
                if (edgeSourceIndex !== -1) {
                  const destIndex = node.destinations.indexOf(edge.target);

                  if (destIndex !== -1) {
                    if (newEdges[index]) {
                      newEdges[index][destType].push(edge.target);
                    } else {
                      const newConnection = {
                        source: node.source,
                        pipelines: type === "pipelines" ? [edge.source] : [],
                        enrichments:
                          type === "enrichments" ? [edge.source] : [],
                        destinations: [edge.target],
                      };

                      newEdges.push(newConnection);
                    }
                  }
                } else {
                  if (newEdges[index]) {
                    newEdges[index][destType].push(edge.target);
                    newEdges[index][type].push(edge.source);
                  } else {
                    const newConnection = {
                      source: node.source,
                      pipelines: type === "pipelines" ? [edge.source] : [],
                      enrichments: type === "enrichments" ? [edge.source] : [],
                      destinations: [edge.target],
                    };

                    newEdges.push(newConnection);
                  }
                }
              }
            });
          }
        }
      }
    });

    console.log("edges", newEdges);

    setConnectedNodes((prevList) => [...newEdges]);
  };

  useEffect(() => {
    handleEdgeChange();
  }, [edges]);

  return (
    <>
      <RoutingNavbar />

      <div className="main-page-div">
        <Row className="justify-content-md-center" style={{ margin: "0 8px" }}>
          <Col xl={12} lg={12} md={12} sm={12}>
            <Button
              variant="primary"
              size="sm"
              onClick={onSave}
              style={{ float: "right", marginBottom: "12px" }}
            >
              Save Configuration
            </Button>
          </Col>

          <Col xl={12} lg={12} md={12} sm={12}>
            <div className="source-dest-div">
              <div style={{ width: "20%" }}>
                <div className="source-dest-sub-div">
                  <div>Sources</div>

                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={onAddSourceClick}
                  >
                    +
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
                    +
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
                    +
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
                    +
                  </Button>
                </div>
              </div>
            </div>

            <div style={{ height: "100vh" }}>
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
              >
                <Controls />
              </ReactFlow>
            </div>
          </Col>
        </Row>

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
