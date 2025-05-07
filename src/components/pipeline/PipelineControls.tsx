import React, { useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { FaPlus, FaSave, FaTrash, FaUndo, FaPalette, FaCheck } from 'react-icons/fa';
import Button from '../common/Button';
import Card from '../common/Card';
import { colors } from '../../theme/theme';

interface PipelineControlsProps {
  onAddSource?: () => void;
  onAddDestination?: () => void;
  onAddTransform?: () => void;
  onAddFunction?: () => void;
  onSave?: () => void;
  onClear?: () => void;
  onAutoLayout?: () => void;
  onPublish?: () => void;
  readOnly?: boolean;
}

const PipelineControls: React.FC<PipelineControlsProps> = ({
  onAddSource,
  onAddDestination,
  onAddTransform,
  onAddFunction,
  onSave,
  onClear,
  onAutoLayout,
  onPublish,
  readOnly = false,
}) => {
  const [expanded, setExpanded] = useState(true);
  
  if (readOnly) return null;

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <Card
      title="Pipeline Controls"
      collapsible
      collapsed={!expanded}
      onCollapse={handleToggleExpand}
      className="pipeline-controls"
    >
      <div className="d-flex flex-column gap-3">
        <div>
          <strong>Add Elements</strong>
          <Row className="mt-2">
            <Col xs={6} md={3} className="mb-2">
              <Button 
                variant="outline" 
                onClick={onAddSource} 
                className="w-100 d-flex align-items-center justify-content-center"
                style={{ borderColor: colors.pipeline.source, color: colors.pipeline.source }}
              >
                <FaPlus className="me-2" /> Source
              </Button>
            </Col>
            <Col xs={6} md={3} className="mb-2">
              <Button 
                variant="outline" 
                onClick={onAddDestination} 
                className="w-100 d-flex align-items-center justify-content-center"
                style={{ borderColor: colors.pipeline.destination, color: colors.pipeline.destination }}
              >
                <FaPlus className="me-2" /> Destination
              </Button>
            </Col>
            <Col xs={6} md={3} className="mb-2">
              <Button 
                variant="outline" 
                onClick={onAddTransform} 
                className="w-100 d-flex align-items-center justify-content-center"
                style={{ borderColor: colors.pipeline.transform, color: colors.pipeline.transform }}
              >
                <FaPlus className="me-2" /> Transform
              </Button>
            </Col>
            <Col xs={6} md={3} className="mb-2">
              <Button 
                variant="outline" 
                onClick={onAddFunction} 
                className="w-100 d-flex align-items-center justify-content-center"
                style={{ borderColor: colors.pipeline.function, color: colors.pipeline.function }}
              >
                <FaPlus className="me-2" /> Function
              </Button>
            </Col>
          </Row>
        </div>

        <div>
          <strong>Pipeline Actions</strong>
          <Row className="mt-2">
            <Col xs={6} md={3} className="mb-2">
              <Button 
                variant="primary" 
                onClick={onSave} 
                className="w-100 d-flex align-items-center justify-content-center"
              >
                <FaSave className="me-2" /> Save
              </Button>
            </Col>
            <Col xs={6} md={3} className="mb-2">
              <Button 
                variant="outline"
                onClick={onAutoLayout} 
                className="w-100 d-flex align-items-center justify-content-center"
              >
                <FaPalette className="me-2" /> Auto Layout
              </Button>
            </Col>
            <Col xs={6} md={3} className="mb-2">
              <Button 
                variant="danger" 
                onClick={onClear} 
                className="w-100 d-flex align-items-center justify-content-center"
              >
                <FaTrash className="me-2" /> Clear
              </Button>
            </Col>
            <Col xs={6} md={3} className="mb-2">
              <Button 
                variant="success" 
                onClick={onPublish} 
                className="w-100 d-flex align-items-center justify-content-center"
              >
                <FaCheck className="me-2" /> Publish
              </Button>
            </Col>
          </Row>
        </div>
      </div>
    </Card>
  );
};

export default PipelineControls;