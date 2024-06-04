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

// import office from "../../assets/images/office.jpg";
// import kafka from "../../assets/images/kafka.png";
// import sqs from "../../assets/images/sqs.png";
// import s3 from "../../assets/images/s3.png";

const SourceDrawer = ({ show, handleClose, onAddSource }: any) => {
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
    setShowAddSource(false);
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
                    <Card.Body className="main-card-div">
                      <div style={{ width: "100%" }}>
                        <Card.Text className="card-text">
                          {/* <div>
                            {source.image ? (
                              <img
                                src={
                                  source.image === "office"
                                    ? office
                                    : source.image === "kafka"
                                    ? kafka
                                    : source.image === "sqs"
                                    ? sqs
                                    : source.image === "s3"
                                    ? s3
                                    : null
                                }
                                style={{ width: "30%" }}
                              />
                            ) : null}
                          </div> */}
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
        />
      )}
    </Offcanvas>
  );
};

export default SourceDrawer;
