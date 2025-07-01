import { db } from "../config/db.js";

// ALL PRODUCTS

export default function index(req, res) {
  const sql = "SELECT * FROM `products` ORDER BY `name` ASC;";
  db.query(sql, (err, results) => {
    if (err)
      return res.status(502).json({
        error: 502,
        message: "invalid query",
      });
    res.json(results);
  });
}

// PRODUCT DETAIL

export function getProductById(req, res) {
  const { id } = req.params;
  const sql = "SELECT * FROM products WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err)
      return res.status(502).json({ error: 502, message: "invalid query" });
    if (results.length === 0)
      return res.status(404).json({ error: 404, message: "product not found" });
    res.json(results[0]);
  });
}

// SEARCH + SORT

export function searchProducts(req, res) {
  const search = req.query.search || "";
  const sort = req.query.sort || "name_asc"; // default

  let orderBy = "ORDER BY name ASC";
  if (sort === "price_asc") orderBy = "ORDER BY price ASC";
  else if (sort === "price_desc") orderBy = "ORDER BY price DESC";
  else if (sort === "recent") orderBy = "ORDER BY created_at DESC";

  const sql = `SELECT * FROM products WHERE name LIKE ? ${orderBy}`;
  db.query(sql, [`%${search}%`], (err, results) => {
    if (err)
      return res.status(502).json({ error: 502, message: "invalid query" });
    res.json(results);
  });
}

// LATEST ARRIVALS

export function getRecentProducts(req, res) {
  const sql = "SELECT * FROM products ORDER BY created_at DESC LIMIT 10";
  db.query(sql, (err, results) => {
    if (err)
      return res.status(502).json({ error: 502, message: "invalid query" });
    res.json(results);
  });
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
  db.query(sql, (err, results) => {
    if (err)
      return res.status(502).json({ error: 502, message: "invalid query" });
    res.json(results);
  });
}
