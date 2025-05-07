import { gql } from "@apollo/client";

export const GET_DEVICES_LIST = gql`
  query getDevicesList($input: deviceinput!) {
    getLcdeviceList(input: $input) {
      deviceid
      orgcode
      devicecode
      devicetype
      devicename
      devicelocation
      deviceip
    }
  }
`;

export const FETCH_ALL_DEVICES = gql`
  query fetchAllDevices {
    devices {
      id
      name
      description
      status
      lastSeen
      version
    }
  }
`;

export const CREATE_DEVICE = gql`
  mutation createDevice($input: DeviceInput!) {
    createDevice(input: $input) {
      id
      name
      description
      status
    }
  }
`;

export const UPDATE_DEVICE = gql`
  mutation updateDevice($id: ID!, $input: DeviceInput!) {
    updateDevice(id: $id, input: $input) {
      id
      name
      description
      status
    }
  }
`;

export const DELETE_DEVICE = gql`
  mutation deleteDevice($id: ID!) {
    deleteDevice(id: $id) {
      success
      message
    }
  }
`;

export const ADD_LC_DEVICE = gql`
  mutation addLcDevice($input: deviceinput!) {
    addLcDevice(input: $input) {
      responsestatus
      message
    }
  }
`;

export const GET_HEARTBEAT_STATUS = gql`
  mutation getHeartbeatStatus($input: deviceinput!) {
    getHeartbeat(input: $input) {
      responsestatus
      responsedata
    }
  }
`;

export const GET_CONFIG = gql`
  query getConfig($input: deviceinput!) {
    getConfig(input: $input) {
      responsestatus
      responsedata
      versionid
      configstatus
      configtags {
        tagkey
        tagvalue
      }
      comment
    }
  }
`;

export const SAVE_CONFIG = gql`
  mutation SaveConfig($input: deviceinput!) {
    saveConfig(input: $input) {
      responsestatus
      message
    }
  }
`;

export const DEPLOY_CONFIG = gql`
  mutation deployConfig($input: deviceinput!) {
    deployConfig(input: $input) {
      responsestatus
      message
    }
  }
`;

export const GET_CONFIG_VERSION = gql`
  query getConfigVersion(
    $orgcode: String!
    $devicecode: String!
    $timezone: String!
  ) {
    getConfigVersion(
      input: { orgcode: $orgcode, devicecode: $devicecode, timezone: $timezone }
    ) {
      lastmodified
      versionid
      status
      comment
    }
  }
`;

export const GET_CONFIG_TIMELINE_BY_VERSION = gql`
  query getConfigTimelineByVersion($input: deviceinput!) {
    getConfigTimeline(input: $input) {
      status
      timestamp
    }
  }
`;

export const GET_CONFIG_TIMELINE = gql`
  query GetConfigTimeline($input: deviceinput!) {
    getConfigTimeline(input: $input) {
      status
      timestamp
    }
  }
`;

export const GET_CONFIG_VALID_VERSIONS = gql`
  query getConfigValidVersion($input: deviceinput!) {
    getConfigValidVersion(input: $input) {
      lastmodified
      versionid
      status
      comment
    }
  }
`;

export const GET_OLDER_CONFIG_DETAILS = gql`
  query getOlderConfig($input: deviceinput!) {
    getConfig(input: $input) {
      responsestatus
      responsedata
      versionid
      configstatus
      configtags {
        tagkey
        tagvalue
      }
      comment
    }
  }
`;

export const GET_ERROR_LOGS = gql`
  query getErrorLogs($input: deviceinput!) {
    getErrorLogs(input: $input) {
      responsestatus
      responsedata
    }
  }
`;

export const DELETE_LC_DEVICE = gql`
  mutation deleteLcDevice($input: deviceinput!) {
    deleteLcDevice(input: $input) {
      responsestatus
      message
      __typename
    }
  }
`;

export const FETCH_DEVICE_ROUTING = gql`
  query fetchDeviceRouting($id: ID!) {
    device(id: $id) {
      id
      name
      routing
    }
  }
`;

export const SAVE_ROUTING = gql`
  mutation saveRouting($id: ID!, $routing: String!) {
    saveRouting(id: $id, routing: $routing) {
      success
      message
    }
  }
`;

export const PUBLISH_ROUTING = gql`
  mutation publishRouting($id: ID!) {
    publishRouting(id: $id) {
      success
      message
    }
  }
`;

export const FETCH_DEVICE_DETAILS = gql`
  query fetchDeviceDetails($id: ID!) {
    device(id: $id) {
      id
      name
      description
      status
      version
      createdAt
      updatedAt
      metrics {
        cpu
        memory
        disk
        uptime
      }
      alerts {
        id
        timestamp
        level
        message
      }
    }
  }
`;

export const FETCH_VERSIONS = gql`
  query fetchVersions {
    versions {
      id
      timestamp
      deviceId
      deviceName
      user
      status
      changes
    }
  }
`;

export const DEPLOY_VERSION = gql`
  mutation deployVersion($id: ID!) {
    deployVersion(id: $id) {
      success
      message
    }
  }
`;
