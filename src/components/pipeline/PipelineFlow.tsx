import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  NodeChange,
  EdgeChange,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { nodeTypes, customEdgeStyle, selectedEdgeStyle } from './NodeTypes';
import { colors, shadows, borders, spacing } from '../../theme/theme';
import Button from '../common/Button';
import { FaPlus, FaMinus, FaCompress, FaExpand, FaInfoCircle } from 'react-icons/fa';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Badge from '../common/Badge';

interface PipelineFlowProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (changes: NodeChange[]) => void;
  onEdgesChange?: (changes: EdgeChange[]) => void;
  onConnect?: (connection: Connection) => void;
  onNodeSelect?: (node: Node | null) => void;
  readOnly?: boolean;
  showControls?: boolean;
  showMiniMap?: boolean;
  className?: string;
}

const PipelineFlow: React.FC<PipelineFlowProps> = ({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeSelect,
  readOnly = false,
  showControls = true,
  showMiniMap = true,
  className = '',
}) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showStats, setShowStats] = useState(false);
  const flowRef = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();

  // Update nodes and edges when initialNodes or initialEdges change
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Handle nodes change
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChangeInternal(changes);
      // If external handler is provided, call it
      if (onNodesChange) {
        onNodesChange(changes);
      }
    },
    [onNodesChange, onNodesChangeInternal]
  );

  // Handle edges change
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChangeInternal(changes);
      // If external handler is provided, call it
      if (onEdgesChange) {
        onEdgesChange(changes);
      }
    },
    [onEdgesChange, onEdgesChangeInternal]
  );

  // Handle connection between nodes
  const handleConnect = useCallback(
    (params: Connection) => {
      if (onConnect) {
        onConnect(params);
      }
    },
    [onConnect]
  );

  // Handle node selection
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(prevSelectedNode => prevSelectedNode?.id === node.id ? null : node);
      setSelectedEdge(null);
      if (onNodeSelect) {
        onNodeSelect(prevSelectedNode => prevSelectedNode?.id === node.id ? null : node);
      }
    },
    [onNodeSelect]
  );

  // Handle edge selection
  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(prevSelectedEdge => prevSelectedEdge?.id === edge.id ? null : edge);
      setSelectedNode(null);
    },
    []
  );

  // Handle pane click (background click)
  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    if (onNodeSelect) {
      onNodeSelect(null);
    }
  }, [onNodeSelect]);

  // Update edge styles when selection changes
  useEffect(() => {
    setEdges(currentEdges => 
      currentEdges.map(edge => ({
        ...edge,
        style: edge.id === selectedEdge?.id ? selectedEdgeStyle : customEdgeStyle,
        animated: edge.id === selectedEdge?.id,
      }))
    );
  }, [selectedEdge, setEdges]);

  // Fit view when nodes change significantly
  useEffect(() => {
    const nodeCount = initialNodes.length;
    if (nodeCount !== nodes.length && flowRef.current) {
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: 0.2 });
        }
      }, 100);
    }
  }, [initialNodes.length, nodes.length, reactFlowInstance]);

  // Custom edge options
  const edgeOptions = {
    style: customEdgeStyle,
    type: 'smoothstep',
    animated: false,
  };

  // Manage zoom levels
  const handleZoomIn = useCallback(() => {
    if (reactFlowInstance) {
      const { x, y, zoom } = reactFlowInstance.getViewport();
      reactFlowInstance.setViewport({ x, y, zoom: zoom * 1.2 });
      setZoom(zoom * 1.2);
    }
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    if (reactFlowInstance) {
      const { x, y, zoom } = reactFlowInstance.getViewport();
      reactFlowInstance.setViewport({ x, y, zoom: zoom / 1.2 });
      setZoom(zoom / 1.2);
    }
  }, [reactFlowInstance]);

  const handleZoomReset = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2 });
      setZoom(1);
    }
  }, [reactFlowInstance]);

  const toggleStats = useCallback(() => {
    setShowStats(prev => !prev);
  }, []);

  // Count nodes by type
  const nodeStats = {
    source: nodes.filter(node => node.type === 'source').length,
    destination: nodes.filter(node => node.type === 'destination').length,
    transform: nodes.filter(node => node.type === 'transform').length,
    function: nodes.filter(node => node.type === 'function').length,
    total: nodes.length,
    connections: edges.length,
  };

  return (
    <div className={`pipeline-flow ${className}`} ref={flowRef} style={{ width: '100%', height: '100%' }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onPaneClick={handlePaneClick}
          defaultEdgeOptions={edgeOptions}
          nodesConnectable={!readOnly}
          nodesDraggable={!readOnly}
          zoomOnScroll={true}
          zoomOnPinch={true}
          panOnScroll={true}
          panOnDrag={!readOnly}
          selectNodesOnDrag={false}
          fitView
          minZoom={0.2}
          maxZoom={4}
          defaultZoom={zoom}
          className="animated-flow"
          proOptions={{ hideAttribution: true }}
        >
          <Background 
            color={colors.neutral.darkGray} 
            gap={16} 
            size={1} 
            variant="dots" 
          />
           
          {showMiniMap && (
            <MiniMap
              nodeStrokeColor={(n) => {
                if (n.id === selectedNode?.id) return colors.primary.main;
                return colors.neutral.darkGray;
              }}
              nodeColor={(n) => {
                if (n.type === 'source') return colors.pipeline.source;
                if (n.type === 'destination') return colors.pipeline.destination;
                if (n.type === 'transform') return colors.pipeline.transform;
                if (n.type === 'function') return colors.pipeline.function;
                return colors.neutral.gray;
              }}
              maskColor={`${colors.neutral.white}50`}
              style={{
                backgroundColor: colors.background.paper,
                border: borders.standard,
                borderRadius: borders.radiusSm,
                boxShadow: shadows.sm,
              }}
            />
          )}
           
          {showControls && (
            <Controls
              style={{
                backgroundColor: colors.background.paper,
                border: borders.standard,
                borderRadius: borders.radiusSm,
                boxShadow: shadows.sm,
              }}
            />
          )}
           
          <Panel position="top-right" style={{ 
            display: 'flex', 
            gap: '8px', 
            backgroundColor: colors.background.paper, 
            padding: '8px', 
            borderRadius: borders.radiusSm, 
            boxShadow: shadows.sm, 
            border: borders.standard,
            animation: 'fadeIn 0.3s ease',
          }}>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleZoomIn}
              title="Zoom in"
            >
              <FaPlus />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleZoomReset}
              title="Reset view"
            >
              <FaCompress />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleZoomOut}
              title="Zoom out"
            >
              <FaMinus />
            </Button>
            <Button 
              size="sm" 
              variant={showStats ? "primary" : "outline"} 
              onClick={toggleStats}
              title="Toggle statistics"
            >
              <FaInfoCircle />
            </Button>
          </Panel>

          {showStats && (
            <Panel position="bottom-left" style={{ 
              backgroundColor: colors.background.paper, 
              padding: '12px', 
              borderRadius: borders.radiusSm, 
              boxShadow: shadows.sm, 
              border: borders.standard,
              animation: 'slideUp 0.3s ease',
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Pipeline Statistics</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <Badge variant="primary" size="sm">
                  Sources: {nodeStats.source}
                </Badge>
                <Badge variant="success" size="sm">
                  Destinations: {nodeStats.destination}
                </Badge>
                <Badge variant="info" size="sm">
                  Transforms: {nodeStats.transform}
                </Badge>
                <Badge variant="warning" size="sm">
                  Functions: {nodeStats.function}
                </Badge>
                <Badge variant="secondary" size="sm">
                  Total Nodes: {nodeStats.total}
                </Badge>
                <Badge variant="dark" size="sm">
                  Connections: {nodeStats.connections}
                </Badge>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default PipelineFlow;