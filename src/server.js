import dotenv from "dotenv";
import express from "express";
import useBot from "./useBot";

dotenv.config();

const { PORT, TELEGRAM_BOT_TOKEN, BOT_SERVER_URL } = process.env;

const bot = useBot({ token: TELEGRAM_BOT_TOKEN, botURL: BOT_SERVER_URL });

const app = express();

app.use(express.json());

app.post(`/bot${TELEGRAM_BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Express server is listening on ${PORT}`);
});
