const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("WhatsApp Middleware is running");
});

// Webhook verification (Meta)
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Webhook receiver
app.post("/webhook", (req, res) => {
  console.log("Incoming WhatsApp Event:", JSON.stringify(req.body));
  res.sendStatus(200);
});

// Send message API
app.post("/send", async (req, res) => {
  const { to, message } = req.body;

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json(error.response?.data || error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));
