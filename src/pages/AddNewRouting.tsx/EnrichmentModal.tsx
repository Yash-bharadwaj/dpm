/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form, Modal } from "react-bootstrap";

import { useState } from "react";

interface EnrichmentModalProps {
  show: boolean;
  handleClose: any;
  onAddEnrichment: any;
  enrichments: any;
}

const EnrichmentModal = ({
  show,
  handleClose,
  onAddEnrichment,
  enrichments,
}: EnrichmentModalProps) => {
  const [selectedEnrichment, setSelectedEnrichment] = useState(Array);

  const onCheck = (event: boolean, type: string) => {
    if (event) {
      setSelectedEnrichment((prevList) => [...prevList, type]);
    } else {
      const prevColumns = selectedEnrichment;
      let currentIndex = -1;

      prevColumns.forEach((item, index) => {
        if (item === type) {
          currentIndex = index;
        }
      });

      setSelectedEnrichment([
        ...prevColumns.slice(0, currentIndex),
        ...prevColumns.slice(currentIndex + 1),
      ]);
    }
  };

  const onSave = () => {
    let name = "";

    let geoCount = 1;
    let ianaCount = 1;

    enrichments.forEach((enrichment: any) => {
      if (enrichment.enrich.geoip && !enrichment.enrich.iana) {
        geoCount++;
      } else if (!enrichment.enrich.geoip && enrichment.enrich.iana) {
        ianaCount++;
      }
    });

    if (
      selectedEnrichment.includes("geoip") &&
      selectedEnrichment.includes("iana")
    ) {
      name = "enrich_all";
    } else if (selectedEnrichment.includes("geoip")) {
      const count = geoCount < 10 ? "0" + geoCount : geoCount;
      name = "enrich_geoip_" + count;
    } else if (selectedEnrichment.includes("iana")) {
      const count = ianaCount < 10 ? "0" + ianaCount : ianaCount;
      name = "enrich_iana_" + count;
    }

    const enrichment = {
      name: name,
      enrich: {
        geoip: selectedEnrichment.includes("geoip"),
        iana: selectedEnrichment.includes("iana"),
      },
      inputs: [],
      outputs: [],
    };

    onAddEnrichment(enrichment);
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Select Enrichment</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <div key={`inline-checkbox`} className="mb-3">
            <Form.Check
              label="GeoIP-lookup"
              name="group1"
              type={"checkbox"}
              id={`inline-checkbox-1`}
              onChange={(event) => {
                onCheck(event.target.checked, "geoip");
              }}
            />

            <Form.Check
              label="IANA"
              name="group1"
              type={"checkbox"}
              id={`inline-checkbox-2`}
              onChange={(event) => {
                onCheck(event.target.checked, "iana");
              }}
            />
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} size="sm">
          Close
        </Button>

        <Button variant="primary" onClick={onSave} size="sm">
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EnrichmentModal;
