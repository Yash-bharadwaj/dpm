import { useQuery } from '@apollo/client';
import { GET_DEVICES_LIST } from '../query/query';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

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

  const { loading, error, data } = useQuery(GET_DEVICES_LIST, {
    variables: { input: { orgcode: orgCode } },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const rows = data?.getLcdeviceList.map((device:any, index:any) => ({
    ...device,
    id: index + 1, 
  })) || [];

  return (
    <div style={{ marginTop: '4rem' }}>
      <h3>List of LC Devices</h3>
      <div style={{ height: "80vh", width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
         
        />
      </div>
    </div>
  );
};

export default Home;
