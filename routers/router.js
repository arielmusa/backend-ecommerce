import express from "express";
import index from "../controllers/productsControllers.js";
const router = express.Router();

router.get("/products", index);

export default router;
