/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Offcanvas,
  Row,
} from "react-bootstrap";

import sources from "../../data/sources.json";
import { useState } from "react";

import EditSourceData from "./EditSourceData";

const SourceDrawer = ({ show, handleClose, onAddSource, addedNodes }: any) => {
  const [showAddSource, setShowAddSource] = useState(false);
  const [selectedSource, setSelectedSource] = useState(Object);

  const onSourceSelect = (source: object) => {
    setSelectedSource(source);

    setShowAddSource(true);
  };

  const handleCloseSource = () => {
    setSelectedSource({});
    setShowAddSource(false);
  };

  const onSaveSettings = (values: object) => {
    onAddSource(selectedSource, values);

    setSelectedSource({});
    setShowAddSource(false);
  };

  const getImageSource = (image: string) => {
    const imageUrl = "/sources/" + image;

    return imageUrl;
  };

  return (
    <Offcanvas
      show={show}
      onHide={handleClose}
      placement="start"
      className="offcanvas-main"
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Set up new Source</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body>
        <Row className="justify-content-md-center">
          <Col xl={12} lg={12} md={12} sm={12}>
            <InputGroup className="mb-3">
              <InputGroup.Text id="filter">@</InputGroup.Text>
              <Form.Control
                placeholder="Filter Sources"
                aria-label="filter"
                aria-describedby="filter"
              />
            </InputGroup>
          </Col>

          <Col xl={12} lg={12} md={12} sm={12}>
            <Row>
              {sources.sources.map((source) => (
                <Col xl={4} lg={4}>
                  <Card className="mb-2 pointer select-card">
                    <Card.Body className="main-card-div" style={{ boxShadow: "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px"}}>
                      <div style={{ width: "100%" ,}}>
                        <Card.Text className="card-text">
                          <div>
                            <img
                              src={getImageSource(source.image)}
                              alt={source.name}
                              style={{ width: "60px" }}
                            />
                          </div>
                          {source?.name}
                        </Card.Text>

                        <div className="overlay-div">
                          {/* <Button
                            variant="light"
                            size="sm"
                            onClick={() => {
                              onSourceSelect(source);
                            }}
                            className="mb-2"
                          >
                            Select Existing
                          </Button> */}

                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => {
                              onSourceSelect(source);
                            }}
                          >
                            Add New
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Offcanvas.Body>

      {selectedSource.name && (
        <EditSourceData
          show={showAddSource}
          onClose={handleCloseSource}
          selectedSource={selectedSource}
          onSaveSettings={onSaveSettings}
          addedNodes={addedNodes}
        />
      )}
    </Offcanvas>
  );
};

export default SourceDrawer;
