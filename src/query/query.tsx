import { gql } from "@apollo/client";

export const GET_DEVICES_LIST = gql`
  query GetDevicesList($input: deviceinput!) {
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
  mutation GetHeartbeatStatus($input: deviceinput!) {
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
      deployedstatus
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
