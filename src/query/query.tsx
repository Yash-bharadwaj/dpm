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
