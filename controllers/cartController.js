import { db } from "../config/db.js";

// Tutti gli userId sono stati assegnati per eseguire il test con Postman; TO DO: riadattare per front-end

// GET CART
export function getCart(req, res) {
  const userId = 1;
  const sql = `
    SELECT p.*, op.product_quantity 
    FROM order_product op
    JOIN products p ON op.product_id = p.id
    JOIN orders o ON op.order_id = o.id
    WHERE o.user_id = ? AND o.status = 'cart'
  `;
  db.query(sql, [userId], (err, results) => {
    if (err)
      return res.status(502).json({ error: 502, message: "invalid query" });
    res.json(results);
  });
}

// ADD PRODUCT TO CART

export function addToCart(req, res) {
  const userId = 1;
  const { productId, quantity } = req.body;

  // Trova id dell'ordine in stato 'cart'
  const findOrderSql =
    "SELECT id FROM orders WHERE user_id = ? AND status = 'cart'";
  db.query(findOrderSql, [userId], (err, orderResults) => {
    if (err)
      return res.status(502).json({ error: 502, message: "invalid query" });

    let orderId;
    if (orderResults.length > 0) {
      orderId = orderResults[0].id;
      // Inserisce nel carrello
      const insertSql =
        "INSERT INTO order_product (product_id, order_id, product_quantity) VALUES (?, ?, ?)";
      db.query(insertSql, [productId, orderId, quantity], (err2) => {
        if (err2)
          return res.status(502).json({ error: 502, message: "invalid query" });
        res.json({ message: "added to cart" });
      });
    } else {
      // crea nuovo ordine 'cart'
      const createOrderSql = `
        INSERT INTO orders (user_id, order_number, payment_method, address, total, status, shipping_date, billing_address, free_shipping, created_at)
        VALUES (?, ?, 'none', 'none', 0, 'cart', CURDATE(), 'none', 0, CURDATE())
      `;
      db.query(createOrderSql, [userId, Date.now()], (err3, createRes) => {
        if (err3)
          return res.status(502).json({ error: 502, message: "invalid query" });
        orderId = createRes.insertId;
        const insertSql =
          "INSERT INTO order_product (product_id, order_id, product_quantity) VALUES (?, ?, ?)";
        db.query(insertSql, [productId, orderId, quantity], (err4) => {
          if (err4)
            return res
              .status(502)
              .json({ error: 502, message: "invalid query" });
          res.json({ message: "cart created and product added" });
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
    if (err)
      return res.status(502).json({ error: 502, message: "invalid query" });
    res.json({ message: "quantity updated" });
  });
}
