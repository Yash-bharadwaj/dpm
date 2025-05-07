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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { nodeTypes, customEdgeStyle, selectedEdgeStyle } from './NodeTypes';
import { colors, shadows, borders, spacing } from '../../theme/theme';
import Button from '../common/Button';

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
  const flowRef = useRef<HTMLDivElement>(null);

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
    // Only trigger fit view when nodes are added or removed, not on position changes
    const nodeCount = initialNodes.length;
    if (nodeCount !== nodes.length && flowRef.current) {
      // There's a need to access the flow instance, which would require a ref
      // This is a simplified approach without direct access to the fit view method
      setTimeout(() => {
        // Trigger fit view with some delay to ensure rendering is complete
        if (flowRef.current) {
          // We would typically call fitView() on the instance here
        }
      }, 100);
    }
  }, [initialNodes.length, nodes.length]);

  // Custom edge options
  const edgeOptions = {
    style: customEdgeStyle,
    type: 'smoothstep',
    animated: false,
  };

  // Manage zoom levels
  const handleZoomIn = () => {
    setZoom(z => Math.min(z + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom(z => Math.max(z - 0.2, 0.5));
  };

  const handleZoomReset = () => {
    setZoom(1);
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
          minZoom={0.5}
          maxZoom={2}
          defaultZoom={zoom}
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
              }}
            />
          )}
          
          {showControls && (
            <Controls
              style={{
                backgroundColor: colors.background.paper,
                border: borders.standard,
                borderRadius: borders.radiusSm,
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
          }}>
            <Button 
              size="sm"
              variant="outline"
              onClick={handleZoomIn}
            >
              +
            </Button>
            <Button 
              size="sm"
              variant="outline"
              onClick={handleZoomReset}
            >
              Reset
            </Button>
            <Button 
              size="sm"
              variant="outline"
              onClick={handleZoomOut}
            >
              -
            </Button>
          </Panel>
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default PipelineFlow;
