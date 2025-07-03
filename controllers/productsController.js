import { db } from "../config/db.js";

// ALL PRODUCTS
export default function index(req, res) {
  db.query("SELECT * FROM products ORDER BY name ASC", (err, data) => {
    if (err) {
      res.status(502).json({ error: 502, message: "Errore nella query" });
    } else {
      res.json(data);
    }
  });
}

// PRODUCT DETAIL
export function getProductById(req, res) {
  const id = req.params.id;
  db.query("SELECT * FROM products WHERE id = ?", [id], (err, data) => {
    if (err) {
      res.status(502).json({ error: 502, message: "Errore nella query" });
    } else if (data.length === 0) {
      res.status(404).json({ error: 404, message: "Prodotto non trovato" });
    } else {
      res.json(data[0]);
    }
  });
}

// SEARCH + SORT
export function searchProducts(req, res) {
  const search = req.query.search || "";
  const sort = req.query.sort || "name_asc";

  let orderBy = "ORDER BY name ASC";
  if (sort === "price_asc") orderBy = "ORDER BY price ASC";
  else if (sort === "price_desc") orderBy = "ORDER BY price DESC";
  else if (sort === "recent") orderBy = "ORDER BY created_at DESC";

  const sql = `SELECT * FROM products WHERE name LIKE ? ${orderBy}`;
  db.query(sql, [`%${search}%`], (err, data) => {
    if (err) {
      res.status(502).json({ error: 502, message: "Errore nella query" });
    } else {
      res.json(data);
    }
  });
}

// LATEST PRODUCTS
export function getRecentProducts(req, res) {
  db.query(
    "SELECT * FROM products ORDER BY created_at DESC LIMIT 10",
    (err, data) => {
      if (err) {
        res.status(502).json({ error: 502, message: "Errore nella query" });
      } else {
        res.json(data);
      }
    }
  );
}

// BEST SELLERS
export function getMostSoldProducts(req, res) {
  const sql = `
    SELECT p.*, COUNT(op.product_id) as sold_count
    FROM products p
    JOIN order_product op ON p.id = op.product_id
    GROUP BY p.id
    ORDER BY sold_count DESC
    LIMIT 10
  `;
  db.query(sql, (err, data) => {
    if (err) {
      res.status(502).json({ error: 502, message: "Errore nella query" });
    } else {
      res.json(data);
    }
  });
}
