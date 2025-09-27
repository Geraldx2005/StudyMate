import * as React from "react";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";

export default function Loading() {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box sx={{ width: "50%" }}>
        <LinearProgress
          sx={{
            "& .MuiLinearProgress-bar": {
              backgroundColor: "#152a59", // your custom color
            },
            backgroundColor: "#3a58997c", // optional track color
            height: 5, // optional thickness
            borderRadius: 5,
          }}
        />
      </Box>
    </Box>
  );
}
