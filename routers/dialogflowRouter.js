import express from "express";
import { google } from "googleapis";
import { readFileSync } from "fs";
import fetch from "node-fetch";

const router = express.Router();

const serviceAccount = JSON.parse(
  readFileSync("service-account.json", "utf-8")
);
const PROJECT_ID = serviceAccount.project_id;

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

router.post("/", async (req, res) => {
  const { message, sessionId } = req.body;

  try {
    // TOKEN ACCESS
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    // CALL DIALOGFLOW
    const url = `https://dialogflow.googleapis.com/v2/projects/${PROJECT_ID}/agent/sessions/${sessionId}:detectIntent`;
    const payload = {
      queryInput: {
        text: {
          text: message,
          languageCode: "it",
        },
      },
    };

    const dfResponse = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await dfResponse.json();
    const fulfillmentText = data.queryResult.fulfillmentText;
    const parameters = data.queryResult.parameters || {};
    const productType = parameters.product_type || "";
    const productName = parameters.product_name || "";

    // IF ENTITY = FIND PRODUCT
    if (productType || productName) {
      const searchUrl = `http://localhost:3000/products/search?search=${encodeURIComponent(
        productName
      )}&category=${encodeURIComponent(productType)}`;

      const prodRes = await fetch(searchUrl);
      const prodData = await prodRes.json();

      if (prodData.length > 0) {
        const p = prodData[0];

        // Determina i prezzi correttamente
        const basePrice = parseFloat(p.price);
        const promoPrice = p.promotion_price
          ? parseFloat(p.promotion_price)
          : null;

        const isDiscounted = promoPrice && promoPrice < basePrice;

        return res.json({
          fulfillmentText,
          product: {
            slug: p.slug,
            name: p.name,
            category: p.category_name || "Generico",
            price: basePrice,
            discountPrice: isDiscounted ? promoPrice : null,
            image: p.thumbnail_url || null,
          },
        });
      } else {
        // NO PRODUCT
        return res.json({
          fulfillmentText: `Mi dispiace, non ho trovato risultati per "${productName}".`,
        });
      }
    }

    // NO ENTITY? ONLY TEXT THEN
    return res.json({ fulfillmentText });
  } catch (err) {
    console.error("Errore Dialogflow:", err);
    res.status(500).json({ error: "Errore interno del server" });
  }
});

export default router;
