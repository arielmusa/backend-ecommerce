import { db } from "../config/db.js";
import { sendEmail } from "../utils/sendEmail.js";

// ALL ORDERS

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

// ORDER DETAIL

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

// CREATE ORDER + SEND EMAIL

// Tutti gli userId sono stati assegnati per eseguire il test con Postman; TO DO: riadattare per front-end

export function createOrder(req, res) {
  const userId = 4;
  const { paymentMethod, address } = req.body;

  // Aggiorna l'ordine in stato 'cart' -> confirmed
  const sql = `
    UPDATE orders
    SET status = 'confirmed', payment_method = ?, address = ?
    WHERE user_id = ? AND status = 'cart'
  `;

  db.query(sql, [paymentMethod, address, userId], async (err) => {
    if (err)
      return res.status(502).json({ error: 502, message: "invalid query" });

    // Invio email di conferma (finto)
    try {
      await sendEmail(
        "cliente@email.com",
        "Conferma ordine",
        "Grazie per il tuo ordine!"
      );
      await sendEmail(
        "venditore@email.com",
        "Nuovo ordine ricevuto",
        "Hai ricevuto un nuovo ordine!"
      );
    } catch (e) {
      console.error("Errore invio email", e);
    }

    res.json({ message: "order confirmed and email sent" });
  });
}
