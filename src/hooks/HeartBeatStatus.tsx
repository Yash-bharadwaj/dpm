import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { GET_HEARTBEAT_STATUS } from "../query/query";

export const useHeartbeatStatus = (devices: Device[]) => {
  const [heartbeatStatus, setHeartbeatStatus] = useState<{
    [key: string]: {
      status: string | null;
      lastSeen: string | null;
      serviceStatus: string | null;
    };
  }>({});

  const [getHeartbeatStatus] = useMutation(GET_HEARTBEAT_STATUS);

  useEffect(() => {
    const fetchHeartbeatStatus = async () => {
      for (const device of devices) {
        try {
          const { data } = await getHeartbeatStatus({
            variables: {
              input: {
                orgcode: device.orgcode,
                devicecode: device.devicecode,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              },
            },
          });

          if (data.getHeartbeat && data.getHeartbeat.responsestatus) {
            const responseData = JSON.parse(data.getHeartbeat.responsedata);
            setHeartbeatStatus((prev) => ({
              ...prev,
              [device.devicecode]: {
                status: data.getHeartbeat.responsestatus ? "true" : "false",
                lastSeen: responseData.last_seen || "N/A",
                serviceStatus: responseData.service_status || "N/A",
              },
            }));
          }
        } catch (error) {
          console.error("Error fetching heartbeat status:", error);
        }
      }
    };

    if (devices.length > 0) {
      fetchHeartbeatStatus();
    }
  }, [devices, getHeartbeatStatus]);

  return heartbeatStatus;
};