import * as React from "react";
import { useState } from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import { storage } from "../../firebase";
import { triggerImageRefresh } from "../utility/ImageList";
import { ref, uploadBytesResumable, getDownloadURL, getMetadata } from "firebase/storage";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function InputFileUpload() {
  const [progress, setProgress] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [uploading, setUploading] = useState(false);

  const showToast = (message, severity = "info") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Reset input value to allow selecting the same file again
    event.target.value = '';

    // Show upload progress immediately
    setUploading(true);
    setProgress(0);
    setSnackbarOpen(true);

    const storageRef = ref(storage, `uploads/${file.name}`);

    try {
      await getMetadata(storageRef);
      setUploading(false);
      showToast("File with this name already exists!", "warning");
      return;
    } catch (error) {
      if (error.code !== "storage/object-not-found") {
        setUploading(false);
        showToast("Error checking file existence.", "error");
        return;
      }
    }

    // File doesn't exist, proceed with upload
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(progress);
      },
      (error) => {
        setUploading(false);
        showToast("Upload failed! Please try again.", "error");
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(() => {
          setUploading(false);
          showToast("File uploaded successfully!", "success");
          triggerImageRefresh();
        });
      }
    );
  };

  const getToastContent = () => {
    if (uploading) {
      return (
        <div className="flex flex-col gap-2 w-[250px]">
          <span className="text-sm font-medium">Uploading... {progress}%</span>
          <LinearProgress 
            variant="determinate" 
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#00ffcc",
              }
            }}
          />
        </div>
      );
    }
    return snackbarMessage;
  };

  return (
    <div className="flex">
      <Button
        component="label"
        variant="contained"
        startIcon={<CloudUploadIcon />}
        sx={{
          color: "white",
          backgroundColor: "#152a59",
          "&:hover": {
            backgroundColor: "#1c3973",
            boxShadow: "none",
          },
          borderRadius: "12px",
          padding: "10px 20px",
          textTransform: "none",
          fontSize: "16px",
          fontWeight: "600",
          boxShadow: "none",
          "&:active": {
            boxShadow: "none",
            backgroundColor: "#152a59",
          },
        }}
      >
        Upload files
        <VisuallyHiddenInput 
          type="file" 
          onChange={handleFileChange} 
          key={Date.now()} // Alternative solution: force re-render
        />
      </Button>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={uploading ? null : 4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{ 
          "& .MuiSnackbarContent-root": {
            minWidth: "250px",
            borderRadius: "16px !important",
          }
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={uploading ? "info" : snackbarSeverity}
          variant="filled"
          sx={{ 
            width: "100%",
            backgroundColor: "#152a59 !important",
            borderRadius: "16px",
            "& .MuiAlert-icon": {
              color: "white"
            },
            "& .MuiAlert-message": {
              padding: "8px 0"
            }
          }}
          icon={uploading ? false : undefined}
        >
          {getToastContent()}
        </Alert>
      </Snackbar>
    </div>
  );
}