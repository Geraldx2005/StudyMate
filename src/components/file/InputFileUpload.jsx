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

// Default form data structure
const defaultFormData = {
  dept: '',
  year: '',
  sem: '',
  sub: ''
};

export default function InputFileUpload({ formData = defaultFormData }) {
  const [progress, setProgress] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [uploading, setUploading] = useState(false);

  // Safe form data with fallback
  const safeFormData = formData || defaultFormData;

  const showToast = (message, severity = "info") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const validateFormData = () => {
    if (!safeFormData.dept || !safeFormData.year || !safeFormData.sem || !safeFormData.sub) {
      return "Please fill all the form fields before uploading.";
    }
    return null;
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate form data
    const validationError = validateFormData();
    if (validationError) {
      showToast(validationError, "warning");
      event.target.value = '';
      return;
    }

    // Reset input value to allow selecting the same file again
    event.target.value = '';

    // Show upload progress immediately
    setUploading(true);
    setProgress(0);
    setSnackbarOpen(true);

    // Create organized folder structure based on form data
    const fileExtension = file.name.split('.').pop();
    const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
    const timestamp = new Date().getTime();
    const organizedFileName = `${fileNameWithoutExtension}_${timestamp}.${fileExtension}`;
    
    const filePath = `${safeFormData.dept}/${safeFormData.year}/${safeFormData.sem}/${safeFormData.sub}/${organizedFileName}`;
    console.log("Uploading to path:", filePath);
    const storageRef = ref(storage, filePath);

    try {
      // Check if file already exists
      await getMetadata(storageRef);
      setUploading(false);
      showToast("File with this name already exists in this category!", "warning");
      return;
    } catch (error) {
      // File doesn't exist - this is expected and means we can proceed with upload
      if (error.code === "storage/object-not-found") {
        // Proceed with upload since file doesn't exist
        uploadFile(storageRef, file);
      } else {
        // Handle other errors
        setUploading(false);
        console.error("Error checking file existence:", error);
        showToast("Error checking file existence. Please try again.", "error");
        return;
      }
    }
  };

  const uploadFile = (storageRef, file) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(progress);
      },
      (error) => {
        setUploading(false);
        console.error("Upload error:", error);
        showToast("Upload failed! Please try again.", "error");
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(() => {
          setUploading(false);
          showToast("File uploaded successfully!", "success");
          triggerImageRefresh();
        }).catch(error => {
          setUploading(false);
          console.error("Error getting download URL:", error);
          showToast("Upload completed but there was an error getting the file URL.", "warning");
        });
      }
    );
  };

  const getFormStatus = () => {
    try {
      const filledFields = Object.values(safeFormData).filter(value => value !== '').length;
      const totalFields = Object.keys(safeFormData).length;
      return `${filledFields}/${totalFields} fields filled`;
    } catch (error) {
      return "0/4 fields filled";
    }
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
          {safeFormData.dept && safeFormData.year && safeFormData.sem && safeFormData.sub && (
            <span className="text-xs text-gray-300">
              {safeFormData.dept} • {safeFormData.year} • {safeFormData.sem} • {safeFormData.sub}
            </span>
          )}
        </div>
      );
    }
    return snackbarMessage;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
        {getFormStatus()}
      </div>
      
      <Button
        component="label"
        variant="contained"
        startIcon={<CloudUploadIcon />}
        disabled={uploading}
        sx={{
          color: "white",
          backgroundColor: "#152a59",
          "&:hover": {
            backgroundColor: "#1c3973",
            boxShadow: "none",
          },
          "&:disabled": {
            backgroundColor: "#a0a0a0",
            color: "#e0e0e0"
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
        {uploading ? "Uploading..." : "Upload files"}
        <VisuallyHiddenInput 
          type="file" 
          onChange={handleFileChange} 
          key={Date.now()}
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