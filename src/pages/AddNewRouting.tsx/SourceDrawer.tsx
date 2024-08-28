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
import { SetStateAction, useState } from "react";

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
    let searchedSources: SetStateAction<({ name: string; type: string; uuid: string; image: string; tooltip: string; disabled: boolean; status: string; "log.format": string; "log.schema": string; settings: ({ name: string; label: string; prefix: string; tooltip: string; datatype: string; mandatory: boolean; maxChar: number; placeholder?: undefined; default?: undefined; } | { name: string; label: string; tooltip: string; datatype: string; mandatory: boolean; maxChar: number; prefix?: undefined; placeholder?: undefined; default?: undefined; } | { name: string; label: string; placeholder: string; tooltip: string; mandatory: boolean; prefix?: undefined; datatype?: undefined; maxChar?: undefined; default?: undefined; } | { name: string; label: string; tooltip: string; placeholder: string; datatype: string; default: string; mandatory: boolean; maxChar: number; prefix?: undefined; })[]; authentication: { name: string; tooltip: string; fields: ({ name: string; label: string; tooltip: string; options: string[]; default: string; datatype: string; mandatory: boolean; placeholder?: undefined; maxChar?: undefined; } | { name: string; label: string; options: string[]; default: string; tooltip: string; datatype?: undefined; mandatory?: undefined; placeholder?: undefined; maxChar?: undefined; } | { name: string; label: string; placeholder: string; tooltip: string; default: string; datatype: string; options?: undefined; mandatory?: undefined; maxChar?: undefined; } | { name: string; label: string; placeholder: string; tooltip: string; datatype: string; maxChar: number; options?: undefined; default?: undefined; mandatory?: undefined; })[]; dropdownOptions?: undefined; }; advanced: ({ name: string; label: string; options: string[]; default: string; tooltip: string; datatype: string; } | { name: string; label: string; options: string[]; tooltip: string; default: string; datatype?: undefined; })[]; mode?: undefined; } | { name: string; type: string; mode: string; uuid: string; image: string; tooltip: string; disabled: boolean; status: string; "log.format": string; "log.schema": string; settings: ({ name: string; label: string; prefix: string; tooltip: string; datatype: string; mandatory: boolean; maxChar: number; default?: undefined; } | { name: string; label: string; tooltip: string; datatype: string; mandatory: boolean; default: string; prefix?: undefined; maxChar?: undefined; })[]; advanced: ({ name: string; label: string; tooltip: string; datatype: string; maxChar: number; } | { name: string; label: string; tooltip: string; datatype: string; maxChar?: undefined; })[]; authentication?: undefined; } | { name: string; type: string; mode: string; uuid: string; image: string; tooltip: string; disabled: boolean; status: string; "log.format": string; "log.schema": string; settings: ({ name: string; label: string; prefix: string; tooltip: string; datatype: string; mandatory: boolean; maxChar: number; default?: undefined; } | { name: string; label: string; tooltip: string; datatype: string; mandatory: boolean; default: string; prefix?: undefined; maxChar?: undefined; })[]; authentication?: undefined; advanced?: undefined; } | { name: string; type: string; mode: string; uuid: string; image: string; tooltip: string; disabled: boolean; status: string; settings: ({ name: string; label: string; prefix: string; tooltip: string; datatype: string; mandatory: boolean; maxChar: number; default?: undefined; fields?: undefined; } | { name: string; label: string; tooltip: string; default: string; datatype: string; mandatory: boolean; prefix?: undefined; maxChar?: undefined; fields?: undefined; } | { name: string; tooltip: string; fields: { name: string; label: string; tooltip: string; datatype: string; mandatory: boolean; }[]; label?: undefined; prefix?: undefined; datatype?: undefined; mandatory?: undefined; maxChar?: undefined; default?: undefined; } | { name: string; label: string; tooltip: string; datatype: string; mandatory: boolean; prefix?: undefined; maxChar?: undefined; default?: undefined; fields?: undefined; })[]; advanced: ({ name: string; label: string; tooltip: string; datatype: string; maxChar: number; fields?: undefined; } | { name: string; tooltip: string; fields: { name: string; label: string; tooltip: string; options: string[]; default: string; datatype: string; mandatory: boolean; }[]; label?: undefined; datatype?: undefined; maxChar?: undefined; })[]; "log.format"?: undefined; "log.schema"?: undefined; authentication?: undefined; } | { name: string; type: string; uuid: string; image: string; tooltip: string; disabled: boolean; status: string; "log.format": string; "log.schema": string; settings: ({ name: string; label: string; prefix: string; tooltip: string; datatype: string; mandatory: boolean; maxChar: number; options?: undefined; default?: undefined; } | { name: string; label: string; tooltip: string; datatype: string; mandatory: boolean; maxChar: number; prefix?: undefined; options?: undefined; default?: undefined; } | { name: string; label: string; options: string[]; tooltip: string; default: string; prefix?: undefined; datatype?: undefined; mandatory?: undefined; maxChar?: undefined; } | { name: string; label: string; tooltip: string; prefix?: undefined; datatype?: undefined; mandatory?: undefined; maxChar?: undefined; options?: undefined; default?: undefined; })[]; authentication: { name: string; tooltip: string; dropdownOptions: { label: string; tooltip: string; fieldsToShow: ({ name: string; label: string; placeholder: string; tooltip: string; datatype: string; mandatory: boolean; maxChar: number; } | { name: string; label: string; placeholder: string; tooltip: string; datatype?: undefined; mandatory?: undefined; maxChar?: undefined; })[]; }[]; fields?: undefined; }; advanced?: undefined; mode?: undefined; } | { name: string; type: string; uuid: string; image: string; tooltip: string; disabled: boolean; status: string; "log.format": string; "log.schema": string; settings: ({ name: string; label: string; prefix: string; tooltip: string; datatype: string; mandatory: boolean; maxChar: number; placeholder?: undefined; options?: undefined; default?: undefined; } | { name: string; label: string; placeholder: string; tooltip: string; datatype: string; mandatory: boolean; maxChar: number; prefix?: undefined; options?: undefined; default?: undefined; } | { name: string; label: string; tooltip: string; options: string[]; default: boolean; datatype: string; prefix?: undefined; mandatory?: undefined; maxChar?: undefined; placeholder?: undefined; } | { name: string; label: string; tooltip: string; prefix?: undefined; datatype?: undefined; mandatory?: undefined; maxChar?: undefined; placeholder?: undefined; options?: undefined; default?: undefined; })[]; authentication: { name: string; tooltip: string; dropdownOptions: { label: string; tooltip: string; fieldsToShow: ({ name: string; label: string; placeholder: string; tooltip: string; datatype: string; mandatory: boolean; maxChar: number; } | { name: string; label: string; placeholder: string; tooltip: string; datatype?: undefined; mandatory?: undefined; maxChar?: undefined; })[]; }[]; fields?: undefined; }; advanced: { name: string; label: string; tooltip: string; datatype: string; maxChar: number; }[]; mode?: undefined; } | { name: string; type: string; uuid: string; image: string; tooltip: string; disabled: boolean; status: string; "log.format": string; "log.schema": string; settings: ({ name: string; label: string; prefix: string; tooltip: string; datatype: string; mandatory: boolean; maxChar: number; placeholder?: undefined; } | { name: string; label: string; tooltip: string; datatype: string; mandatory: boolean; maxChar: number; prefix?: undefined; placeholder?: undefined; } | { name: string; label: string; placeholder: string; tooltip: string; mandatory: boolean; prefix?: undefined; datatype?: undefined; maxChar?: undefined; })[]; authentication: { name: string; tooltip: string; fields: ({ name: string; label: string; tooltip: string; options: string[]; datatype: string; placeholder?: undefined; maxChar?: undefined; } | { name: string; label: string; options: string[]; tooltip: string; datatype?: undefined; placeholder?: undefined; maxChar?: undefined; } | { name: string; label: string; placeholder: string; tooltip: string; datatype: string; options?: undefined; maxChar?: undefined; } | { name: string; label: string; placeholder: string; tooltip: string; datatype: string; maxChar: number; options?: undefined; })[]; dropdownOptions?: undefined; }; advanced: ({ name: string; label: string; options: string[]; tooltip: string; datatype: string; default?: undefined; } | { name: string; label: string; options: string[]; tooltip: string; default: string; datatype?: undefined; })[]; mode?: undefined; } | { name: string; type: string; uuid: string; image: string; tooltip: string; disabled: boolean; status: string; "log.format": string; "log.schema": string; settings: ({ name: string; label: string; prefix: string; tooltip: string; datatype: string; mandatory: boolean; maxChar: number; default?: undefined; } | { name: string; label: string; tooltip: string; default: string; datatype: string; mandatory: boolean; prefix?: undefined; maxChar?: undefined; })[]; authentication?: undefined; advanced?: undefined; mode?: undefined; } | { name: string; type: string; uuid: string; image: string; tooltip: string; disabled: boolean; status: string; "log.format": string; "log.schema": string; settings: ({ name: string; label: string; prefix: string; tooltip: string; datatype: string; mandatory: boolean; maxChar: number; default?: undefined; options?: undefined; fields?: undefined; } | { name: string; label: string; tooltip: string; default: string; datatype: string; mandatory: boolean; prefix?: undefined; maxChar?: undefined; options?: undefined; fields?: undefined; } | { name: string; label: string; tooltip: string; datatype: string; mandatory: boolean; prefix?: undefined; maxChar?: undefined; default?: undefined; options?: undefined; fields?: undefined; } | { name: string; label: string; tooltip: string; options: string[]; datatype: string; mandatory: boolean; prefix?: undefined; maxChar?: undefined; default?: undefined; fields?: undefined; } | { name: string; tooltip: string; fields: { name: string; label: string; tooltip: string; options: string[]; datatype: string; mandatory: boolean; }[]; label?: undefined; prefix?: undefined; datatype?: undefined; mandatory?: undefined; maxChar?: undefined; default?: undefined; options?: undefined; })[]; authentication: { name: string; tooltip: string; fields: ({ name: string; label: string; placeholder: string; tooltip: string; datatype: string; mandatory: boolean; maxChar?: undefined; } | { name: string; label: string; placeholder: string; tooltip: string; datatype: string; maxChar: number; mandatory: boolean; })[]; dropdownOptions?: undefined; }; advanced: { name: string; label: string; tooltip: string; default: string; options: string[]; datatype: string; }[]; mode?: undefined; } | { name: string; type: string; uuid: string; image: string; tooltip: string; disabled: boolean; status: string; "log.format": string; "log.schema": string; settings: ({ name: string; label: string; prefix: string; tooltip: string; datatype: string; mandatory: boolean; maxChar: number; default?: undefined; options?: undefined; } | { name: string; label: string; tooltip: string; default: string; datatype: string; mandatory: boolean; prefix?: undefined; maxChar?: undefined; options?: undefined; } | { name: string; label: string; tooltip: string; default: string; options: string[]; datatype: string; mandatory: boolean; prefix?: undefined; maxChar?: undefined; })[]; authentication: { tooltip: string; fields: { name: string; label: string; tooltip: string; mandatory: boolean; }[]; name?: undefined; dropdownOptions?: undefined; }; advanced: { name: string; label: string; options: string[]; tooltip: string; datatype: string; }[]; mode?: undefined; } | { name: string; type: string; uuid: string; image: string; tooltip: string; disabled: boolean; status: string; "log.format": string; "log.schema": string; settings: ({ name: string; label: string; prefix: string; tooltip: string; datatype: string; mandatory: boolean; maxChar: number; default?: undefined; options?: undefined; } | { name: string; label: string; tooltip: string; default: string; datatype: string; mandatory: boolean; prefix?: undefined; maxChar?: undefined; options?: undefined; } | { name: string; label: string; tooltip: string; default: string; options: string[]; datatype: string; mandatory: boolean; prefix?: undefined; maxChar?: undefined; })[]; advanced: ({ name: string; label: string; options: string[]; tooltip: string; datatype: string; default?: undefined; } | { name: string; label: string; tooltip: string; default: string; options: string[]; datatype?: undefined; })[]; authentication?: undefined; mode?: undefined; } | { name: string; type: string; uuid: string; image: string; tooltip: string; disabled: boolean; status: string; "log.format": string; "log.schema": string; settings: ({ name: string; label: string; prefix: string; tooltip: string; datatype: string; mandatory: boolean; maxChar: number; default?: undefined; } | { name: string; label: string; tooltip: string; default: string; datatype: string; mandatory: boolean; prefix?: undefined; maxChar?: undefined; })[]; advanced: ({ name: string; label: string; tooltip: string; datatype: string; maxChar: number; default?: undefined; options?: undefined; } | { name: string; label: string; tooltip: string; datatype: string; maxChar?: undefined; default?: undefined; options?: undefined; } | { name: string; label: string; tooltip: string; default: string; options: string[]; datatype: string; maxChar?: undefined; })[]; authentication?: undefined; mode?: undefined; } | { name: string; type: string; uuid: string; image: string; tooltip: string; disabled: boolean; status: string; "log.format": string; "log.schema": string; settings: ({ name: string; label: string; prefix: string; tooltip: string; datatype: string; mandatory: boolean; maxChar: number; default?: undefined; } | { name: string; label: string; tooltip: string; datatype: string; maxChar: number; mandatory: boolean; prefix?: undefined; default?: undefined; } | { name: string; label: string; tooltip: string; default: string; datatype: string; prefix?: undefined; mandatory?: undefined; maxChar?: undefined; })[]; advanced: ({ name: string; label: string; tooltip: string; default: string; options: string[]; datatype: string; } | { name: string; label: string; tooltip: string; default: string; options: string[]; datatype?: undefined; })[]; authentication?: undefined; mode?: undefined; } | { name: string; type: string; uuid: string; image: string; tooltip: string; disabled: boolean; status: string; settings: ({ name: string; label: string; prefix: string; tooltip: string; datatype: string; mandatory: boolean; maxChar: number; default?: undefined; options?: undefined; } | { name: string; label: string; tooltip: string; default: string; options: string[]; mandatory: boolean; prefix?: undefined; datatype?: undefined; maxChar?: undefined; } | { name: string; label: string; tooltip: string; default: string; datatype: string; mandatory: boolean; prefix?: undefined; maxChar?: undefined; options?: undefined; })[]; "log.format"?: undefined; "log.schema"?: undefined; authentication?: undefined; advanced?: undefined; mode?: undefined; })[]> = [];
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
                    <Card.Body
                      className="main-card-div"
                      style={{
                        boxShadow:
                          "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px",
                      }}
                    >
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
