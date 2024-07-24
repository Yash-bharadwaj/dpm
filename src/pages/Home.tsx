import { useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { GET_DEVICES_LIST, GET_HEARTBEAT_STATUS } from '../query/query';

const columns: GridColDef[] = [
  { field: 'deviceid', headerName: 'Device ID', width: 120 },
  { field: 'orgcode', headerName: 'Org Code', width: 150 },
  { field: 'devicecode', headerName: 'Device Code', width: 150 },
  { field: 'devicetype', headerName: 'Device Type', width: 150 },
  { field: 'devicename', headerName: 'Device Name', width: 180 },
  { field: 'devicelocation', headerName: 'Device Location', width: 180 },
  { field: 'deviceip', headerName: 'Device IP', width: 150 },
  
];

const Home = () => {
  const orgCode = "d3b6842d";
  const [deviceCode, setDeviceCode] = useState("DM_HY_D01");

  const { loading: devicesLoading, error: devicesError, data: devicesData} = useQuery(GET_DEVICES_LIST, {
    variables: { input: { orgcode: orgCode, devicecode: deviceCode } },
  });

  const [getHeartbeatStatus] = useMutation(GET_HEARTBEAT_STATUS, {
    onError: (error) => {
      console.error("Error fetching heartbeat status:", error);
    },
    onCompleted: (data) => {

      if(data.getHeartbeat.data){
        const parsedData = JSON.parse(data.getHeartbeat.data);
          console.log("heartbeat Status : ", parsedData); 
      }
    
    },
  });

  const handleHeartbeatClick = () => {
    getHeartbeatStatus({
      variables: {
        input: {
          orgcode: orgCode,
          devicecode: deviceCode,
        },
      },
    });
  };

  if (devicesLoading) return <p>Loading devices...</p>;
  if (devicesError) return <p>Error loading devices: {devicesError.message}</p>;

  return (
    <div style={{ marginTop: '4rem' }}>
      <h3>List of LC Devices</h3>
      <button onClick={handleHeartbeatClick} style={{ marginTop: '1rem', marginBottom: '2rem', backgroundColor: 'green', color: 'white' }}>Heartbeat Status</button>
      <div style={{ height: "80vh", width: '100%' }}>
        <DataGrid 
          rows={devicesData?.getLcdeviceList.map((device: any, index: number) => ({
            ...device,
            id: index + 1,
          })) || []}
          columns={columns}
        />
      </div>
    </div>
  );
};

export default Home;
