import dotenv from "dotenv";
import express from "express";
import moment from "moment-timezone";
import Mixpanel from "mixpanel";

import useBot from "./useBot";

moment.tz.setDefault("Asia/Singapore");

dotenv.config();

const {
  PORT,
  TELEGRAM_BOT_TOKEN,
  BOT_SERVER_URL,
  MIXPANEL_TOKEN,
} = process.env;

const mixpanel = Mixpanel.init(MIXPANEL_TOKEN);

const bot = useBot({
  token: TELEGRAM_BOT_TOKEN,
  botURL: BOT_SERVER_URL,
  mixpanel,
});

const app = express();

app.use(express.json());

app.post(`/bot${TELEGRAM_BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Express server is listening on ${PORT}`);
});
