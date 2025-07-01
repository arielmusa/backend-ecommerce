import { db } from "../config/db.js";

export default function indexOrders(req, res) {
  const sql = "SELECT * FROM `orders` ORDER BY `created_at` DESC;";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(502).json({
        error: 502,
        message: "invalid query",
      });
    }
    res.json(results);
  });
}

export function showOrders(req, res) {
  const { id } = req.params;
  const sql = "SELECT * FROM `orders` WHERE id = ?;";
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(502).json({ error: 502, message: "invalid query" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 404, message: "order not found" });
    }
    res.json(results[0]);
  });
}
