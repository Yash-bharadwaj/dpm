// Mock data for the application
export const mockDevices = [
  {
    deviceid: '1',
    orgcode: 'test_org',
    devicecode: 'device001',
    devicetype: 'collector',
    devicename: 'Test Device 1',
    devicelocation: 'Location 1',
    deviceip: '192.168.1.1',
  },
  {
    deviceid: '2',
    orgcode: 'test_org',
    devicecode: 'device002',
    devicetype: 'forwarder',
    devicename: 'Test Device 2',
    devicelocation: 'Location 2',
    deviceip: '192.168.1.2',
  },
  {
    deviceid: '3',
    orgcode: 'test_org',
    devicecode: 'device003',
    devicetype: 'aggregator',
    devicename: 'Test Device 3',
    devicelocation: 'Location 3',
    deviceip: '192.168.1.3',
  },
  {
    deviceid: '4',
    orgcode: 'test_org',
    devicecode: 'device004',
    devicetype: 'collector',
    devicename: 'Test Device 4',
    devicelocation: 'Location 4',
    deviceip: '192.168.1.4',
  },
  {
    deviceid: '5',
    orgcode: 'test_org',
    devicecode: 'device005',
    devicetype: 'forwarder',
    devicename: 'Test Device 5',
    devicelocation: 'Location 5',
    deviceip: '192.168.1.5',
  },
];

export const mockConfig = {
  responsestatus: 'success',
  responsedata: JSON.stringify({
    sources: [
      {
        id: 'source1',
        type: 'file',
        name: 'Log File',
        config: { path: '/var/log/test.log' },
      },
      {
        id: 'source2',
        type: 'syslog',
        name: 'Syslog Input',
        config: { port: 514 },
      },
    ],
    processors: [
      {
        id: 'processor1',
        type: 'regex',
        name: 'Regex Parser',
        config: { pattern: '.*' },
      },
      {
        id: 'processor2',
        type: 'filter',
        name: 'Error Filter',
        config: { field: 'level', value: 'error' },
      },
    ],
    destinations: [
      {
        id: 'destination1',
        type: 's3',
        name: 'S3 Bucket',
        config: { bucket: 'logs-bucket' },
      },
      {
        id: 'destination2',
        type: 'elasticsearch',
        name: 'Elasticsearch',
        config: { index: 'logs' },
      },
    ],
    routes: [
      {
        id: 'route1',
        from: 'source1',
        to: 'processor1',
      },
      {
        id: 'route2',
        from: 'processor1',
        to: 'destination1',
      },
      {
        id: 'route3',
        from: 'source2',
        to: 'processor2',
      },
      {
        id: 'route4',
        from: 'processor2',
        to: 'destination2',
      },
    ],
  }),
  versionid: 'v2',
  configstatus: 'saved',
  configtags: [{ tagkey: 'environment', tagvalue: 'test' }],
  comment: 'Test configuration',
};

export const mockConfigVersions = [
  {
    lastmodified: '2023-05-01T12:00:00Z',
    versionid: 'v1',
    status: 'deployed',
    comment: 'Initial config',
  },
  {
    lastmodified: '2023-05-02T14:30:00Z',
    versionid: 'v2',
    status: 'saved',
    comment: 'Updated processing rules',
  },
  {
    lastmodified: '2023-05-03T09:15:00Z',
    versionid: 'v3',
    status: 'saved',
    comment: 'Added new data source',
  },
];
