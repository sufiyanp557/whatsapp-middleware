const express = require("express");

const app = express();
app.use(express.json());

// Change NOTHING here
const VERIFY_TOKEN = "olyvr";

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.send("WhatsApp middleware is running on Railway");
});

/**
 * Webhook verification (Meta)
 */
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    return res.status(200).send(challenge);
  }

  console.log("Webhook verification failed");
  return res.sendStatus(403);
});

/**
 * Webhook receiver
 */
app.post("/webhook", (req, res) => {
  console.log("Incoming webhook:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
