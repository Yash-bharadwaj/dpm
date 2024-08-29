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

import { MdOutlineSearch } from "react-icons/md";

const SourceDrawer = ({ show, handleClose, onAddSource, addedNodes }: any) => {
  const [showAddSource, setShowAddSource] = useState(false);
  const [selectedSource, setSelectedSource] = useState(Object);
  const [matchedSources, setMatchedSources] = useState(sources.sources);
  const [searchText, setSearchText] = useState("");

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

  const onSearch = (searchText: string) => {
    let searchedSources = [];
    setSearchText(searchText);

    if (searchText === "") {
      setMatchedSources(sources.sources);
    } else {
      if (searchText.length >= 3) {
        sources.sources.forEach((source) => {
          const name = source.name.toLowerCase();

          if (name.match(searchText)) {
            searchedSources.push(source);
          }
        });

        setMatchedSources(searchedSources);
      }
    }
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
              <InputGroup.Text id="filter">
                <MdOutlineSearch />
              </InputGroup.Text>

              <Form.Control
                placeholder="Filter Sources"
                aria-label="filter"
                aria-describedby="filter"
                onChange={(event) => {
                  onSearch(event.target.value);
                }}
                value={searchText}
              />
            </InputGroup>
          </Col>

          <Col xl={12} lg={12} md={12} sm={12}>
            <Row>
              {matchedSources.map((source) => (
                <Col xl={4} lg={4}>
                  <Card className="mb-2 pointer select-card">
                    <Card.Body className="main-card-div">
                      <div style={{ width: "100%" }}>
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
                          {source.disabled ? (
                            <Button variant="light" size="sm" disabled>
                              Coming Soon
                            </Button>
                          ) : (
                            <Button
                              variant="light"
                              size="sm"
                              onClick={() => {
                                onSourceSelect(source);
                              }}
                            >
                              Add New
                            </Button>
                          )}
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
