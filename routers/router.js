import express from "express";

// CONTROLLERS prodotti
import index from "../controllers/productsController.js";
import {
  searchProducts,
  getProductById,
  getMostSoldProducts,
  getRecentProducts,
} from "../controllers/productsController.js";

// CONTROLLERS ordini
import indexOrders, {
  showOrders,
  createOrder,
} from "../controllers/ordersController.js";

// CONTROLLERS carrello
import {
  getCart,
  addToCart,
  updateCart,
} from "../controllers/cartController.js";

const router = express.Router();

//  PRODUCTS ROUTES

// Lista prodotti (tutti, ordinati per nome asc)
router.get("/products", index);

// Ricerca + ordinamento

router.get("/products/search", searchProducts);

// Ultimi arrivi
router.get("/products/recent", getRecentProducts);

// Più venduti
router.get("/products/best-sellers", getMostSoldProducts);

// Dettaglio prodotto
router.get("/products/:id", getProductById);

// ORDERS ROUTES

// Lista ordini
router.get("/orders", indexOrders);

// Dettaglio ordine
router.get("/orders/:id", showOrders);

// Checkout: conferma ordine
router.post("/orders", createOrder);

export default router;
