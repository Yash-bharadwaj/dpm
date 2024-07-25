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
      resposestatus,
      resposedata
    }
  }
`;


export const GET_CONFIG = gql`
  mutation GetHeartbeatStatus($input: deviceinput!) {
    getConfig(input: $input) {
      resposestatus,
      resposedata
    }
  }
`;


export const SAVE_CONFIG = gql`
  mutation SaveConfig($input: deviceinput!) {
    saveConfig(input: $input) {
      resposestatus
      message
    }
  }
`;