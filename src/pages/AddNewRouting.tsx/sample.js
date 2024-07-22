export const sampleConfig = `node:
  sources:
    disabled: false
    input_nxlog:
      name: "input_nxlog"
      address: "0.0.0.0:12103"
      log:
        schema: "raw"
        format: "json"
      type: "socket"
      mode: "tcp"
      outputs:
        - "output_vector"
  pipelines:
    disabled: true
  enrichments:
    disabled: true
  destinations:
    disabled: false
    output_vector:
      name: "output_vector"
      address: "0.0.0.0:12"
      inputs:
        - "input_nxlog"
      compression: false
      type: "vector"
`;
