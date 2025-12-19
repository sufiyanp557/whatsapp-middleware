const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("RENDER IS RUNNING THIS CODE");
});

app.get("/webhook", (req, res) => {
  res.send("WEBHOOK ROUTE HIT");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("DIAGNOSTIC SERVER STARTED");
});
