import express from "express";
import index from "../controllers/productsController.js";
import indexOrders, { showOrders } from "../controllers/ordersController.js";

const router = express.Router();

// PRODUCTS

router.get("/products", index);

// ORDERS

router.get("/orders", indexOrders);

router.get("orders/:id", showOrders);

export default router;
