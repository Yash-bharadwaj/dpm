/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button, Col, Modal, Row } from "react-bootstrap";

import RoutingNavbar from "../components/RoutingNavbar";

import { useCallback, useEffect, useState } from "react";

import SourceDrawer from "./AddNewRouting.tsx/SourceDrawer";
import DestinationDrawer from "./AddNewRouting.tsx/DestinationDrawer";

import { SAVE_CONFIG, GET_CONFIG, DEPLOY_CONFIG } from "../query/query";

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
import { useMutation } from "@apollo/client";

import jsyaml from "js-yaml";
import { getSourceFromID } from "./AddNewRouting.tsx/helper";

import { useParams } from "react-router-dom";

toastConfig({ theme: "dark" });

const Routing = () => {
  const params = useParams();

  const orgCode = params.orgcode;
  const deviceCode = params.devicecode;

  const [showSource, setShowSource] = useState(false);
  const [showDestination, setShowDestination] = useState(false);
  const [addedSources, setAddedSources] = useState([]);
  const [addedDestinations, setAddedDestinations] = useState([]);
  const [edges, setEdges] = useState([]);
  const [showPipelines, setShowPipelines] = useState(false);
  const [showEnrichment, setShowEnrichments] = useState(false);
  const [addedPipelines, setPipelines] = useState([]);
  const [enrichments, setEnrichments] = useState([]);
  const [showEditSource, setShowEditSource] = useState(false);
  const [selectedSource, setSelectedSource] = useState(Object);
  const [selectedNode, setSelectedNode] = useState(Object);
  const [showEditDestination, setShowEditDestination] = useState(false);
  const [connectedNodes, setConnectedNodes] = useState(Array);
  const [currentSource, setCurrentSource] = useState("");
  const [enableDelete, setEnableDelete] = useState(false);
  const [showEditPipeline, setShowEditPipeline] = useState(false);
  const [nodeType, setNodeType] = useState("");
  const [configExists, setConfigExists] = useState(false);
  const [configYaml, setConfigYaml] = useState("");

  const [nodes, setNodes, onNodesChange] = useNodesState([]);

  const handleClose = () => {
    setShowSource(false);
    setShowDestination(false);
    setShowPipelines(false);
    setShowEnrichments(false);
    setSelectedSource({});
    setSelectedNode({});
    setShowEditPipeline(false);
    setNodeType("");
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

    if (addedPipelines.length !== 0) {
      addedPipelines.forEach((pipeline) => {
        if (pipeline.name === node.id) {
          mainSource = pipeline;
          type = "pipeline";
        }
      });
    }

    if (enrichments.length !== 0) {
      enrichments.forEach((enrichment) => {
        if (enrichment.name === node.id) {
          mainSource = enrichment;
          type = "enrichment";
        }
      });
    }

    setSelectedSource(mainSource);
    setSelectedNode(node);
    setNodeType(type);

    if (type === "source") {
      setShowEditSource(true);
    } else if (type === "destination") {
      setShowEditDestination(true);
    } else if (type === "pipeline") {
      setShowEditPipeline(true);
    } else if (type === "enrichment") {
      setShowEditPipeline(true);
    }
  };

  // get config codee here

  const [getConfigMutation] = useMutation(GET_CONFIG);

  const getConfig = async () => {
    setConfigExists(true);
    try {
      const { data } = await getConfigMutation({
        variables: {
          input: {
            orgcode: orgCode,
            devicecode: deviceCode,
          },
        },
      });

      const savedConfig = atob(data.getConfig.resposedata);

      if (savedConfig && configYaml === "") {
        const sample = jsyaml.load(savedConfig);

        let initialAddedSources = [];
        let initialAddedDestinations = [];
        let initialAddedPipelines = [];
        let initialAddedEnrichments = [];

        let existingNodes = [];
        let existingEdges = [];

        if (!sample.node.sources.disabled) {
          const sources = sample.node.sources;
          const destinations = sample.node.destinations;
          const pipelines = sample.node.pipelines;
          const enrichments = sample.node.enrichments;

          Object.keys(sources).forEach((source, index) => {
            if (source !== "disabled") {
              const sourceId = sources[source].name;

              const originalSource = getSourceFromID(
                sources[source].uuid,
                "source",
                sources[source]
              );
              originalSource.id = sourceId;

              const yPosition = -200 + index * 40;

              const currentSource = {
                id: sourceId,
                sourcePosition: Position.Right,
                type: "input",
                position: { x: -220, y: yPosition },
                height: 35,
                width: 150,
                data: {
                  label: sourceId,
                  nodeData: sources[source],
                  type: "source",
                },
              };

              existingNodes.push(currentSource);
              initialAddedSources.push(originalSource);

              if (sources[source].outputs.length !== 0) {
                sources[source].outputs.forEach((edge: string) => {
                  const edgeId = sourceId + "-" + edge;

                  const newEdge = {
                    animated: true,
                    id: edgeId,
                    source: sourceId,
                    target: edge,
                    type: "smoothstep",
                  };

                  existingEdges.push(newEdge);
                });
              }
            }
          });

          if (pipelines) {
            Object.keys(pipelines).forEach((pipeline, index) => {
              if (pipeline !== "disabled") {
                const pipelineId = pipelines[pipeline].name;

                const yPosition = -200 + index * 40;

                const currentPipeline = {
                  id: pipelineId,
                  sourcePosition: "right",
                  targetPosition: "left",
                  type: "default",
                  height: 35,
                  width: 150,
                  position: { x: -30, y: yPosition },
                  data: {
                    label: pipelineId,
                    nodeData: pipelines[pipeline],
                    type: "pipeline",
                  },
                };

                existingNodes.push(currentPipeline);
                initialAddedPipelines.push(pipelines[pipeline]);

                if (pipelines[pipeline].outputs.length !== 0) {
                  pipelines[pipeline].outputs.forEach((edge: string) => {
                    const edgeId = pipelineId + "-" + edge;

                    const newEdge = {
                      animated: true,
                      id: edgeId,
                      source: pipelineId,
                      target: edge,
                      type: "smoothstep",
                    };

                    existingEdges.push(newEdge);
                  });
                }
              }
            });
          }

          if (enrichments) {
            Object.keys(enrichments).forEach((enrichment, index) => {
              if (enrichment !== "disabled") {
                const enrichmentId = enrichments[enrichment].name;

                const yPosition = -200 + index * 40;

                const currentEnrichment = {
                  id: enrichmentId,
                  sourcePosition: "right",
                  targetPosition: "left",
                  type: "default",
                  height: 35,
                  width: 150,
                  position: { x: 180, y: yPosition },
                  data: {
                    label: enrichmentId,
                    nodeData: enrichments[enrichment],
                    type: "enrichment",
                  },
                };

                existingNodes.push(currentEnrichment);
                initialAddedEnrichments.push(enrichments[enrichment]);

                if (enrichments[enrichment].outputs.length !== 0) {
                  enrichments[enrichment].outputs.forEach((edge: string) => {
                    const edgeId = enrichmentId + "-" + edge;

                    const newEdge = {
                      animated: true,
                      id: edgeId,
                      source: enrichmentId,
                      target: edge,
                      type: "smoothstep",
                    };

                    existingEdges.push(newEdge);
                  });
                }
              }
            });
          }

          Object.keys(destinations).forEach((destination, index) => {
            if (destination !== "disabled") {
              const destinationId = destinations[destination].name;

              const originalSource = getSourceFromID(
                destinations[destination].uuid,
                "destination",
                destinations[destination]
              );
              originalSource.id = destinationId;

              const yPosition = -200 + index * 40;

              const currentDestination = {
                id: destinationId,
                targetPosition: Position.Left,
                type: "output",
                height: 35,
                width: 150,
                position: { x: 380, y: yPosition },
                data: {
                  label: destinationId,
                  nodeData: destinations[destination],
                  type: "destination",
                },
              };

              existingNodes.push(currentDestination);
              initialAddedDestinations.push(originalSource);
            }
          });
        }

        setConfigYaml(savedConfig);
        setNodes(existingNodes);
        setEdges(existingEdges);
        setAddedDestinations(initialAddedDestinations);
        setAddedSources(initialAddedSources);
        setEnrichments(initialAddedEnrichments);
        setPipelines(initialAddedPipelines);
      }
    } catch (error) {
      console.error("Error getting config:", error);
    }
  };

  // get config code ends here

  // save config code here

  const [saveConfigMutation] = useMutation(SAVE_CONFIG);

  const [deploySavedConfig] = useMutation(DEPLOY_CONFIG);

  // save config ends here

  const onAddSource = (source: object, sourceValues: object) => {
    const nodeData = { ...sourceValues };
    let sourceData = { ...source };

    sourceData.id = nodeData.name;

    const newNode = {
      id: sourceValues.name,
      data: { label: sourceValues.name, type: "source", nodeData },
      type: "input",
      sourcePosition: Position.Right,
      position: { x: -220, y: 0 },
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
      position: { x: 380, y: 100 },
      type: "output",
    };

    addNode(newNode);

    handleClose();
    setAddedDestinations((prevList) => [...prevList, destData]);
  };

  const onEdgesUpdate = useCallback((changes: any) => {
    if (changes[0].selected) {
      setEnableDelete(true);
    } else {
      setEnableDelete(false);
    }
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

                  if (destIndex !== -1) {
                    destPresent = true;
                  } else {
                    node.destinations.push(params.target);
                    destPresent = false;
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
      id: pipeline.name,
      data: {
        label: pipeline.name,
        type: "pipeline",
        nodeData,
      },
      position: { x: -30, y: 50 },
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
      position: { x: 180, y: 50 },
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

      let configPipelines = { ...config.node.pipelines };
      let configEnrichments = { ...config.node.enrichments };
      let finalConfigPipelines = {
        disabled: true,
      };
      let finalConfigEnrichments = { disabled: true };

      Object.keys(configPipelines).forEach((pipeline) => {
        if (pipeline !== "disabled") {
          if (
            configPipelines[pipeline].inputs.length !== 0 &&
            configPipelines[pipeline].outputs.length !== 0
          ) {
            finalConfigPipelines[pipeline] = configPipelines[pipeline];
            finalConfigPipelines.disabled = false;
          } else {
            const sources = Object.keys(config.node.sources);
            const destinations = Object.keys(config.node.destinations);
            const enrichments = Object.keys(config.node.enrichments);

            sources.forEach((source: any) => {
              if (source !== "disabled") {
                let indexInSource =
                  config.node.sources[source].outputs.indexOf(pipeline);

                if (indexInSource !== -1) {
                  config.node.sources[source].outputs.splice(indexInSource, 1);
                }
              }
            });

            destinations.forEach((destination: any) => {
              if (destination !== "disabled") {
                let indexInDest =
                  config.node.destinations[destination].inputs.indexOf(
                    pipeline
                  );

                if (indexInDest !== -1) {
                  config.node.destinations[destination].inputs.splice(
                    indexInDest,
                    1
                  );
                }
              }
            });

            if (!enrichments.disabled) {
              enrichments.forEach((enrichment) => {
                if (enrichment !== "disabled") {
                  let indexInEnrichment =
                    config.node.enrichments[enrichment].inputs.indexOf(
                      pipeline
                    );

                  if (indexInEnrichment !== -1) {
                    config.node.enrichments[enrichment].inputs.splice(
                      indexInEnrichment,
                      1
                    );
                  }
                }
              });
            }
          }
        }
      });

      Object.keys(configEnrichments).forEach((enrichment) => {
        if (enrichment !== "disabled") {
          if (
            configEnrichments[enrichment].inputs.length !== 0 &&
            configEnrichments[enrichment].outputs.length !== 0
          ) {
            finalConfigEnrichments[enrichment] = configEnrichments[enrichment];
            finalConfigEnrichments.disabled = false;
          } else {
            const sources = Object.keys(config.node.sources);
            const destinations = Object.keys(config.node.destinations);
            const pipelines = Object.keys(config.node.pipelines);

            sources.forEach((source: any) => {
              if (source !== "disabled") {
                let indexInSource =
                  config.node.sources[source].outputs.indexOf(enrichment);

                if (indexInSource !== -1) {
                  config.node.sources[source].outputs.splice(indexInSource, 1);
                }
              }
            });

            destinations.forEach((destination: any) => {
              if (destination !== "disabled") {
                let indexInDest =
                  config.node.destinations[destination].inputs.indexOf(
                    enrichment
                  );

                if (indexInDest !== -1) {
                  config.node.destinations[destination].inputs.splice(
                    indexInDest,
                    1
                  );
                }
              }
            });

            if (!pipelines.disabled) {
              pipelines.forEach((pipeline) => {
                if (pipeline !== "disabled") {
                  let indexInEnrichment =
                    config.node.pipelines[pipeline].outputs.indexOf(enrichment);

                  if (indexInEnrichment !== -1) {
                    config.node.pipelines[pipeline].outputs.splice(
                      indexInEnrichment,
                      1
                    );
                  }
                }
              });
            }
          }
        }
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
        config.node.pipelines = finalConfigPipelines;
        config.node.enrichments = finalConfigEnrichments;

        const yaml = convert(config);
        setConfigYaml(yaml);

        console.log("yaml", yaml);

        const config64code = btoa(yaml);

        saveConfigMutation({
          variables: {
            input: {
              orgcode: orgCode,
              devicecode: deviceCode,
              configdata: config64code,
            },
          },
        })
          .then((response) => {
            // Handle the response

            if (response.data.saveConfig.resposestatus) {
              toast("Config saved successfully!", {
                position: "top-right",
                zIndex: 9999,
                theme: "success",
              });

              setConfigExists(true);
            }
          })
          .catch((error) => {
            // Handle any errors
            console.error("Error saving config:", error);

            toast(error, {
              position: "top-right",
              zIndex: 9999,
              theme: "failure",
            });

            setConfigExists(false);
          });
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
    setNodeType("");
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
        setEdges((eds) => applyEdgeChanges(changes, eds));
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
        setEdges((eds) => applyEdgeChanges(changes, eds));
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

  const sourceCheck = (source: string, target: string) => {
    let present = false;

    edges.map((edge: any) => {
      if (edge.source === source && edge.target === target) {
        present = true;
      }
    });

    return present;
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
        console.log("edge", edge);

        if (newEdges.length !== 0) {
          console.log("new edges", newEdges);
          newEdges.forEach((connect: any, index: number) => {
            console.log("connect", connect);
            console.log("edge", edge);
            if (connect.source === edge.source) {
              sourceIndex = index;
            }
          });
        }

        console.log("source index", sourceIndex);

        if (sourceIndex === -1) {
          const newConnection = {
            source: edge.source,
            pipelines: targetType === "pipeline" ? [edge.target] : [],
            enrichments: targetType === "enrichment" ? [edge.target] : [],
            destinations: targetType === "destination" ? [edge.target] : [],
          };

          sourceIndex = newEdges.length;

          newEdges.push(newConnection);
        }

        if (targetType === "pipeline") {
          const index = newEdges[sourceIndex].pipelines.indexOf(edge.target);

          if (index === -1) {
            newEdges[sourceIndex].pipelines.push(edge.target);
          }
        } else if (targetType === "enrichment") {
          const index = newEdges[sourceIndex].enrichments.indexOf(edge.target);

          if (index === -1) {
            newEdges[sourceIndex].enrichments.push(edge.target);
          }
        } else if (targetType === "destination") {
          const index = newEdges[sourceIndex].destinations.indexOf(edge.target);

          if (index === -1) {
            newEdges[sourceIndex].destinations.push(edge.target);
          }
        }

        setCurrentSource(edge.source);
        setConnectedNodes((prevList) => [...newEdges]);
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
                console.log("node", node);
                console.log("edge", edge);
                console.log("source index", edgeSourceIndex);
                console.log("target index", edgeTargetIndex);
                if (edgeTargetIndex !== -1) {
                  console.log("here", node);
                  const sourceConnectionPresent = sourceCheck(
                    node.source,
                    edge.source
                  );

                  if (newEdges[index]) {
                    if (sourceConnectionPresent) {
                      newEdges[index][destType].push(edge.target);
                    }
                  } else {
                    //target present but edge not created
                    //check if source is connected before
                    const sourceConnectionPresent = sourceCheck(
                      node.source,
                      edge.source
                    );

                    //create new only if node source is connected to edge source
                    if (sourceConnectionPresent) {
                      console.log("create new");
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
                  }
                } else {
                  const sourceConnectionPresent = sourceCheck(
                    node.source,
                    edge.source
                  );

                  console.log(
                    "sourceConnectionPresent",
                    sourceConnectionPresent
                  );

                  if (edgeSourceIndex !== -1) {
                    console.log("source present", newEdges);

                    console.log("new", newEdges[index]);
                    if (newEdges[index]) {
                      newEdges[index][destType].push(edge.target);
                    } else {
                      if (sourceConnectionPresent) {
                        const newConnection = {
                          source: node.source,
                          pipelines:
                            type === "pipelines"
                              ? [edge.source]
                              : node.pipelines,
                          enrichments:
                            destType === "enrichments" || type === "enrichments"
                              ? [edge.target]
                              : node.enrichments,
                          destinations:
                            destType === "destinations"
                              ? [edge.target]
                              : node.destinations,
                        };

                        newEdges.push(newConnection);
                      }
                    }
                  } else {
                    //create new only if node source is connected to edge source
                    if (sourceConnectionPresent) {
                      console.log("create new", node);
                      console.log("edge", edge);
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
                  }
                }
              } else {
                console.log("node", node);
                console.log("edge", edge);
                console.log("source index", edgeSourceIndex);
                console.log("target index", edgeTargetIndex);
                if (edgeSourceIndex !== -1) {
                  const destIndex = node.destinations.indexOf(edge.target);

                  if (destIndex !== -1) {
                    const sourceConnectionPresent = sourceCheck(
                      node.source,
                      edge.source
                    );

                    if (newEdges[index]) {
                      console.log("new edge", newEdges[index]);
                      const currentSourceIndex = newEdges[index][type].indexOf(
                        edge.source
                      );
                      if (currentSourceIndex !== -1) {
                        newEdges[index][destType].push(edge.target);
                      }
                    } else {
                      //check if source is connected before
                      const sourceConnectionPresent = sourceCheck(
                        node.source,
                        edge.source
                      );

                      //create new only if node source is connected to edge source
                      if (sourceConnectionPresent) {
                        const newConnection = {
                          source: node.source,
                          pipelines:
                            type === "pipelines"
                              ? [edge.source]
                              : node.pipelines,
                          enrichments:
                            type === "enrichments"
                              ? [edge.source]
                              : node.enrichments,
                          destinations: [edge.target],
                        };

                        newEdges.push(newConnection);
                      }
                    }
                  } else {
                    if (edgeTargetIndex !== -1) {
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
                    } else {
                      console.log("here", newEdges[index]);
                      if (newEdges[index]) {
                        const currentSourceIndex = newEdges[index][
                          type
                        ].indexOf(edge.source);

                        if (currentSourceIndex !== -1) {
                          newEdges[index][destType].push(edge.target);
                        }
                      }
                    }
                  }
                } else {
                  if (newEdges[index]) {
                    console.log("new edge", newEdges[index]);
                    const currentSourceIndex = newEdges[index][type].indexOf(
                      edge.source
                    );
                    const currentDestIndex = newEdges[index][destType].indexOf(
                      edge.target
                    );

                    console.log("currentSourceIndex", currentSourceIndex);

                    if (currentSourceIndex !== -1) {
                      newEdges[index][destType].push(edge.target);
                      newEdges[index][type].push(edge.source);
                    }
                  } else {
                    console.log("no new edge");

                    const sourceConnectionPresent = sourceCheck(
                      node.source,
                      edge.source
                    );

                    //create new only if node source is connected to edge source
                    if (sourceConnectionPresent) {
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
                  }
                }
              }
            });
          }
        }
      }
    });

    console.log("new connections", newEdges);

    setConnectedNodes((prevList) => [...newEdges]);
  };

  const onDeletePipeline = () => {
    let prevNodes = nodes;

    let selectedIndex = -1;
    let nodeIndex = -1;

    const id = selectedSource.name;

    if (nodeType === "pipeline") {
      let prevPipelines = [...addedPipelines];

      prevPipelines.forEach((pipeline, index) => {
        if (pipeline.name === id) {
          selectedIndex = index;
        }
      });

      prevPipelines.splice(selectedIndex, 1);

      setPipelines((prevList) => [...prevPipelines]);
    } else {
      let prevEnrichments = enrichments;
      prevEnrichments.forEach((enrichment, index) => {
        if (enrichment.name === id) {
          selectedIndex = index;
        }
      });

      prevEnrichments.splice(selectedIndex, 1);

      setEnrichments((prevList) => [...prevEnrichments]);
    }

    nodes.forEach((node, index) => {
      if (node.id === id) {
        nodeIndex = index;
      }
    });

    prevNodes.splice(nodeIndex, 1);

    let changes = [];

    if (edges.length !== 0) {
      edges.forEach((edge) => {
        if (edge.source === id || edge.target === id) {
          const removeEdge = {
            id: edge.id,
            type: "remove",
          };

          changes.push(removeEdge);
        }
      });

      if (changes.length !== 0) {
        setEdges((eds) => applyEdgeChanges(changes, eds));
      }
    }

    setNodes((prevList) => [...prevNodes]);
    setShowEditPipeline(false);
  };

  const onDeployConfig = () => {
    const config64code = btoa(configYaml);

    console.log("yaml", configYaml);

    deploySavedConfig({
      variables: {
        input: {
          orgcode: orgCode,
          devicecode: deviceCode,
          configdata: config64code,
        },
      },
      onCompleted: (response) => {
        if (response.deployConfig.resposestatus === "true") {
          toast(response.deployConfig.message, {
            position: "top-right",
            zIndex: 9999,
            theme: "success",
          });
        } else {
          toast(response.deployConfig.message, {
            position: "top-right",
            zIndex: 9999,
            theme: "failure",
          });
        }
      },
      onError: (error) => {
        console.log("error", error);
        toast("Something went wrong", {
          position: "top-right",
          zIndex: 9999,
          theme: "failure",
        });
      },
    });
  };

  useEffect(() => {
    if (!configExists) {
      getConfig();
    }
  }, [configExists]);

  useEffect(() => {
    handleEdgeChange();
  }, [edges]);

  return (
    <>
      <RoutingNavbar />

      <div className="main-page-div">
        <Row className="justify-content-md-center" style={{ margin: "0 8px" }}>
          <Col xl={12} lg={12} md={12} sm={12}>
            {configExists && (
              <Button
                variant="primary"
                size="sm"
                onClick={onDeployConfig}
                style={{
                  float: "right",
                  marginBottom: "12px",
                  marginLeft: "8px",
                }}
              >
                Deploy Configuration
              </Button>
            )}

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
                onEdgesChange={onEdgesUpdate}
                onConnect={onConnect}
                fitView
                maxZoom={1.3}
                minZoom={1.3}
                deleteKeyCode={enableDelete ? ["Backspace", "Delete"] : null}
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
            selectedPipeline={selectedNode}
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

        {showEditPipeline && (
          <Modal show={showEditPipeline} onHide={handleClose}>
            <Modal.Body style={{ textAlign: "center" }}>
              <Button variant="primary" onClick={onDeletePipeline} size="sm">
                Delete
              </Button>
            </Modal.Body>
          </Modal>
        )}
      </div>
    </>
  );
};

export default Routing;
