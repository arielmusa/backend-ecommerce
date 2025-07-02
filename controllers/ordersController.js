import { db } from "../config/db.js";
import { sendEmail } from "../utils/sendEmail.js";

// ALL ORDERS
export default function indexOrders(req, res) {
  db.query("SELECT * FROM orders ORDER BY created_at DESC", (err, data) => {
    if (err) {
      res.status(502).json({ error: 502, message: "Errore nella query" });
    } else {
      res.json(data);
    }
  });
}

// ORDER DETAIL
export function showOrders(req, res) {
  const id = req.params.id;
  db.query("SELECT * FROM orders WHERE id = ?", [id], (err, data) => {
    if (err) {
      res.status(502).json({ error: 502, message: "Errore nella query" });
    } else if (data.length === 0) {
      res.status(404).json({ error: 404, message: "Ordine non trovato" });
    } else {
      res.json(data[0]);
    }
  });
}

// CREATE ORDER + SEND EMAIL
export async function createOrder(req, res) {
  const userId = 1;
  const { paymentMethod, address } = req.body;

  const findSql =
    "SELECT id FROM orders WHERE user_id = ? AND status = 'cart' LIMIT 1";
  db.query(findSql, [userId], (err, cart) => {
    if (err) {
      res.status(502).json({ error: 502, message: "Errore nella query" });
      return;
    }

    if (cart.length === 0) {
      res.status(404).json({ error: 404, message: "Carrello non trovato" });
      return;
    }

    const orderId = cart[0].id;
    const totalSql =
      "SELECT SUM(p.price * op.product_quantity) AS total FROM order_product op JOIN products p ON op.product_id = p.id WHERE op.order_id = ?";
    db.query(totalSql, [orderId], async (err2, totalData) => {
      if (err2) {
        res.status(502).json({ error: 502, message: "Errore nel totale" });
        return;
      }

      const total = totalData[0].total || 0;
      const updateSql =
        "UPDATE orders SET status = 'confirmed', payment_method = ?, address = ?, total = ? WHERE id = ?";
      db.query(
        updateSql,
        [paymentMethod, address, total, orderId],
        async (err3) => {
          if (err3) {
            res
              .status(502)
              .json({ error: 502, message: "Errore aggiornamento" });
            return;
          }

          try {
            await sendEmail(
              "cliente@email.com",
              "Conferma ordine",
              "Grazie per il tuo ordine!"
            );
            await sendEmail(
              "venditore@email.com",
              "Nuovo ordine",
              "Hai ricevuto un ordine!"
            );
          } catch (e) {
            console.log("Errore email:", e);
          }

          res.json({
            message: "Ordine confermato ed email inviata",
            orderId,
            total,
          });
        }
      );
    });
  });
}
