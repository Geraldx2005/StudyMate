import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";
import { CircularProgress, Box, Typography, Card, CardContent, CardMedia, IconButton, Skeleton } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ImageIcon from "@mui/icons-material/Image";

export const triggerImageRefresh = (imageName) => {
  window.dispatchEvent(
    new CustomEvent("newImageUploaded", {
      detail: { imageName },
    })
  );
};

// Memoized skeleton component to prevent unnecessary re-renders
const SkeletonCard = React.memo(() => (
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
    <Box sx={{ width: "100%", height: "200px", flexShrink: 0 }}>
      <Skeleton 
        variant="rectangular" 
        width="100%" 
        height="100%" 
        sx={{ 
          transform: 'none',
          bgcolor: 'grey.100'
        }} 
      />
    </Box>

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
));

// Memoized image card component to prevent unnecessary re-renders
const MemoizedImageCard = React.memo(({ 
  image, 
  isImageLoaded, 
  onImageLoad, 
  onImageError, 
  onDownload, 
  onImageClick,
  observerRef 
}) => (
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
      transition: "box-shadow 0.2s ease-in-out",
      "&:hover": {
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      },
    }}
  >
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
      onClick={() => onImageClick(image.url)}
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
          transform: 'translateZ(0)',
        }}
        onLoad={() => onImageLoad(image.id)}
        onError={() => onImageError(image.id, image.url)}
        loading="lazy"
      />
    </Box>

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
          onClick={() => onImageClick(image.url)}
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
        onClick={() => onDownload(image.url, image.name)}
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
));

function ImageCard() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [imageLoadStates, setImageLoadStates] = useState({});
  const preloadedImages = useRef(new Set());
  const observerRef = useRef();
  const imageCache = useRef(new Map()); // Cache for downloaded URLs

  // Optimized Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
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
        rootMargin: '100px 0px',
        threshold: 0.1,
      }
    );

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Update observer when images change
  useEffect(() => {
    if (!observerRef.current) return;

    // Re-observe all images when the images array changes
    const imageElements = document.querySelectorAll('[data-img-url]');
    imageElements.forEach(el => {
      observerRef.current.observe(el);
    });

    return () => {
      imageElements.forEach(el => {
        observerRef.current.unobserve(el);
      });
    };
  }, [images]);

  // Optimized preload function with caching
  const preloadImage = useCallback((url, imageId) => {
    if (preloadedImages.current.has(url)) {
      setImageLoadStates(prev => ({ ...prev, [imageId]: true }));
      return Promise.resolve();
    }

    return new Promise((resolve) => {
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

  // Fetch function with batching
  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const fnlPath = sessionStorage.getItem("fnlPath");
      console.log("Final path from sessionStorage:", fnlPath);
      
      const listRef = ref(storage, `${fnlPath}/`);
      const res = await listAll(listRef);

      const batchSize = 4;
      const imageBatches = [];

      for (let i = 0; i < res.items.length; i += batchSize) {
        imageBatches.push(res.items.slice(i, i + batchSize));
      }

      let imageData = [];
      const initialLoadStates = {};

      for (const batch of imageBatches) {
        const batchPromises = batch.map(async (itemRef) => {
          const imageId = `${itemRef.name}-${Date.now()}`;
          initialLoadStates[imageId] = false;
          
          return {
            url: await getDownloadURL(itemRef),
            name: itemRef.name,
            size: "Image",
            uploaded: new Date().toLocaleDateString(),
            id: imageId,
          };
        });

        const batchResults = await Promise.all(batchPromises);
        imageData = [...imageData, ...batchResults];
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      setImages(imageData);
      setLastUpdated(Date.now());
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

  // Event listener for new image uploads
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

  // Memoized download handler with caching
  const handleDownload = useCallback(async (url, filename) => {
    // Check cache first
    if (imageCache.current.has(url)) {
      const cachedBlob = imageCache.current.get(url);
      triggerDownload(cachedBlob, filename);
      return;
    }

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Cache the blob
      imageCache.current.set(url, blob);
      
      triggerDownload(blob, filename);
    } catch (error) {
      console.error("Download failed:", error);
    }
  }, []);

  const triggerDownload = (blob, filename) => {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  const handleImageClick = useCallback((url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  // Memoized header component
  const HeaderSection = useMemo(() => (
    <Box mb={3}>
      <Typography variant="h6" component="h2" fontWeight="600" color="#152a59">
        Uploaded Images ({images.length})
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Last updated: {new Date(lastUpdated).toLocaleTimeString()}
      </Typography>
    </Box>
  ), [images.length, lastUpdated]);

  // Memoized empty state
  const EmptyState = useMemo(() => (
    <Box textAlign="center" mt={6}>
      <ImageIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        No images uploaded yet.
      </Typography>
    </Box>
  ), []);

  // Loading state
  if (loading && images.length === 0) {
    return (
      <Box p={2}>
        <Box mb={3}>
          <Skeleton variant="text" width={200} height={32} sx={{ bgcolor: 'grey.100' }} />
          <Skeleton variant="text" width={150} height={20} sx={{ bgcolor: 'grey.100', mt: 1 }} />
        </Box>

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
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box p={2}>
      {HeaderSection}

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
        {images.map((image) => (
          <MemoizedImageCard
            key={image.id}
            image={image}
            isImageLoaded={imageLoadStates[image.id]}
            onImageLoad={handleImageLoad}
            onImageError={handleImageError}
            onDownload={handleDownload}
            onImageClick={handleImageClick}
            observerRef={observerRef}
          />
        ))}
      </Box>

      {images.length === 0 && !loading && EmptyState}
    </Box>
  );
}

export default React.memo(ImageCard);