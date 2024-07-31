import { Backdrop, Box } from "@mui/material";
import PropTypes from "prop-types";

DataLoading.propTypes = {
  open: PropTypes.boolean,
};

function DataLoading({ open }) {
  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "rgb(0 0 0 / 16%)",
      }}
      open={open}
    >
      <Box p={1}>
        <img src={import.meta.env.VITE_BLUSAPPHIRE_LOADING_GIF} height="50em" />
      </Box>
    </Backdrop>
  );
}

export default DataLoading;
