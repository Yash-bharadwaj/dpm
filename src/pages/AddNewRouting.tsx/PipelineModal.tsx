/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button, Form, Modal, Table } from "react-bootstrap";

import parsers from "../../data/parsers.json";

import { useState } from "react";

// import { Typeahead } from "react-bootstrap-typeahead";

import { CaretDown, CaretUp } from "react-bootstrap-icons";

interface PipelineModalProps {
  show: boolean;
  handleClose: any;
  savePipeline: any;
  addedSources: any;
  addedPipelines: any;
  selectedPipeline: any;
}

const PipelineModal = ({
  show,
  handleClose,
  savePipeline,
  addedSources,
  addedPipelines,
  selectedPipeline,
}: PipelineModalProps) => {
  let currentPipeline = [];
  let currentProducts = [];

  let allParsers = [];

  parsers.observers.forEach((observer: any) => {
    let disabledParser = true;
    if (observer.source) {
      observer.source.forEach((source: any) => {
        if (!source.disabled) {
          disabledParser = false;
        }
      });
    }

    if (!disabledParser) {
      allParsers.push(observer);
    }
  });

  if (selectedPipeline?.data) {
    let uuid = selectedPipeline.data.nodeData.uuid;
  
    allParsers.forEach((pipeline) => {
      if (pipeline.uuid === uuid) {
        currentPipeline = [pipeline];
  
        if (pipeline.source) {
          pipeline.source.forEach((source: any) => {
            const observerProduct = source.product;
            const observerVendor = source.vendor;
  
            const pipelineName =
              "pipeline_" + observerVendor + "_" + observerProduct;
  
            if (pipelineName === selectedPipeline.id) {
              currentProducts = source;
            }
          });
        }
      }
    });
  }

  const [selectedParser, setSelectedParser] = useState(
    currentPipeline || Array
  );
  const [selectedProducts, setSelectedProducts] = useState(
    currentProducts || Object
  );
  const [viewAll, setViewAll] = useState(true);
  const [searchedPipelines, setSearchedPipelines] = useState(allParsers);
  const [searchText, setSearchText] = useState("");

  let matchingPipelines = [];

allParsers.forEach((pipeline) => {
  // Skip if pipeline doesn't have input_sources
  if (!pipeline.input_sources || !Array.isArray(pipeline.input_sources)) {
    return;
  }

  addedSources.forEach((source: any) => {
    if (source && source.name && pipeline.input_sources.includes(source.name)) {
      // Only add the pipeline once if it matches multiple sources
      if (!matchingPipelines.includes(pipeline)) {
        matchingPipelines.push(pipeline);
      }
    }
  });
});

  const onSavePipeline = () => {
    const selectedPipeline = selectedParser[0];
    let newPipeline = true;

    const observerProduct = selectedPipeline.source
      ? selectedProducts.product
      : selectedPipeline.product;
    const observerVendor = selectedPipeline.source
      ? selectedProducts.vendor
      : selectedPipeline.vendor;

    const pipelineName = "pipeline_" + observerVendor + "_" + observerProduct;

    addedPipelines.forEach((pipeline: any) => {
      if (pipeline.name === pipelineName) {
        newPipeline = false;
      }
    });

    let pipeline = {};

    if (selectedPipeline.source) {
      pipeline = {
        name: pipelineName,
        observer: {
          type: selectedProducts.type,
          product: selectedProducts.product,
          vendor: selectedProducts.vendor,
        },
        uuid: selectedPipeline.uuid,
        type: "remap",
        inputs: [],
        outputs: [],
      };
    } else {
      pipeline = {
        name: pipelineName,
        uuid: selectedPipeline.uuid,
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
        // Change from name to label
        if (item.label === pipeline.label) {
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

  const onSearch = (searchText: string) => {
    let searchedPipelines = [];
    setSearchText(searchText);
  
    if (searchText === "") {
      setSearchedPipelines(allParsers);
    } else {
      if (searchText.length >= 3) {
        allParsers.forEach((pipeline) => {
          // Change from name to label
          const pipelineLabel = pipeline.label.toLowerCase();
  
          if (pipelineLabel.match(searchText)) {
            searchedPipelines.push(pipeline);
          }
        });
  
        setSearchedPipelines(searchedPipelines);
      }
    }
  };
  return (
    <Modal show={show} onHide={handleClose} dialogClassName="modal-90w">
      <Modal.Header closeButton style={{ padding: "8px 12px" }}>
        <Modal.Title>Pipelines</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: "8px 12px" }}>
        <div style={{ float: "right" }}>
          <Button variant="link" onClick={onViewAll} size="sm">
            {viewAll ? "View Compatible Pipelines" : "View All Pipelines"}
          </Button>
        </div>

        <Form.Control
          placeholder={`Search pipeline`}
          aria-label="pipeline"
          aria-describedby="pipeline"
          className="mb-1"
          size="sm"
          id="pipeline"
          onChange={(event) => {
            onSearch(event.target.value);
          }}
          value={searchText}
          type={"text"}
        />

        <div style={{ height: "380px", overflow: "auto" }}>
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
    {(viewAll ? searchedPipelines : matchingPipelines).map(
      (pipeline) => (
        <>
          <tr>
            <td align="center">
              {pipeline.source ? (
                selectedParser.length !== 0 &&
                selectedParser[0].label === pipeline.label ? (
                  <CaretUp
                    style={{ cursor: "pointer" }}
                    onClick={() => onSelectPipeline(false, pipeline)}
                  />
                ) : (
                  <CaretDown
                    style={{ cursor: "pointer" }}
                    onClick={() => onSelectPipeline(true, pipeline)}
                  />
                )
              ) : (
                <Form.Check
                  name="pipeline"
                  type={"radio"}
                  id={`inline-checkbox-1`}
                  onChange={(event) => {
                    onSelectPipeline(event.target.checked, pipeline);
                  }}
                  checked={
                    selectedParser.length !== 0 &&
                    selectedParser[0].label === pipeline.label
                  }
                />
              )}
            </td>
            <td>{pipeline.label}</td>
            <td>{pipeline.type}</td>
            <td>{pipeline.vendor}</td>
            <td>{pipeline.product}</td>
          </tr>

          {selectedParser.length !== 0 &&
            selectedParser[0].label === pipeline.label &&
            pipeline.source &&
            pipeline.source.map(
              (source: any) =>
                !source.disabled && (
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
                    <td>{source.name}</td>
                    <td>{source.type}</td>
                    <td>{source.vendor}</td>
                    <td>{source.product}</td>
                  </tr>
                )
            )}
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
