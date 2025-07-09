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
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const url = `https://dialogflow.googleapis.com/v2/projects/${PROJECT_ID}/agent/sessions/${sessionId}:detectIntent`;

    const payload = {
      queryInput: {
        text: {
          text: message,
          languageCode: "it",
        },
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    res.json(data.queryResult);
  } catch (err) {
    console.error("Errore Dialogflow:", err);
    res.status(500).json({ error: "Errore interno del server" });
  }
});

export default router;
