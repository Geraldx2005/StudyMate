import { useState, useEffect, useCallback, useRef } from "react";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";
import {
  CircularProgress,
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Skeleton,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ImageIcon from "@mui/icons-material/Image";

export const triggerImageRefresh = (imageName) => {
  window.dispatchEvent(
    new CustomEvent("newImageUploaded", {
      detail: { imageName },
    })
  );
};

function ImageCard() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [imageLoadStates, setImageLoadStates] = useState({});
  const preloadedImages = useRef(new Set());
  const observerRef = useRef();

  // Intersection Observer for lazy loading with preloading
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const imgId = entry.target.dataset.imgId;
            const imgUrl = entry.target.dataset.imgUrl;
            if (imgId && imgUrl && !preloadedImages.current.has(imgUrl)) {
              preloadImage(imgUrl, imgId);
            }
          }
        });
      },
      {
        rootMargin: '100px 0px', // Start loading 100px before entering viewport
        threshold: 0.1,
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Preload images with priority
  const preloadImage = useCallback((url, imageId) => {
    return new Promise((resolve) => {
      if (preloadedImages.current.has(url)) {
        setImageLoadStates(prev => ({ ...prev, [imageId]: true }));
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        preloadedImages.current.add(url);
        setImageLoadStates(prev => ({
          ...prev,
          [imageId]: true
        }));
        resolve();
      };
      img.onerror = () => {
        console.error("Preload failed for:", url);
        setImageLoadStates(prev => ({
          ...prev,
          [imageId]: true
        }));
        resolve();
      };
      img.src = url;
    });
  }, []);

  // Memoized fetch function
  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const listRef = ref(storage, "uploads/");
      const res = await listAll(listRef);

      const batchSize = 4; // Smaller batches for better performance
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
        
        // Small delay between batches for smoother loading
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setImages(imageData);
      setLastUpdated(Date.now());
      
      // Initialize all images as not loaded
      const initialLoadStates = {};
      imageData.forEach(img => {
        initialLoadStates[img.id] = false;
      });
      setImageLoadStates(initialLoadStates);

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
        const existingNames = new Set(prevImages.map((img) => img.name));
        return existingNames.has(imageName) ? prevImages : [newImage, ...prevImages];
      });

      setImageLoadStates(prev => ({
        ...prev,
        [newImage.id]: false
      }));

      // Preload the new image
      preloadImage(newImageUrl, newImage.id).catch(console.error);

      setLastUpdated(Date.now());
    } catch (error) {
      console.error("Error adding new image:", error);
    }
  }, [preloadImage]);

  // Handle image load
  const handleImageLoad = useCallback((imageId) => {
    setImageLoadStates(prev => ({
      ...prev,
      [imageId]: true
    }));
  }, []);

  // Handle image error
  const handleImageError = useCallback((imageId, url) => {
    console.error("Error loading image:", url);
    setImageLoadStates(prev => ({
      ...prev,
      [imageId]: true
    }));
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

  // Skeleton loading component
  const SkeletonCard = () => (
    <Card
      sx={{
        width: "100%",
        height: "280px",
        display: "flex",
        flexDirection: "column",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #e0e0e0",
        boxShadow: "none",
      }}
    >
      {/* Image Skeleton */}
      <Box sx={{ width: "100%", height: "200px", flexShrink: 0 }}>
        <Skeleton 
          variant="rectangular" 
          width="100%" 
          height="100%" 
          sx={{ 
            transform: 'none', // Disable scale transformation for better performance
            bgcolor: 'grey.100'
          }} 
        />
      </Box>

      {/* Content Skeleton */}
      <CardContent
        sx={{
          p: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flex: 1,
          minHeight: "80px",
          maxHeight: "80px",
          "&:last-child": {
            paddingBottom: "12px",
          },
        }}
      >
        <Box sx={{ flex: 1, mr: 1 }}>
          <Skeleton 
            variant="text" 
            width="80%" 
            height={20}
            sx={{ bgcolor: 'grey.100' }}
          />
          <Skeleton 
            variant="text" 
            width="60%" 
            height={16}
            sx={{ bgcolor: 'grey.100', mt: 0.5 }}
          />
        </Box>
        <Skeleton 
          variant="circular" 
          width={32} 
          height={32}
          sx={{ bgcolor: 'grey.100', flexShrink: 0 }}
        />
      </CardContent>
    </Card>
  );

  if (loading && images.length === 0) {
    return (
      <Box p={2}>
        <Box mb={3}>
          <Skeleton variant="text" width={200} height={32} sx={{ bgcolor: 'grey.100' }} />
          <Skeleton variant="text" width={150} height={20} sx={{ bgcolor: 'grey.100', mt: 1 }} />
        </Box>

        {/* Skeleton Grid */}
        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)'
            },
            gap: 2,
            width: '100%'
          }}
        >
          {Array.from(new Array(8)).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </Box>
      </Box>
    );
  }

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

      {/* Main Images Grid */}
      <Box 
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)'
          },
          gap: 2,
          width: '100%'
        }}
      >
        {images.map((image) => {
          const isImageLoaded = imageLoadStates[image.id];
          
          return (
            <Card
              key={image.id}
              sx={{
                width: "100%",
                height: "280px",
                display: "flex",
                flexDirection: "column",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid #e0e0e0",
                boxShadow: "none",
                transition: "box-shadow 0.2s ease-in-out",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
              }}
            >
              {/* Image Section with Skeleton */}
              <Box 
                sx={{ 
                  width: "100%",
                  height: "200px",
                  overflow: "hidden",
                  cursor: "pointer",
                  flexShrink: 0,
                  position: 'relative',
                  backgroundColor: 'grey.50'
                }}
                onClick={() => handleImageClick(image.url)}
              >
                {!isImageLoaded && (
                  <Skeleton 
                    variant="rectangular" 
                    width="100%" 
                    height="100%" 
                    sx={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      transform: 'none',
                      bgcolor: 'grey.100'
                    }} 
                  />
                )}
                
                <CardMedia
                  component="img"
                  image={image.url}
                  alt={image.name}
                  data-img-id={image.id}
                  data-img-url={image.url}
                  ref={(el) => {
                    if (el && observerRef.current) {
                      observerRef.current.observe(el);
                    }
                  }}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    opacity: isImageLoaded ? 1 : 0,
                    transition: 'opacity 0.3s ease-in-out',
                    willChange: 'opacity',
                    // Hardware acceleration
                    transform: 'translateZ(0)',
                  }}
                  onLoad={() => handleImageLoad(image.id)}
                  onError={() => handleImageError(image.id, image.url)}
                  loading="lazy"
                />
              </Box>

              {/* Content Section */}
              <CardContent
                sx={{
                  p: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flex: 1,
                  minHeight: "80px",
                  maxHeight: "80px",
                  "&:last-child": {
                    paddingBottom: "12px",
                  },
                }}
              >
                <Box sx={{ flex: 1, mr: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      cursor: "pointer",
                      lineHeight: 1.2,
                      mb: 0.5,
                    }}
                    title={image.name}
                    onClick={() => handleImageClick(image.url)}
                  >
                    {image.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      display: "block",
                    }}
                  >
                    {image.size} • {image.uploaded}
                  </Typography>
                </Box>

                <IconButton
                  onClick={() => handleDownload(image.url, image.name)}
                  sx={{
                    backgroundColor: "#152a59",
                    color: "white",
                    borderRadius: "4px",
                    p: "6px",
                    flexShrink: 0,
                    "&:hover": {
                      backgroundColor: "#1c3973",
                    },
                  }}
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </CardContent>
            </Card>
          );
        })}
      </Box>

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

export default ImageCard;