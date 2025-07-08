import express from "express";

// CONTROLLERS prodotti
import index from "../controllers/productsController.js";
import {
  searchProducts,
  getProductBySlug,
  // getProductById,
  getMostSoldProducts,
  getRecentProducts,
  getBrands,
  getCategories,
} from "../controllers/productsController.js";

// CONTROLLERS ordini
import {
  getOrderDetail,
  createOrder,
} from "../controllers/ordersController.js";

const router = express.Router();

//  PRODUCTS ROUTES

// Lista prodotti (tutti, ordinati per nome asc)
router.get("/products", index);

// Ricerca + ordinamento

router.get("/products/search", searchProducts);
router.get("/brands", getBrands);
router.get("/categories", getCategories);

// Ultimi arrivi
router.get("/products/recent", getRecentProducts);

// Più venduti
router.get("/products/best-sellers", getMostSoldProducts);

// Dettaglio prodotto
router.get("/products/:slug", getProductBySlug);

// ORDERS ROUTES

// Dettaglio ordine
router.get("/orders/:id", getOrderDetail);

// Checkout: conferma ordine
router.post("/orders", createOrder);

export default router;
