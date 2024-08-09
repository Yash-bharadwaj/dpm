/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Badge,
  Button,
  Col,
  Form,
  Modal,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";

import RoutingNavbar from "../components/RoutingNavbar";
import { useCallback, useEffect, useRef, useState } from "react";
import SourceDrawer from "./AddNewRouting.tsx/SourceDrawer";
import DestinationDrawer from "./AddNewRouting.tsx/DestinationDrawer";

import {
  SAVE_CONFIG,
  GET_CONFIG,
  DEPLOY_CONFIG,
  GET_CONFIG_TIMELINE_BY_VERSION,
  GET_CONFIG_VALID_VERSIONS,
  GET_OLDER_CONFIG_DETAILS,
} from "../query/query";

import ReactFlow, {
  Controls,
  Position,
  addEdge,
  applyEdgeChanges,
  getIncomers,
  getOutgoers,
  isEdge,
  isNode,
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
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";

import jsyaml from "js-yaml";
import { getSourceFromID, getVersionId } from "./AddNewRouting.tsx/helper";

import { useParams } from "react-router-dom";
import ContextMenu from "../components/ContextMenu";
import DataLoading from "../components/DataLoading";

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
  const [confirmDeploy, setConfirmDeploy] = useState(false);
  const [nodeType, setNodeType] = useState("");
  const [configYaml, setConfigYaml] = useState("");
  const [showMenu, setShowMenu] = useState(null);
  const [configUpdated, setConfigUpdated] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("");

  const [nodes, setNodes, onNodesChange] = useNodesState([]);

  const ref = useRef(null);

  const getCurrentTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };

  const handleClose = () => {
    setShowSource(false);
    setShowDestination(false);
    setShowPipelines(false);
    setShowEnrichments(false);
    setSelectedSource({});
    setSelectedNode({});
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
      //   setShowEditPipeline(true);
    } else if (type === "enrichment") {
      //   setShowEditPipeline(true);
    }
  };

  //get config timeline data
  const [getConfigTimelineData, ,] = useLazyQuery(
    GET_CONFIG_TIMELINE_BY_VERSION,
    {
      onCompleted: (response) => {
        console.log("response", response);

        if (response?.getConfig?.responsestatus) {
          const savedConfig = atob(response.getConfig.responsedata);

          getConfigTimelineData({
            variables: {
              input: {
                orgcode: orgCode,
                devicecode: deviceCode,
                versionid: response.getConfig.versionid,
                timezone: getCurrentTimezone(),
              },
            },
          });

          if (savedConfig && configYaml === "") {
            getConfigDetails(savedConfig);
          }
        }
      },
    }
  );

  const [
    getOlderConfigDetails,
    { loading: oldVersionLoading, data: oldVersionData },
  ] = useLazyQuery(GET_OLDER_CONFIG_DETAILS, {
    onCompleted: (response) => {
      console.log("response", response);
    },
    fetchPolicy: "no-cache",
  });

  const getConfigDetails = (savedConfig: any) => {
    const sample = jsyaml.load(savedConfig);

    console.log("sample", sample);

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

          let originalSource = getSourceFromID(
            sources[source].uuid,
            "source",
            sources[source]
          );

          let currentOrigin = { ...originalSource };

          currentOrigin.id = sourceId;

          const yPosition = 10 + index * 40;

          const currentSource = {
            id: sourceId,
            sourcePosition: Position.Right,
            type: "input",
            position: { x: 0, y: yPosition },
            height: 35,
            width: 150,
            data: {
              label: sourceId,
              nodeData: sources[source],
              type: "source",
            },
            style: {
              backgroundColor: "#EBF8FF",
            },
          };

          existingNodes.push(currentSource);
          initialAddedSources.push(currentOrigin);

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

            const yPosition = 10 + index * 40;

            const currentPipeline = {
              id: pipelineId,
              sourcePosition: "right",
              targetPosition: "left",
              type: "default",
              height: 35,
              width: 150,
              position: { x: 250, y: yPosition },
              data: {
                label: pipelineId,
                nodeData: pipelines[pipeline],
                type: "pipeline",
              },
              style: {
                backgroundColor: "#E6FFFA",
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

            const yPosition = 10 + index * 40;

            const currentEnrichment = {
              id: enrichmentId,
              sourcePosition: "right",
              targetPosition: "left",
              type: "default",
              height: 35,
              width: 150,
              position: { x: 250 * 2, y: yPosition },
              data: {
                label: enrichmentId,
                nodeData: enrichments[enrichment],
                type: "enrichment",
              },
              style: {
                backgroundColor: "#F0FFF4",
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

          let currentOrigin = { ...originalSource };

          currentOrigin.id = destinationId;

          const yPosition = 10 + index * 40;

          const currentDestination = {
            id: destinationId,
            targetPosition: Position.Left,
            type: "output",
            height: 35,
            width: 150,
            position: { x: 250 * 3, y: yPosition },
            data: {
              label: destinationId,
              nodeData: destinations[destination],
              type: "destination",
            },
            style: {
              backgroundColor: "#FFFAF0",
            },
          };

          existingNodes.push(currentDestination);
          initialAddedDestinations.push(currentOrigin);
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
    setConfigUpdated(false);
  };

  // get config code here
  const { loading, data, refetch } = useQuery(GET_CONFIG, {
    variables: {
      input: {
        orgcode: orgCode,
        devicecode: deviceCode,
        timezone: getCurrentTimezone(),
        versionid: "",
      },
    },
    onCompleted: (response) => {
      if (response.getConfig.responsestatus) {
        const savedConfig = atob(response.getConfig.responsedata);

        getConfigTimelineData({
          variables: {
            input: {
              orgcode: orgCode,
              devicecode: deviceCode,
              versionid: response.getConfig.versionid,
              timezone: getCurrentTimezone(),
            },
          },
        });

        if (savedConfig && configYaml === "") {
          getConfigDetails(savedConfig);
        }
      }
    },
    onError: (error) => {
      console.log("error", error?.networkError);
      if (error?.networkError) {
        if (error?.message === "Failed to fetch") {
          //   window.location.reload();
        }
      }
    },
  });

  //get config versions
  const { data: versionsData } = useQuery(GET_CONFIG_VALID_VERSIONS, {
    variables: {
      input: {
        orgcode: orgCode,
        devicecode: deviceCode,
        timezone: getCurrentTimezone(),
      },
    },
    onCompleted: (response) => {
      console.log("response", response);
    },
  });

  // save config code here
  const [saveConfigMutation, { loading: saveLoading }] =
    useMutation(SAVE_CONFIG);

  const [deploySavedConfig, { loading: deployLoading }] =
    useMutation(DEPLOY_CONFIG);
  // save config ends here

  const onAddSource = (source: object, sourceValues: object) => {
    const nodeData = { ...sourceValues };
    let sourceData = { ...source };

    sourceData.id = nodeData.name;

    const nodeCount = addedSources.length + 1;

    const yPosition = 10 + nodeCount * 40;
    const xPosition = 0;

    const newNode = {
      id: sourceValues.name,
      data: { label: sourceValues.name, type: "source", nodeData },
      type: "input",
      sourcePosition: Position.Right,
      position: { x: xPosition, y: yPosition },
      style: {
        backgroundColor: "#EBF8FF",
      },
    };

    addNode(newNode);

    handleClose();

    setAddedSources((prevList) => {
      return [...prevList, sourceData];
    });
  };

  const onAddDestination = (destination: object, destinationValues: object) => {
    const nodeData = { ...destinationValues };

    const nodeCount = addedDestinations.length + 1;

    const yPosition = 10 + nodeCount * 40;
    const xPosition = 250 * 3;

    let destData = { ...destination };
    destData.id = nodeData?.name;

    const newNode = {
      id: destinationValues.name,
      data: { label: destinationValues.name, type: "destination", nodeData },
      targetPosition: Position.Left,
      position: { x: xPosition, y: yPosition },
      type: "output",
      style: {
        backgroundColor: "#FFFAF0",
      },
    };

    addNode(newNode);

    handleClose();
    setAddedDestinations((prevList) => [...prevList, destData]);
  };

  const onEdgesUpdate = useCallback((changes: any) => {
    if (changes[0]?.selected) {
      setEnableDelete(true);
    } else {
      setEnableDelete(false);
    }
    setEdges((eds) => applyEdgeChanges(changes, eds));
    setConfigUpdated(true);
  }, []);

  const onConnect = useCallback(
    (params: any) => {
      console.log("params", params);
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

        console.log("source index", sourceIndex);

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

          console.log("prev nodes", prevNodes[sourceIndex]);

          const destType =
            targetType === "pipeline"
              ? "pipelines"
              : targetType === "enrichment"
              ? "enrichments"
              : "destinations";

          console.log("dest type", destType);

          const currentDestIndex = prevNodes[sourceIndex][destType].indexOf(
            params.target
          );

          console.log("currentDestIndex", currentDestIndex);

          if (targetType === "pipeline" || targetType === "enrichment") {
            let nodeCheck = "";
            let connectionPresent = false;
            if (edges.length !== 0) {
              edges.forEach((edge: any) => {
                if (edge.source === params.target) {
                  console.log("edge", edge);
                  const targetSplit = edge.target.split("_");
                  console.log("targetSplit", targetSplit);
                  const currentTargetType =
                    targetSplit[0] === "enrich"
                      ? "enrichments"
                      : "destinations";

                  console.log("currentTargetType", currentTargetType);

                  const currentTargetIndex = prevNodes[sourceIndex][
                    currentTargetType
                  ].indexOf(edge.target);

                  if (currentTargetIndex !== -1) {
                    // if (currentTargetType === "destinations") {
                    //   connectionPresent = true;
                    //   console.log("edge", edge);
                    // } else {
                    nodeCheck = edge.target;
                    // }
                  }
                }
              });
            }

            if (currentDestIndex === -1 && destType === "pipelines") {
              destPresent = false;
            } else {
              if (connectionPresent) {
                console.log("dest present");
                destPresent = true;
              } else {
                if (nodeCheck !== "") {
                  console.log("node check", nodeCheck);

                  let nodeConnectionCheck = false;

                  edges.map((edge: any) => {
                    if (edge.target === nodeCheck) {
                      console.log("source connect present", edge);

                      if (edge.source === params.target) {
                        console.log("match", edge);
                        nodeConnectionCheck = true;
                      } else {
                        console.log("dest not same", edge);
                      }
                    } else {
                      if (edge.target === nodeCheck) {
                        if (edge.source === params.source) {
                          nodeConnectionCheck = true;
                        }
                      }
                    }
                  });

                  if (nodeConnectionCheck) {
                    console.log("dest present");
                    destPresent = true;
                  } else {
                    destPresent = false;
                  }
                } else {
                  if (targetType === "pipeline") {
                    destPresent = false;
                    prevNodes[sourceIndex].pipelines.push(params.target);
                  } else {
                    destPresent = false;
                    prevNodes[sourceIndex].enrichments.push(params.target);
                  }
                }
              }
            }
          }

          if (targetType === "destination") {
            if (currentDestIndex !== -1) {
              console.log("dest present");
              destPresent = true;
            } else {
              prevNodes[sourceIndex].destinations.push(params.target);
            }

            setCurrentSource(params.source);
          }
        }
      } else {
        if (sourceType === "pipeline" || sourceType === "enrichment") {
          console.log("source - pipeline/enrichment");
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

              console.log("node", node);

              console.log("edge source index", edgeSourceIndex);
              console.log("edge target index", edgeTargetIndex);

              if (targetType !== "destination") {
                console.log("node", node);
                console.log("params", params);

                if (edgeTargetIndex !== -1 && edgeSourceIndex !== -1) {
                  let connectionPresent = false;
                  let checkNode = "";
                  if (edges.length !== 0) {
                    // let connectionPresent = false;
                    edges.forEach((connect: any) => {
                      if (connect.source === params.target) {
                        const targetNode = connect.target;
                        console.log("targetNode", targetNode);
                        let targetType = "";

                        nodes.forEach((node) => {
                          if (targetNode === node.id) {
                            targetType = node.data.type;
                          }
                        });

                        const destType =
                          targetType === "pipeline"
                            ? "pipelines"
                            : targetType === "enrichment"
                            ? "enrichments"
                            : "destinations";

                        if (
                          node[destType].indexOf(targetNode) !== -1 &&
                          edgeSourceIndex !== -1
                        ) {
                          console.log("connection present");
                          if (
                            destType === "destinations" &&
                            type === "pipelines"
                          ) {
                            checkNode = targetNode;
                          } else {
                            connectionPresent = true;
                          }
                        } else {
                          console.log("not present");
                        }
                      }
                    });

                    if (connectionPresent) {
                      console.log("dest present");
                      destPresent = true;
                    } else {
                      console.log("add edge", checkNode);

                      if (checkNode !== "") {
                        if (node[destType].indexOf(checkNode) === -1) {
                          node[destType].push(params.target);
                          destPresent = false;
                        }
                      }
                    }
                  }

                  console.log("connection present", connectionPresent);

                  if (connectionPresent) {
                    console.log("dest present");
                    destPresent = true;
                  } else {
                    destPresent = false;
                    // console.log("no connection pressent", checkNode);
                    // if (checkNode !== "") {
                    //   let nodeConnectionCheck = false;

                    //   edges.map((edge: any) => {
                    //     if (edge.source === checkNode) {
                    //       console.log("source connect present", edge);

                    //       if (edge.target === params.target) {
                    //         nodeConnectionCheck = true;
                    //       } else {
                    //         console.log("dest not same");
                    //       }
                    //     } else {
                    //       if (edge.target === checkNode) {
                    //         if (edge.source === params.source) {
                    //           nodeConnectionCheck = true;
                    //         }
                    //       }
                    //     }
                    //   });

                    //   if (nodeConnectionCheck) {
                    //     destPresent = true;
                    //   } else {
                    //     destPresent = false;
                    //   }
                    // } else {
                    //   destPresent = false;
                    // }
                  }
                } else {
                  if (edgeTargetIndex === -1) {
                    if (edges.length !== 0) {
                      let connectionPresent = false;
                      edges.forEach((connect: any) => {
                        if (connect.source === params.target) {
                          const targetNode = connect.target;
                          let targetType = "";

                          console.log("target", targetNode);

                          nodes.forEach((node) => {
                            if (targetNode === node.id) {
                              targetType = node.data.type;
                            }
                          });

                          const destType =
                            targetType === "pipeline"
                              ? "pipelines"
                              : targetType === "enrichment"
                              ? "enrichments"
                              : "destinations";

                          console.log("destType", destType);

                          if (node[destType].indexOf(targetNode) !== -1) {
                            if (
                              destType === "destinations" ||
                              edgeSourceIndex !== -1
                            ) {
                              console.log("connection present");
                              connectionPresent = true;
                            }
                          } else {
                            console.log("connection not present");
                          }
                        }
                      });

                      if (connectionPresent) {
                        console.log("dest present");
                        destPresent = true;
                      } else {
                        console.log("add edge", params);
                        if (edgeSourceIndex !== -1) {
                          node[destType].push(params.target);
                          destPresent = false;
                        } else {
                          //   destPresent = true;
                        }
                      }
                    }
                  }

                  if (edgeSourceIndex === -1) {
                    console.log("edge source not present");
                    // destPresent = true;
                    // node[type].push(params.source);
                  }
                }
              } else {
                if (edgeSourceIndex !== -1) {
                  const destIndex = node.destinations.indexOf(params.target);

                  if (destIndex !== -1) {
                    let connectionPresent = false;
                    let checkNode = "";
                    console.log("params", params);
                    if (edges.length !== 0) {
                      edges.map((edge: any) => {
                        console.log("edge check", edge);
                        if (edge.source === params.source) {
                          console.log("source connect present", edge);

                          if (edge.target === params.target) {
                            connectionPresent = true;
                          } else {
                            checkNode = edge.target;
                            console.log("dest not same");
                          }
                        }
                      });
                    }

                    if (connectionPresent) {
                      console.log("dest present");
                      destPresent = true;
                    } else {
                      if (checkNode !== "") {
                        let nodeConnectionCheck = false;

                        edges.map((edge: any) => {
                          if (edge.source === checkNode) {
                            console.log("source connect present", edge);

                            if (edge.target === params.target) {
                              nodeConnectionCheck = true;
                            } else {
                              console.log("dest not same");
                            }
                          }
                        });

                        if (nodeConnectionCheck) {
                          console.log("dest present");
                          destPresent = true;
                        } else {
                          destPresent = false;
                        }
                      } else {
                        const sourceDestConnectCheck = sourceCheck(
                          node.source,
                          params.target
                        );
                        console.log(
                          "sourceDestConnectCheck",
                          sourceDestConnectCheck
                        );

                        if (sourceDestConnectCheck) {
                          destPresent = true;
                        } else {
                          destPresent = false;
                        }
                      }
                    }
                  } else {
                    node.destinations.push(params.target);
                    destPresent = false;
                  }
                } else {
                  //node[type].push(params.source);
                }
              }
            });

            console.log("prevNodes", prevNodes);

            setConnectedNodes((prevList) => [...prevNodes]);
          } else {
            sourcePresent = false;
          }
        }
      }

      console.log("destPresent", destPresent);

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
        setConfigUpdated(true);
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
    const nodeCount = addedPipelines.length + 1;

    const yPosition = 10 + nodeCount * 40;
    const xPosition = 250 * 1;

    const nodeData = { ...pipeline };

    const pipelineData = { ...pipeline };

    const newNode = {
      id: pipeline.name,
      data: {
        label: pipeline.name,
        type: "pipeline",
        nodeData,
      },
      position: { x: xPosition, y: yPosition },
      type: "default",
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: {
        backgroundColor: "#E6FFFA",
      },
    };

    addNode(newNode);

    setPipelines((prevList) => [...prevList, pipelineData]);

    handleClose();
  };

  const onAddEnrichment = (enrichment: object) => {
    const nodeCount = enrichments.length + 1;

    const yPosition = 10 + nodeCount * 40;
    const xPosition = 250 * 2;

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
      position: { x: xPosition, y: yPosition },
      type: "default",
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: {
        backgroundColor: "#F0FFF4",
      },
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

            if (response.data.saveConfig.responsestatus) {
              toast("Config saved successfully!", {
                position: "top-right",
                zIndex: 9999,
                theme: "success",
              });

              refetch();
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
      setConfigUpdated(true);
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
      setConfigUpdated(true);
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
      setConfigUpdated(true);
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
      setConfigUpdated(true);
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
      console.log("edge", edge);
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

          console.log("prevConnection", prevConnection);

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

                  console.log(
                    "sourceConnectionPresent",
                    sourceConnectionPresent
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
                          destType === "enrichments"
                            ? [edge.target]
                            : type === "enrichments"
                            ? [edge.source]
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
                            destType === "enrichments"
                              ? [edge.target]
                              : type === "enrichments"
                              ? [edge.source]
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
                          destType === "enrichments"
                            ? [edge.target]
                            : type === "enrichments"
                            ? [edge.source]
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
                  console.log("destIndex", destIndex);

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

                      console.log("currentSourceIndex", currentSourceIndex);

                      if (currentSourceIndex !== -1) {
                        if (edgeTargetIndex === -1) {
                          newEdges[index][destType].push(edge.target);
                        } else {
                          //add target
                          if (destIndex !== -1) {
                            newEdges[index][destType].push(edge.target);
                          }
                        }
                      }
                    } else {
                      //check if source is connected before
                      const sourceConnectionPresent = sourceCheck(
                        node.source,
                        edge.source
                      );

                      //create new only if node source is connected to edge source
                      if (sourceConnectionPresent) {
                        console.log(
                          "sourceConnectionPresent",
                          sourceConnectionPresent
                        );
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
                      console.log("newEdge", newEdges[index]);
                      if (newEdges[index]) {
                        const currentSourceIndex = newEdges[index][
                          type
                        ].indexOf(edge.source);

                        console.log("currentSourceIndex", currentSourceIndex);

                        if (currentSourceIndex !== -1) {
                          if (edgeTargetIndex === -1) {
                            newEdges[index][destType].push(edge.target);
                          }
                        } else {
                          console.log("present in old connection", node);
                          if (edgeSourceIndex !== -1) {
                            console.log("present in old connection", node);
                            let nodeCheck = "";
                            if (edges.length !== 0) {
                              edges.forEach((connect) => {
                                if (connect.target === edge.source) {
                                  nodeCheck = edge.target;
                                }
                              });
                            }

                            console.log("node check", nodeCheck);

                            if (nodeCheck !== "") {
                              let nodeType = "";
                              nodes.forEach((node) => {
                                if (nodeCheck === node.id) {
                                  nodeType = node.data.type;
                                }
                              });

                              if (nodeType !== "source") {
                                const targetType =
                                  nodeType === "enrichment"
                                    ? "enrichments"
                                    : nodeType === "pipeline"
                                    ? "pipelines"
                                    : "destinations";

                                if (newEdges[index] && newEdges[index]) {
                                  console.log(
                                    "targetType",
                                    newEdges[index][targetType]
                                  );

                                  const targetIndex =
                                    newEdges[index][targetType].indexOf(
                                      nodeCheck
                                    );

                                  if (targetIndex === -1) {
                                    newEdges[index][targetType].push(
                                      edge.target
                                    );
                                  }
                                }
                              }
                            }
                          }
                        }
                      } else {
                        console.log("no new edge", edge);
                        console.log("node", node);

                        const currentSourceIndex = node[type].indexOf(
                          edge.source
                        );

                        console.log("currentSourceIndex", currentSourceIndex);

                        //create new only if node source is connected to edge source
                        if (currentSourceIndex !== -1) {
                          const newConnection = {
                            source: node.source,
                            pipelines:
                              type === "pipelines" ? [edge.source] : [],
                            enrichments:
                              destType === "enrichments"
                                ? [edge.target]
                                : type === "enrichments"
                                ? [edge.source]
                                : [],
                            destinations:
                              destType === "destinations" ? [edge.target] : [],
                          };

                          newEdges.push(newConnection);
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
                      if (currentDestIndex === -1) {
                        newEdges[index][destType].push(edge.target);
                      }
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
                          destType === "enrichments"
                            ? [edge.target]
                            : type === "enrichments"
                            ? [edge.source]
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
          } else {
            console.log("edge", edge);
            console.log("new edges", newEdges);

            if (newEdges.length !== 0) {
              const type =
                sourceType === "pipeline" ? "pipelines" : "enrichments";

              const destType =
                targetType === "enrichment" ? "enrichments" : "destinations";

              let edgeSourceIndex = -1;
              let edgeTargetIndex = -1;

              newEdges.forEach((connect: any) => {
                console.log("connect", connect);
                console.log("edge", edge);

                edgeSourceIndex = connect[type].indexOf(edge.source);
                edgeTargetIndex = connect[destType].indexOf(edge.target);

                if (edgeSourceIndex !== -1) {
                  if (edgeTargetIndex === -1) {
                    connect[destType].push(edge.target);
                  }
                }
              });
            }
          }
        }
      }
    });

    console.log("new connections", newEdges);

    setConnectedNodes((prevList) => [...newEdges]);
  };

  const onDeployConfig = () => {
    setConfirmDeploy(true);
  };

  const onConfirmDeploy = () => {
    const config64code = btoa(configYaml);

    console.log("yaml", configYaml);

    setConfirmDeploy(false);

    deploySavedConfig({
      variables: {
        input: {
          orgcode: orgCode,
          devicecode: deviceCode,
          configdata: config64code,
          versionid: data?.getConfig?.versionid,
          comment: comment,
        },
      },
      onCompleted: (response) => {
        setComment("");
        if (response.deployConfig.responsestatus) {
          toast(response.deployConfig.message, {
            position: "top-right",
            zIndex: 9999,
            theme: "success",
          });

          refetch();
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

  const onNodeContextMenu = useCallback(
    (event: any, node: any) => {
      // Prevent native context menu from showing
      event.preventDefault();

      if (node.data.type === "pipeline" || node.data.type === "enrichment") {
        // Calculate position of the context menu. We want to make sure it
        // doesn't get positioned off-screen.
        const pane = ref.current.getBoundingClientRect();

        const top =
          event.clientY < pane.height - 200
            ? event.clientY - 200
            : event.clientY - 200;

        setShowMenu({
          id: node.id,
          top: top,
          left: event.clientX - 100,
          right:
            event.clientX >= pane.width - 200 && pane.width - event.clientX,
          // bottom:
          //   event.clientY >= pane.height - 200 && pane.height - event.clientY,
        });
      }
    },
    [setShowMenu]
  );

  const onPaneClick = useCallback(() => setShowMenu(null), [setShowMenu]);

  const getLastModifiedDate = (configData: any) => {
    const currentStatus = configData.configstatus;
    let timestamp = "";

    configData.configtags.forEach((tag: any) => {
      if (tag.tagkey === "timestamp_" + currentStatus) {
        timestamp = tag.tagvalue;
      }
    });

    return timestamp;
  };

  const getAllIncomers = (node: any) => {
    return getIncomers(node, nodes, edges).reduce(
      (memo, incomer) => [...memo, incomer, ...getAllIncomers(incomer, nodes)],
      []
    );
  };

  const getAllOutgoers = (node: any) => {
    return getOutgoers(node, nodes, edges).reduce(
      (memo, outgoer) => [...memo, outgoer, ...getAllOutgoers(outgoer, nodes)],
      []
    );
  };

  const highlightPath = (node: any, selection: boolean) => {
    const allIncomers = getAllIncomers(node);
    const allOutgoers = getAllOutgoers(node);

    setNodes((prevElements) => {
      return prevElements?.map((elem) => {
        const incomerIds = allIncomers.map((i) => i.id);
        const outgoerIds = allOutgoers.map((o) => o.id);

        if (
          isNode(elem) &&
          (allOutgoers.length > 0 || allIncomers.length > 0)
        ) {
          const highlight =
            elem.id === node.id ||
            incomerIds.includes(elem.id) ||
            outgoerIds.includes(elem.id);

          elem.style = {
            ...elem.style,
            opacity: highlight ? 1 : 0.25,
          };
        }

        if (isEdge(elem)) {
          if (selection) {
            elem.animated = true;
          } else {
            elem.animated = true;
          }
        }

        return elem;
      });
    });
  };

  const resetNodeStyles = () => {
    setNodes((prevElements) => {
      return prevElements?.map((elem) => {
        if (isNode(elem)) {
          elem.style = {
            ...elem.style,
            opacity: 1,
          };
        } else {
          elem.animated = true;
          elem.style = {
            ...elem.style,
            stroke: "#b1b1b7",
            opacity: 1,
          };
        }

        return elem;
      });
    });
  };

  const onVersionClick = (event: any) => {
    setSelectedVersion(event.target.value);

    getOlderConfigDetails({
      variables: {
        input: {
          orgcode: orgCode,
          devicecode: deviceCode,
          timezone: getCurrentTimezone(),
          versionid: event.target.value,
        },
      },
    });
  };

  const onRevert = () => {};

  const onCancelRevert = () => {};

  useEffect(() => {
    handleEdgeChange();
  }, [edges]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("config updated", configUpdated);
      if (!configUpdated && data?.getConfig.configstatus !== "draft") {
        refetch();
      }
    }, 1000 * 60); // in milliseconds
    return () => clearInterval(intervalId);
  }, [configUpdated]);

  return (
    <>
      <RoutingNavbar />

      <div className="main-page-div">
        <Row className="justify-content-md-center" style={{ margin: "0 8px" }}>
          <Col
            xl={12}
            lg={12}
            md={12}
            sm={12}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <div>
              <div className="current-config-data">
                Version :{" "}
                <b>
                  {selectedVersion !== ""
                    ? oldVersionData?.getConfig?.versionid
                    : data?.getConfig?.versionid}
                </b>
              </div>

              <div className="current-config-data" style={{ display: "flex" }}>
                Timestamp :{" "}
                <b>
                  {" "}
                  {selectedVersion !== ""
                    ? oldVersionData?.getConfig &&
                      getLastModifiedDate(oldVersionData?.getConfig)
                    : data?.getConfig && getLastModifiedDate(data?.getConfig)}
                </b>
                <div
                  className="current-config-data"
                  style={{ marginLeft: "12px" }}
                >
                  Status :{" "}
                  <Badge bg="success">
                    {selectedVersion !== ""
                      ? oldVersionData?.getConfig?.configstatus.toUpperCase()
                      : data?.getConfig?.configstatus.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              <div className="versions-div">
                <Form.Select
                  aria-label="Select"
                  size="sm"
                  onChange={(event) => {
                    onVersionClick(event);
                  }}
                  id={"version"}
                  value={selectedVersion}
                >
                  <option value="" hidden>
                    Older Versions
                  </option>

                  {versionsData?.getConfigValidVersion.map((version: any) => (
                    <option value={version.versionid}>
                      <OverlayTrigger
                        placement="right"
                        overlay={
                          <Tooltip id={version.versionid}>
                            {version.comment || "No comment"}
                          </Tooltip>
                        }
                      >
                        <span style={{ display: "flex" }}>
                          {version.lastmodified} (
                          <p>{getVersionId(version.versionid)}</p>)
                        </span>
                      </OverlayTrigger>
                    </option>
                  ))}
                </Form.Select>
              </div>

              {selectedVersion !== "" ? (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onCancelRevert}
                    style={{
                      marginLeft: "8px",
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onRevert}
                    style={{
                      marginLeft: "8px",
                    }}
                  >
                    Revert
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onSave}
                    style={{
                      marginLeft: "8px",
                    }}
                  >
                    Save
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onDeployConfig}
                    style={{
                      marginLeft: "8px",
                    }}
                    disabled={data?.getConfig?.configstatus !== "draft"}
                  >
                    Deploy
                  </Button>
                </>
              )}
            </div>
          </Col>

          <Col xl={12} lg={12} md={12} sm={12}>
            <div className="source-dest-div">
              <div style={{ width: "23%" }}>
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

              <div style={{ width: "23%" }}>
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

              <div style={{ width: "23%" }}>
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

              <div style={{ width: "23%" }}>
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

            {(loading || saveLoading || deployLoading || oldVersionLoading) && (
              <DataLoading
                open={
                  loading || saveLoading || deployLoading || oldVersionLoading
                }
              />
            )}

            <div style={{ height: "100vh" }}>
              <ReactFlow
                ref={ref}
                nodes={nodes}
                onNodesChange={onNodesChange}
                onNodeClick={onNodeClick}
                edges={edges}
                onEdgesChange={onEdgesUpdate}
                onConnect={onConnect}
                // fitView
                maxZoom={1.3}
                minZoom={1.3}
                deleteKeyCode={enableDelete ? ["Backspace", "Delete"] : null}
                onPaneClick={onPaneClick}
                onNodeContextMenu={onNodeContextMenu}
                onNodeMouseEnter={(event, node) => highlightPath(node, true)}
                onNodeMouseLeave={() => resetNodeStyles()}
              >
                <Controls />
                {showMenu && (
                  <ContextMenu onClick={onPaneClick} {...showMenu} />
                )}
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

        {confirmDeploy && (
          <Modal show={confirmDeploy} onHide={handleClose}>
            <Modal.Header>Deploy Config</Modal.Header>
            <Modal.Body style={{ textAlign: "center" }}>
              <h6>
                Deploying a new configuration requires restarting of DPM
                service, process can take sometime
              </h6>

              <Form.Control
                placeholder={`Enter Comment`}
                aria-label={"comment"}
                aria-describedby={"comment"}
                className="mb-3 mt-3"
                size="sm"
                id={"comment"}
                onChange={(event) => {
                  setComment(event.target.value);
                }}
                value={comment}
                type={"text"}
              />

              <Button
                variant="secondary"
                onClick={() => {
                  setConfirmDeploy(false);
                }}
                size="sm"
                style={{ marginRight: "8px" }}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                onClick={() => {
                  onConfirmDeploy();
                }}
                size="sm"
                disabled={comment.trim() === ""}
              >
                Deploy
              </Button>
            </Modal.Body>
          </Modal>
        )}
      </div>
    </>
  );
};

export default Routing;
