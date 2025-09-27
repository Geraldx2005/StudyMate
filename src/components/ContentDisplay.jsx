import { useState, useEffect, useCallback, useRef } from "react";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import {
  CircularProgress,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Button,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ImageIcon from "@mui/icons-material/Image";

export const triggerImageRefresh = (imageName) => {
  window.dispatchEvent(
    new CustomEvent("newImageUploaded", {
      detail: { imageName },
    })
  );
};

function ContentDisplay() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(20);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const observerTarget = useRef(null);

  // Memoized fetch function with performance optimizations
  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const listRef = ref(storage, "uploads/");
      const res = await listAll(listRef);

      // Process images in batches for better performance
      const batchSize = 10;
      const imageBatches = [];

      for (let i = 0; i < res.items.length; i += batchSize) {
        const batch = res.items.slice(i, i + batchSize);
        imageBatches.push(batch);
      }

      let imageData = [];

      for (const batch of imageBatches) {
        const batchPromises = batch.map(async (itemRef) => ({
          url: await getDownloadURL(itemRef),
          name: itemRef.name,
          size: "Image",
          uploaded: new Date().toLocaleDateString(),
          id: `${itemRef.name}-${Date.now()}`,
        }));

        const batchResults = await Promise.all(batchPromises);
        imageData = [...imageData, ...batchResults];
      }

      setImages(imageData);
      setLastUpdated(Date.now());
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimized single image addition
  const addNewImage = useCallback(async (imageName) => {
    try {
      const imageRef = ref(storage, `uploads/${imageName}`);
      const newImageUrl = await getDownloadURL(imageRef);

      const newImage = {
        url: newImageUrl,
        name: imageName,
        size: "Image",
        uploaded: new Date().toLocaleDateString(),
        id: `${imageName}-${Date.now()}`,
      };

      setImages((prevImages) => {
        // Quick duplicate check using Set for better performance
        const existingNames = new Set(prevImages.map((img) => img.name));
        return existingNames.has(imageName) ? prevImages : [newImage, ...prevImages];
      });

      setLastUpdated(Date.now());
    } catch (error) {
      console.error("Error adding new image:", error);
    }
  }, []);

  // Efficient event listener
  useEffect(() => {
    const handleNewUpload = (event) => {
      if (event.detail?.imageName) {
        addNewImage(event.detail.imageName);
      } else {
        fetchImages();
      }
    };

    window.addEventListener("newImageUploaded", handleNewUpload);
    return () => window.removeEventListener("newImageUploaded", handleNewUpload);
  }, [addNewImage, fetchImages]);

  // Initial load
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Optimized intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < images.length) {
          setVisibleCount((prev) => Math.min(prev + 20, images.length));
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [images.length, visibleCount]);

  // Memoized handlers
  const handleDownload = useCallback(async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  }, []);

  const handleImageClick = useCallback((url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  if (loading && images.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const displayImages = images.slice(0, visibleCount);
  const hasMoreImages = visibleCount < images.length;

  return (
    <Box p={2}>
      <Box mb={3}>
        <Typography variant="h6" component="h2" fontWeight="600" color="#152a59">
          Uploaded Images ({images.length})
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Last updated: {new Date(lastUpdated).toLocaleTimeString()}
        </Typography>
      </Box>

      <List sx={{ width: "100%", bgcolor: "background.paper", padding: 0 }}>
        {displayImages.map((image, index) => (
          <Box key={image.id}>
            <ListItem
              sx={{
                padding: "12px 0",
                alignItems: "center",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <ListItemAvatar sx={{ minWidth: 72 }}>
                <Avatar
                  src={image.url}
                  variant="rounded"
                  sx={{
                    width: 60,
                    height: 60,
                    cursor: "pointer",
                  }}
                  onClick={() => handleImageClick(image.url)}
                >
                  <ImageIcon />
                </Avatar>
              </ListItemAvatar>

              <ListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    fontWeight="600"
                    sx={{ cursor: "pointer", lineHeight: 1.2 }}
                    onClick={() => handleImageClick(image.url)}
                  >
                    {image.name}
                  </Typography>
                }
                secondary={
                  <Box display="flex" alignItems="center" gap={2} mt={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      {image.size}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {image.uploaded}
                    </Typography>
                  </Box>
                }
                sx={{
                  flex: 1,
                  marginRight: 2,
                }}
              />

              <Box display="flex" gap={1} alignItems="center" sx={{ minWidth: "120px" }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => handleImageClick(image.url)}
                  sx={{
                    borderColor: "#152a59",
                    color: "#152a59",
                    padding: "4px 8px",
                    minWidth: "auto",
                    textTransform: "none",
                    borderRadius: "7px",
                    "&:hover": {
                      borderColor: "#1c3973",
                      backgroundColor: "rgba(21, 42, 89, 0.04)",
                    },
                  }}
                >
                  View
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownload(image.url, image.name)}
                  sx={{
                    backgroundColor: "#152a59",
                    padding: "4.5px 8px",
                    minWidth: "auto",
                    textTransform: "none",
                    borderRadius: "7px",
                    boxShadow: "none",
                    "&:hover": {
                      backgroundColor: "#1c3973",
                      boxShadow: "none",
                    },
                  }}
                >
                  Download
                </Button>
              </Box>
            </ListItem>

            {/* Full-width divider */}
            {index < displayImages.length - 1 && <Divider sx={{ width: "100%", margin: "0" }} />}
          </Box>
        ))}
      </List>

      {/* Auto-load trigger */}
      {hasMoreImages && <Box ref={observerTarget} sx={{ height: "1px" }} />}

      {/* Loading indicator */}
      {hasMoreImages && (
        <Box display="flex" justifyContent="center" alignItems="center" py={3} gap={1}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Loading more images...
          </Typography>
        </Box>
      )}

      {images.length === 0 && !loading && (
        <Box textAlign="center" mt={6}>
          <ImageIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No images uploaded yet.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default ContentDisplay;
