import React, { ReactNode } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { SchemaLink } from '@apollo/client/link/schema';
import { makeExecutableSchema } from '@graphql-tools/schema';

// Define a mock schema with placeholder data
const typeDefs = `
  type Device {
    deviceid: ID!
    orgcode: String!
    devicecode: String!
    devicetype: String!
    devicename: String!
    devicelocation: String
    deviceip: String
  }

  type ResponseStatus {
    responsestatus: String!
    message: String
    __typename: String
  }

  type ConfigTag {
    tagkey: String!
    tagvalue: String!
  }

  type Config {
    responsestatus: String!
    responsedata: String
    versionid: String
    configstatus: String
    configtags: [ConfigTag]
    comment: String
  }

  type ConfigVersion {
    lastmodified: String!
    versionid: String!
    status: String!
    comment: String
  }

  input DeviceInput {
    orgcode: String!
    devicecode: String
    devicetype: String
    devicename: String
    devicelocation: String
    deviceip: String
    configdata: String
    comment: String
    timezone: String
  }

  type Query {
    getLcdeviceList(input: DeviceInput!): [Device]!
    getConfig(input: DeviceInput!): Config!
    getConfigValidVersion(input: DeviceInput!): [ConfigVersion]!
  }

  type Mutation {
    addLcDevice(input: DeviceInput!): ResponseStatus!
    deleteLcDevice(input: DeviceInput!): ResponseStatus!
    saveConfig(input: DeviceInput!): ResponseStatus!
    deployConfig(input: DeviceInput!): ResponseStatus!
  }
`;

// Sample data
const devices = [
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
];

const configVersions = [
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
];

// Resolvers
const resolvers = {
  Query: {
    getLcdeviceList: () => devices,
    getConfig: () => ({
      responsestatus: 'success',
      responsedata: JSON.stringify({
        sources: [
          {
            id: 'source1',
            type: 'file',
            name: 'Log File',
            config: { path: '/var/log/test.log' },
          },
        ],
        processors: [
          {
            id: 'processor1',
            type: 'regex',
            name: 'Regex Parser',
            config: { pattern: '.*' },
          },
        ],
        destinations: [
          {
            id: 'destination1',
            type: 's3',
            name: 'S3 Bucket',
            config: { bucket: 'logs-bucket' },
          },
        ],
      }),
      versionid: 'v2',
      configstatus: 'saved',
      configtags: [{ tagkey: 'environment', tagvalue: 'test' }],
      comment: 'Test configuration',
    }),
    getConfigValidVersion: () => configVersions,
  },
  Mutation: {
    addLcDevice: () => ({
      responsestatus: 'success',
      message: 'Device added successfully',
      __typename: 'ResponseStatus',
    }),
    deleteLcDevice: () => ({
      responsestatus: 'success',
      message: 'Device deleted successfully',
      __typename: 'ResponseStatus',
    }),
    saveConfig: () => ({
      responsestatus: 'success',
      message: 'Configuration saved successfully',
      __typename: 'ResponseStatus',
    }),
    deployConfig: () => ({
      responsestatus: 'success',
      message: 'Configuration deployed successfully',
      __typename: 'ResponseStatus',
    }),
  },
};

// Create the executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Create Apollo Client with the schema link
const client = new ApolloClient({
  link: new SchemaLink({ schema }),
  cache: new InMemoryCache(),
});

interface MockApolloProviderProps {
  children: ReactNode;
}

export const MockApolloProvider: React.FC<MockApolloProviderProps> = ({ children }) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default MockApolloProvider;
