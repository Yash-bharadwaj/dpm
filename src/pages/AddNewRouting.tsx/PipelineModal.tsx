/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button, Form, Modal, Table } from "react-bootstrap";

import parsers from "../../data/parsers.json";

import { useState } from "react";
// import { Typeahead } from "react-bootstrap-typeahead";

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

  const onSavePipeline = () => {
    const selectedPipeline = selectedParser[0];

    const pipeline = {
      disabled: false,
      name: selectedPipeline?.label,
      observer: {
        type: selectedPipeline.type,
        product: selectedPipeline.product,
        vendor: selectedPipeline.vendor,
      },
      inputs: [],
      outputs: [],
    };

    savePipeline(pipeline);
  };

  const onSelectPipeline = (event: boolean, pipeline: object) => {
    if (event) {
      setSelectedParser([pipeline]);
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
    }
  };

  return (
    <Modal show={show} onHide={handleClose} dialogClassName="modal-90w">
      <Modal.Header closeButton>
        <Modal.Title>Pipelines</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Label htmlFor="logschema">Pipelines</Form.Label>
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
              {parsers.observers.map((pipeline) => (
                <tr>
                  <td>
                    <Form.Check
                      label={pipeline.name}
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
              ))}
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
