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
  addedPipelines: any;
}

const PipelineModal = ({
  show,
  handleClose,
  savePipeline,
  addedSources,
  addedPipelines,
}: PipelineModalProps) => {
  const [selectedParser, setSelectedParser] = useState(Array);
  const [selectedProducts, setSelectedProducts] = useState(Object);
  const [viewAll, setViewAll] = useState(true);

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

    const pipelineCount = addedPipelines.length + 1;
    const pipelineNumber =
      pipelineCount < 10 ? "0" + pipelineCount : pipelineCount;

    let pipeline = {};
    const observerProduct = selectedPipeline.source
      ? selectedProducts.product
      : selectedPipeline.product;
    const observerVendor = selectedPipeline.source
      ? selectedProducts.vendor
      : selectedPipeline.vendor;

    const pipelineName =
      "pipeline_" +
      observerVendor +
      "_" +
      observerProduct +
      "_" +
      pipelineNumber;

    if (selectedPipeline.source) {
      pipeline = {
        name: pipelineName,
        observer: {
          type: selectedProducts.type,
          product: selectedProducts.product,
          vendor: selectedProducts.vendor,
        },
        type: "remap",
        inputs: [],
        outputs: [],
      };
    } else {
      pipeline = {
        name: pipelineName,
        observer: {
          type: selectedPipeline.type,
          product: selectedPipeline.product,
          vendor: selectedPipeline.vendor,
        },
        type: "remap",
        inputs: [],
        outputs: [],
      };
    }

    console.log("pipeline", pipeline);

    savePipeline(pipeline);
  };

  const onSelectPipeline = (event: boolean, pipeline: object) => {
    if (event) {
      setSelectedParser([pipeline]);
      setSelectedProducts({});
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

      setSelectedProducts({});
    }
  };

  const onSelectProducts = (event: boolean, source: object) => {
    if (event) {
      setSelectedProducts(source);
    }
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
                          name="pipeline"
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
                              name="product"
                              type={"radio"}
                              id={`inline-checkbox-2`}
                              onChange={(event) => {
                                onSelectProducts(event.target.checked, source);
                              }}
                              checked={
                                selectedProducts.name &&
                                selectedProducts.name === source.name
                              }
                              style={{ float: "right" }}
                            />
                          </td>
                          <td>{source.label}</td>
                          <td>{source.type}</td>
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
          Add Pipeline
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PipelineModal;
