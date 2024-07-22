export const sampleConfig = `node:
  sources:
    disabled: false
    input_nxlog:
      uuid: "nxlog"
      name: "input_nxlog"
      address: "0.0.0.0:12103"
      log:
        schema: "raw"
        format: "json"
      type: "socket"
      mode: "tcp"
      outputs:
        - "pipeline_microsoft_windows"
  pipelines:
    disabled: false
    pipeline_microsoft_windows:
      name: "pipeline_microsoft_windows"
      observer:
        type: "windows"
        product: "windows"
        vendor: "microsoft"
      type: "remap"
      inputs:
        - "input_nxlog"
      outputs:
        - "enrich_geoip_01"
  enrichments:
    disabled: false
    enrich_geoip_01:
      name: "enrich_geoip_01"
      enrich:
        geoip: true
        iana: false
      inputs:
        - "pipeline_microsoft_windows"
      outputs:
        - "output_vector"
  destinations:
    disabled: false
    output_vector:
      uuid: "vectordestination"
      name: "output_vector"
      address: "0.0.0.0:12"
      inputs:
        - "enrich_geoip_01"
      compression: false
      type: "vector"
`;
