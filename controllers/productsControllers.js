import { db } from "../config/db.js";

export default function index(req, res) {
  const sql = "SELECT * FROM `e-commerce`.products;";
  db.query(sql, (err, results) => {
    if (err)
      return res.status(502).json({
        error: 502,
        message: "invalid query",
      });
    res.json(results);
  });
}
