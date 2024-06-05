/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button, Form, Modal, Table } from "react-bootstrap";

import parsers from "../../data/parsers.json";

import { useState } from "react";

interface PipelineModalProps {
  show: boolean;
  handleClose: any;
  savePipeline: any;
  addedSources: any;
}

const PipelineModal = ({
  show,
  handleClose,
  savePipeline,
  addedSources,
}: PipelineModalProps) => {
  const [selectedParser, setSelectedParser] = useState(Array);
  const [selectedProducts, setSelectedProducts] = useState(Array);
  const [viewAll, setViewAll] = useState(false);

  let matchingPipelines = [];

  parsers.observers.forEach((pipeline) => {
    addedSources.forEach((source) => {
      if (pipeline.input_sources.includes(source.name)) {
        matchingPipelines.push(pipeline);
      }
    });
  });

  const onSavePipeline = () => {
    const selectedPipeline = selectedParser[0];

    let pipeline = {};

    let pipelineName = "pipeline_" + addedSources[0].id;

    if (selectedPipeline.source) {
      let products = [];

      selectedProducts.forEach((product) => {
        products.push({ [product.vendor]: product.product });
      });

      pipeline = {
        disabled: false,
        name: pipelineName,
        observer: {
          type: selectedPipeline.type,
          products: products,
        },
        inputs: [],
        outputs: [],
      };
    } else {
      pipeline = {
        disabled: false,
        name: pipelineName,
        observer: {
          type: selectedPipeline.type,
          product: selectedPipeline.product,
          vendor: selectedPipeline.vendor,
        },
        inputs: [],
        outputs: [],
      };
    }

    savePipeline(pipeline);
  };

  const onSelectPipeline = (event: boolean, pipeline: object) => {
    if (event) {
      setSelectedParser([pipeline]);

      if (pipeline.source) {
        setSelectedProducts(pipeline.source);
      }
    } else {
      const prevColumns = selectedParser;
      let currentIndex = -1;

      prevColumns.forEach((item: unknown, index: number) => {
        if (item.name === pipeline.name) {
          currentIndex = index;
        }
      });

      setSelectedParser([
        ...prevColumns.slice(0, currentIndex),
        ...prevColumns.slice(currentIndex + 1),
      ]);

      setSelectedProducts([]);
    }
  };

  const onSelectProducts = (event: object, source: object) => {
    if (event.target.checked) {
      setSelectedProducts((prevList) => [...prevList, source]);
    } else {
      const prevColumns = selectedProducts;
      let currentIndex = -1;

      prevColumns.forEach((item: unknown, index: number) => {
        if (item.name === source.name) {
          currentIndex = index;
        }
      });

      setSelectedProducts([
        ...prevColumns.slice(0, currentIndex),
        ...prevColumns.slice(currentIndex + 1),
      ]);
    }
  };

  const getCheckedValue = (source) => {
    let checked = false;

    selectedProducts.forEach((product) => {
      if (source.name === product.name) {
        checked = true;
      }
    });

    return checked;
  };

  const onViewAll = () => {
    setViewAll(!viewAll);
  };

  return (
    <Modal show={show} onHide={handleClose} dialogClassName="modal-90w">
      <Modal.Header closeButton>
        <Modal.Title>Pipelines</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* <Typeahead
          id="basic-typeahead-single"
          labelKey="name"
          onChange={(event) => {
            onParserSelect(event);
          }}
          options={parsers.observers}
          placeholder="Search for Pipeline"
          selected={selectedParser}
          className="mb-3"
          size="sm"
          minLength={4}
        /> */}

        <div>
          <div style={{ float: "right", marginBottom: "8px" }}>
            <Button variant="link" onClick={onViewAll} size="sm">
              {viewAll ? "View Compatible Pipelines" : "View All Pipelines"}
            </Button>
          </div>

          <Table striped bordered>
            <thead>
              <tr>
                <th>Select</th>
                <th>Name</th>
                <th>Type</th>
                <th>Vendor</th>
                <th>Product</th>
              </tr>
            </thead>

            <tbody>
              {(viewAll ? parsers.observers : matchingPipelines).map(
                (pipeline) => (
                  <>
                    <tr>
                      <td>
                        <Form.Check
                          name="group1"
                          type={"radio"}
                          id={`inline-checkbox-1`}
                          onChange={(event) => {
                            onSelectPipeline(event.target.checked, pipeline);
                          }}
                          checked={
                            selectedParser.length !== 0 &&
                            selectedParser[0].name === pipeline.name
                          }
                        />
                      </td>

                      <td>{pipeline.name}</td>
                      <td>{pipeline.type}</td>
                      <td>{pipeline.vendor}</td>
                      <td>{pipeline.product}</td>
                    </tr>

                    {selectedParser.length !== 0 &&
                      selectedParser[0].name === pipeline.name &&
                      pipeline.source &&
                      pipeline.source.map((source) => (
                        <tr>
                          <td>
                            <Form.Check
                              name="group1"
                              type={"checkbox"}
                              id={`inline-checkbox-1`}
                              onChange={(event) => {
                                onSelectProducts(event, source);
                              }}
                              checked={getCheckedValue(source)}
                              style={{ float: "right" }}
                            />
                          </td>
                          <td>{source.name}</td>
                          <td>{pipeline.type}</td>
                          <td>{source.vendor}</td>
                          <td>{source.product}</td>
                        </tr>
                      ))}
                  </>
                )
              )}
            </tbody>
          </Table>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} size="sm">
          Close
        </Button>

        <Button
          variant="primary"
          onClick={onSavePipeline}
          disabled={selectedParser.length === 0}
          size="sm"
        >
          Save Pipeline
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PipelineModal;
