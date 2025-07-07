import { db } from "../config/db.js";
import { sendEmail } from "../utils/sendEmail.js";

// ORDER DETAIL
export function getOrderDetail(req, res) {
  const orderId = req.params.id;

  // 1. Recupera info ordine
  const orderSql = `
    SELECT o.*, u.name, u.surname, u.email, u.phone
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.id = ?
  `;

  db.query(orderSql, [orderId], (err1, orderResult) => {
    if (err1 || orderResult.length === 0) {
      return res
        .status(404)
        .json({ error: 404, message: "Ordine non trovato" });
    }

    const order = orderResult[0];

    // 2. Recupera i prodotti collegati
    const productSql = `
      SELECT p.id, p.name, p.thumbnail_url, p.price, op.product_quantity
      FROM order_product op
      JOIN products p ON op.product_id = p.id
      WHERE op.order_id = ?
    `;

    db.query(productSql, [orderId], (err2, productResult) => {
      if (err2) {
        return res
          .status(502)
          .json({ error: 502, message: "Errore recupero prodotti" });
      }

      res.json({
        order,
        products: productResult,
      });
    });
  });
}
// CREATE ORDER + SEND EMAIL

export async function createOrder(req, res) {
  const { user, paymentMethod, products } = req.body;

  // ✅ Validazione iniziale
  if (!user || !products || products.length === 0 || !paymentMethod) {
    return res.status(400).json({
      error: 400,
      message: "Dati mancanti o non validi",
    });
  }

  // ✅ Validazione prodotti
  const invalidItem = products.find(
    (item) =>
      !item.productId || typeof item.quantity !== "number" || item.quantity < 1
  );

  if (invalidItem) {
    return res.status(400).json({
      error: 400,
      message: `Prodotto non valido: ID ${invalidItem.productId}, quantità ${invalidItem.quantity}`,
    });
  }

  const orderNumber = Math.floor(Math.random() * 1000000);

  // 🔎 Verifica se utente esiste già
  const checkUserSql = "SELECT id FROM users WHERE email = ?";
  db.query(checkUserSql, [user.email], (err1, result1) => {
    if (err1) {
      console.log("Errore verifica utente:", err1);
      return res
        .status(502)
        .json({ error: 502, message: "Errore verifica utente" });
    }

    if (result1.length > 0) {
      const userId = result1[0].id;
      createOrderWithUser(userId);
    } else {
      // 👤 Inserimento nuovo utente
      const insertUserSql = `
        INSERT INTO users (name, surname, email, phone, address, postal_code, city, province, country, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(
        insertUserSql,
        [
          user.name,
          user.surname,
          user.email,
          user.phone,
          user.address,
          user.postal_code,
          user.city,
          user.province,
          user.country,
          user.notes,
        ],
        (err2, result2) => {
          if (err2) {
            console.log("Errore inserimento utente:", err2);
            return res
              .status(502)
              .json({ error: 502, message: "Errore creazione utente" });
          }

          const userId = result2.insertId;
          createOrderWithUser(userId);
        }
      );
    }

    // 🎯 Creazione ordine + prodotti
    function createOrderWithUser(userId) {
      const insertOrderSql = `
        INSERT INTO orders (user_id, order_number, payment_method, address, total, status)
        VALUES (?, ?, ?, ?, 0, 'confirmed')
      `;
      db.query(
        insertOrderSql,
        [userId, orderNumber, paymentMethod, user.address],
        (err3, result3) => {
          if (err3) {
            console.log("Errore creazione ordine:", err3);
            return res
              .status(502)
              .json({ error: 502, message: "Errore ordine" });
          }

          const orderId = result3.insertId;
          let total = 0;
          let inseriti = 0;

          products.forEach((item) => {
            db.query(
              "SELECT price FROM products WHERE id = ?",
              [item.productId],
              (err4, result4) => {
                if (err4 || result4.length === 0) return;

                const price = result4[0].price;
                total += price * item.quantity;

                const insertProductSql = `
                INSERT INTO order_product (product_id, order_id, product_quantity)
                VALUES (?, ?, ?)
              `;
                db.query(
                  insertProductSql,
                  [item.productId, orderId, item.quantity],
                  (err5) => {
                    if (err5) return;

                    inseriti++;
                    if (inseriti === products.length) {
                      db.query(
                        "UPDATE orders SET total = ? WHERE id = ?",
                        [total, orderId],
                        async (err6) => {
                          if (err6) {
                            return res
                              .status(502)
                              .json({ error: 502, message: "Errore totale" });
                          }

                          // 📧 Invio email utente e venditore
                          try {
                            await sendEmail(
                              user.email,
                              "Conferma ordine",
                              `Ciao ${user.name}, grazie per il tuo ordine n° ${orderNumber}!`
                            );

                            await sendEmail(
                              "venditore@email.com",
                              "Nuovo ordine ricevuto",
                              `Hai ricevuto un nuovo ordine da ${user.name} ${user.surname}.`
                            );
                          } catch (emailErr) {
                            console.log("Errore invio email:", emailErr);
                          }

                          res.json({
                            message: "Ordine completato e email inviate!",
                            orderId,
                            total,
                          });
                        }
                      );
                    }
                  }
                );
              }
            );
          });
        }
      );
    }
  });
}
