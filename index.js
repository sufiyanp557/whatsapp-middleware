const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// ==========================
// ENV VARIABLES (Render)
// ==========================
const VERIFY_TOKEN = process.env.VERIFY_TOKEN; // must be "olyvr"
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// ==========================
// HEALTH CHECK
// ==========================
app.get("/", (req, res) => {
  res.send("WhatsApp Middleware is running");
});

// ==========================
// META WEBHOOK VERIFICATION
// ==========================
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully");
    return res.status(200).send(challenge);
  }

  console.log("❌ Webhook verification failed");
  return res.sendStatus(403);
});

// ==========================
// RECEIVE WHATSAPP EVENTS
// ==========================
app.post("/webhook", (req, res) => {
  console.log("📩 Incoming webhook:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

// ==========================
// SEND WHATSAPP MESSAGE API
// ==========================
app.post("/send", async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: "to and message are required" });
  }

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Send message error:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
});

// ==========================
// START SERVER
// ==========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
