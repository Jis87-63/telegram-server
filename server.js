import express from "express";
import dotenv from "dotenv";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import input from "input";

dotenv.config();

const apiId = Number(process.env.API_ID);
const apiHash = process.env.API_HASH;

const stringSession = new StringSession("");

const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});

const app = express();

app.get("/", (req, res) => {
  res.json({
    status: "Telegram server running"
  });
});

app.get("/connect", async (req, res) => {

  await client.start({
    phoneNumber: async () => await input.text("Phone number: "),
    password: async () => await input.text("Password: "),
    phoneCode: async () => await input.text("Code: "),
    onError: (err) => console.log(err),
  });

  console.log("Session:", client.session.save());

  res.json({
    status: "Telegram connected"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
