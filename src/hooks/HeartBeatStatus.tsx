import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { GET_HEARTBEAT_STATUS } from "../query/query";


interface SystemInfo {
  hostname: string | null;
  ipAddress: string | null;
  lastSeen: string | null;

}

interface HardwareInfo {
  cpuUsage: number | null;
  totalMemory: string | null;
  memoryUsage: string | null;
  memoryPercent:string | null
}

interface ConfigVersion {
  versionId: string | null;
  lastModified: string | null;
}

interface HeartbeatStatus {
  status: string | null;
  lastSeen: string | null;
  serviceStatus: string | null;
  ipAddress: string | null;
  systemInfo: SystemInfo;
  hardwareInfo: HardwareInfo;
  configVersion: ConfigVersion;
}

interface HeartbeatStatuses {
  [deviceCode: string]: HeartbeatStatus;
}

// Define the types for the devices
interface Device {
  orgcode: string;
  devicecode: string;
}

export const useHeartbeatStatus = (devices: Device[]) => {
  const [heartbeatStatus, setHeartbeatStatus] = useState<HeartbeatStatuses>({});

  const [getHeartbeatStatus] = useMutation(GET_HEARTBEAT_STATUS);

  useEffect(() => {
    const fetchHeartbeatStatus = async () => {
      const statuses: HeartbeatStatuses = {};

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

            statuses[device.devicecode] = {
              status: data.getHeartbeat.responsestatus ? "true" : "false",
              lastSeen: responseData.system_info?.last_seen || "N/A",
              serviceStatus: responseData.service_status || "N/A",
              ipAddress: responseData.system_info?.ip_address || "N/A",
              systemInfo: {
                hostname: responseData.system_info?.hostname || "N/A",
                ipAddress: responseData.system_info?.ip_address || "N/A",
                lastSeen: responseData.system_info?.last_seen || "N/A",
              },
              hardwareInfo: {
                cpuUsage: responseData.hardware_info?.cpu_usage || null,
                totalMemory: responseData.hardware_info?.total_memory || null,
                memoryUsage: responseData.hardware_info?.memory_usage || null,
                memoryPercent:responseData.hardware_info?.memory_usage_percent || null
              },
              configVersion: {
                versionId: responseData.config_version?.version_id || "N/A",
                lastModified: responseData.config_version?.last_modified || "N/A",
              },
            };
          }
        } catch (error) {
          console.error("Error fetching heartbeat status:", error);
        }
      }

      setHeartbeatStatus(statuses);
    };

    fetchHeartbeatStatus();
  }, [devices, getHeartbeatStatus]);

  return heartbeatStatus;
};
