import { db } from "../config/db.js";

// CART DETAIL
export function getCart(req, res) {
  const userId = 1;
  const sql =
    "SELECT p.*, op.product_quantity FROM order_product op JOIN products p ON op.product_id = p.id JOIN orders o ON op.order_id = o.id WHERE o.user_id = ? AND o.status = 'cart'";
  db.query(sql, [userId], (err, data) => {
    if (err) {
      res.status(502).json({ error: 502, message: "Errore nella query" });
    } else {
      res.json(data);
    }
  });
}

// ADD PRODUCT TO CART
export function addToCart(req, res) {
  const userId = 1;
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    res.status(400).json({ error: 400, message: "Controlla i dati" });
    return;
  }

  const findSql = "SELECT id FROM orders WHERE user_id = ? AND status = 'cart'";
  db.query(findSql, [userId], (err, result) => {
    if (err) {
      res.status(502).json({ error: 502, message: "Errore nella query" });
      return;
    }

    if (result.length > 0) {
      const orderId = result[0].id;
      const insertSql =
        "INSERT INTO order_product (product_id, order_id, product_quantity) VALUES (?, ?, ?)";
      db.query(insertSql, [productId, orderId, quantity], (err2) => {
        if (err2) {
          res.status(502).json({ error: 502, message: "Errore inserimento" });
        } else {
          res.json({ message: "Prodotto aggiunto" });
        }
      });
    } else {
      const newOrderNumber = Math.floor(Math.random() * 1000000);
      const createSql =
        "INSERT INTO orders (user_id, order_number, payment_method, address, total, status) VALUES (?, ?, 'none', 'none', 0, 'cart')";
      db.query(createSql, [userId, newOrderNumber], (err3, result2) => {
        if (err3) {
          res
            .status(502)
            .json({ error: 502, message: "Errore creazione ordine" });
          return;
        }

        const newOrderId = result2.insertId;
        const insertSql =
          "INSERT INTO order_product (product_id, order_id, product_quantity) VALUES (?, ?, ?)";
        db.query(insertSql, [productId, newOrderId, quantity], (err4) => {
          if (err4) {
            res.status(502).json({ error: 502, message: "Errore inserimento" });
          } else {
            res.json({ message: "Carrello nuovo creato e prodotto inserito" });
          }
        });
      });
    }
  });
}

// CHANGE QUANTITY
export function updateCart(req, res) {
  const { orderProductId, quantity } = req.body;
  const sql = "UPDATE order_product SET product_quantity = ? WHERE id = ?";
  db.query(sql, [quantity, orderProductId], (err) => {
    if (err) {
      res.status(502).json({ error: 502, message: "Errore nella query" });
    } else {
      res.json({ message: "Quantità aggiornata" });
    }
  });
}
