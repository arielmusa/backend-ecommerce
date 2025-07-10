import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

router.get("/:productName", (req, res) => {
  const productName = req.params.productName;
  const folderPath = path.resolve(
    "public/assets/images/products/",
    productName
  );

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      return res.json([]);
    }

    const images = files
      .filter((f) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
      .map((filename) => `/assets/images/products/${productName}/${filename}`);

    res.json(images);
  });
});

export default router;
