import TelegramBot from "node-telegram-bot-api";
import chunk from "lodash/chunk";
import queryString from "query-string";

import { getGyms, querySlots } from "./data";

export default function useBot({ token, botURL }) {
  const bot = new TelegramBot(token, { polling: true });

  bot.setWebHook(`${botURL}/bot${token}`);

  //  message_id, from, chat, date, text
  bot.onText(/\/start/, async ({ message_id, from, chat, date, text }) => {
    bot.sendMessage(
      chat.id,
      `Hello there, ${from.first_name}! Welcome to the Climbwhere Telegram bot!`
    );

    const gyms = await getGyms();

    bot.sendMessage(chat.id, "To begin, select which gym you want to check:", {
      reply_markup: {
        one_time_keyboard: true,
        inline_keyboard: chunk(
          gyms.map((g) => ({
            text: g,
            callback_data: queryString.stringify({ gym: g }),
          })),
          1
        ),
      },
    });

    bot.on("callback_query", async ({ id, from, data }) => {
      const queryParams = queryString.parse(data);
      const results = await querySlots(queryParams);
      console.log(results.length);
      bot.answerCallbackQuery(id, "Done");
      bot.sendMessage(from.id, results);
    });
  });

  return bot;
}
