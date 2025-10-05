// UploadModal.jsx
import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  LinearProgress,
  Snackbar,
  Alert
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { storage } from "../../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { triggerImageRefresh } from "../utility/ImageList";

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

const departments = [
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electronics Engineering"
];

const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const semesters = ["Odd", "Even"];

export default function UploadModal({ open, onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    department: "",
    year: "",
    semester: "",
    subject: ""
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleUpload = async () => {
    // Validation
    if (!selectedFile) {
      showSnackbar("Please select a file to upload", "warning");
      return;
    }

    if (!formData.department || !formData.year || !formData.semester || !formData.subject) {
      showSnackbar("Please fill all the fields", "warning");
      return;
    }

    setUploading(true);
    setProgress(0);

    // Create storage path based on selections - without "uploads/" prefix
    const storagePath = `${formData.department}/${formData.year}/${formData.semester}/${formData.subject}/${selectedFile.name}`;
    const storageRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(progress);
      },
      (error) => {
        setUploading(false);
        showSnackbar("Upload failed! Please try again.", "error");
        console.error("Upload error:", error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(() => {
          setUploading(false);
          showSnackbar("File uploaded successfully!", "success");
          triggerImageRefresh();
          // Reset form
          setSelectedFile(null);
          setFormData({
            department: "",
            year: "",
            semester: "",
            subject: ""
          });
          // Close modal after successful upload
          setTimeout(() => {
            onClose();
          }, 1500);
        });
      }
    );
  };

  const handleClose = () => {
    if (!uploading) {
      onClose();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            minHeight: "80vh"
          }
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#152a59",
            color: "white",
            textAlign: "center",
            fontSize: "1.5rem",
            fontWeight: "600",
            py: 3
          }}
        >
          Upload Study Materials
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          <Box className="space-y-6">
            {/* File Upload Section */}
            <Box
              sx={{
                border: "2px dashed #152a59",
                borderRadius: "12px",
                p: 4,
                textAlign: "center",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                mb: 3
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: "#152a59", mb: 2 }} />
              <Typography variant="h6" gutterBottom color="#152a59">
                Select File to Upload
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Supported formats: PDF, DOC, DOCX, Images, etc.
              </Typography>
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                disabled={uploading}
                sx={{
                  backgroundColor: "#152a59",
                  "&:hover": {
                    backgroundColor: "#1c3973",
                  },
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: "600",
                }}
              >
                Choose File
                <VisuallyHiddenInput
                  type="file"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </Button>
              {selectedFile && (
                <Typography variant="body2" sx={{ mt: 2, color: "#152a59" }}>
                  Selected: <strong>{selectedFile.name}</strong>
                </Typography>
              )}
            </Box>

            {/* Form Fields */}
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormControl fullWidth variant="outlined">
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  onChange={handleInputChange("department")}
                  label="Department"
                  disabled={uploading}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth variant="outlined">
                <InputLabel>Year</InputLabel>
                <Select
                  value={formData.year}
                  onChange={handleInputChange("year")}
                  label="Year"
                  disabled={uploading}
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth variant="outlined">
                <InputLabel>Semester</InputLabel>
                <Select
                  value={formData.semester}
                  onChange={handleInputChange("semester")}
                  label="Semester"
                  disabled={uploading}
                >
                  {semesters.map((sem) => (
                    <MenuItem key={sem} value={sem}>
                      {sem}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth variant="outlined">
                <TextField
                  label="Subject Name"
                  value={formData.subject}
                  onChange={handleInputChange("subject")}
                  disabled={uploading}
                  placeholder="Enter subject name"
                />
              </FormControl>
            </Box>

            {/* Storage Path Preview */}
            {formData.department && formData.year && formData.semester && formData.subject && (
              <Box sx={{ p: 2, backgroundColor: "rgba(21, 42, 89, 0.1)", borderRadius: "8px" }}>
                <Typography variant="body2" color="#152a59" sx={{ fontWeight: "600" }}>
                  Storage Path:
                </Typography>
                <Typography variant="body2" color="#152a59">
                  {formData.department} / {formData.year} / {formData.semester} / {formData.subject} / 
                  {selectedFile ? ` ${selectedFile.name}` : " [filename]"}
                </Typography>
              </Box>
            )}

            {/* Progress Bar */}
            {uploading && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Uploading... {progress}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#00ffcc",
                    }
                  }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleClose}
            disabled={uploading}
            sx={{
              color: "#152a59",
              borderColor: "#152a59",
              "&:hover": {
                borderColor: "#1c3973",
                backgroundColor: "rgba(21, 42, 89, 0.04)"
              }
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
            variant="contained"
            sx={{
              backgroundColor: "#152a59",
              "&:hover": {
                backgroundColor: "#1c3973",
              },
              "&:disabled": {
                backgroundColor: "rgba(21, 42, 89, 0.5)"
              },
              textTransform: "none",
              fontWeight: "600",
              px: 4
            }}
          >
            {uploading ? "Uploading..." : "Upload File"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: "8px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}