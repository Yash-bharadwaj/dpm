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
      data
    }
  }
`;