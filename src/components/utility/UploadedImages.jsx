import { Card, CardContent, CardMedia, Typography, IconButton } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

function CardComponent({ image, onDownload, onImageClick }) {
  return (
    <Card
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.2)",
        boxShadow: "none",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 2,
        },
      }}
    >
      <CardMedia
        component="img"
        image={image.url}
        alt={image.name}
        sx={{
          height: 160,
          width: "100%",
          objectFit: "cover",
          cursor: "pointer",
          borderBottom: "1px solid rgba(0,0,0,0.2)",
        }}
        onClick={() => onImageClick(image.url)}
        onError={(e) => {
          console.error("Error loading image:", image.url);
        }}
      />

      <CardContent
        sx={{
          p: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          "&:last-child": {
            paddingBottom: "8px",
          },
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "140px",
            cursor: "pointer",
          }}
          title={image.name}
          onClick={() => onImageClick(image.url)}
        >
          {image.name}
        </Typography>

        <IconButton
          onClick={() => onDownload(image.url, image.name)}
          sx={{
            backgroundColor: "#152a59",
            color: "white",
            borderRadius: "7px",
            p: "6px",
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
}

export default CardComponent;