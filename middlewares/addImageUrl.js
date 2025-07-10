const baseUrl = "http://localhost:3000/";

const addImageUrl = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    const appendThumbnailUrl = (item) => {
      if (
        item &&
        item.thumbnail_url &&
        typeof item.thumbnail_url === "string" &&
        !item.thumbnail_url.startsWith("http")
      ) {
        item.thumbnail_url = baseUrl + item.thumbnail_url;
      }
    };

    if (Array.isArray(data)) {
      data.forEach(appendThumbnailUrl);
    } else if (data && typeof data === "object") {
      appendThumbnailUrl(data);
    } else {
      console.warn("Unexpected data format:", data);
    }

    return originalJson.call(this, data);
  };

  next();
};

export default addImageUrl;
