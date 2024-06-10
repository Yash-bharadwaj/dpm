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

import EditDestinationData from "./EditDestinationData";

const DestinationDrawer = ({
  show,
  handleClose,
  onAddDestination,
  addedSources,
}: any) => {
  const [showAddDest, setShowAddDestination] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(Object);

  const onDestinationSelect = (destination: object) => {
    setSelectedDestination(destination);
    setShowAddDestination(true);
  };

  const handleCloseDest = () => {
    setSelectedDestination({});
    setShowAddDestination(false);
  };

  const onSaveSettings = (values: object) => {
    onAddDestination(selectedDestination, values);

    setSelectedDestination({});
    setShowAddDestination(false);
  };

  const getImageSource = (image: string) => {
    const imageUrl = "/destinations/" + image;

    return imageUrl;
  };

  return (
    <Offcanvas
      show={show}
      onHide={handleClose}
      placement="end"
      className="offcanvas-main"
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Set up new Destination</Offcanvas.Title>
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
              {sources.destinations.map((destination) => (
                <Col xl={4} lg={4}>
                  <Card className="mb-2 pointer select-card">
                    <Card.Body className="main-card-div">
                      <div style={{ width: "100%" }}>
                        <Card.Text className="card-text">
                          <div>
                            <img
                              src={getImageSource(destination.image)}
                              alt={destination.name}
                            />
                          </div>
                          {destination?.name}
                        </Card.Text>

                        <div className="overlay-div">
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => {
                              onDestinationSelect(destination);
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

      {selectedDestination.name && (
        <EditDestinationData
          show={showAddDest}
          onHide={handleCloseDest}
          selectedDestination={selectedDestination}
          onSaveSettings={onSaveSettings}
        />
      )}
    </Offcanvas>
  );
};

export default DestinationDrawer;
