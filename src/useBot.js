import TelegramBot from "node-telegram-bot-api";
import chunk from "lodash/chunk";
import queryString from "query-string";

import { getGyms, querySlots } from "./data";

export default function useBot({ token, botURL, mixpanel }) {
  const bot = new TelegramBot(token, { polling: true });

  bot.setWebHook(`${botURL}/bot${token}`);

  bot.onText(/\/start/, async ({ message_id, from, chat, date, text }) => {
    mixpanel.track("New user", {
      distinct_id: chat.id,
    });

    bot.sendMessage(
      chat.id,
      "🧗 *Climbwhere SG*\nHello\\! To check the slots at your favourite local gyms, use */slots*",
      {
        parse_mode: "MarkdownV2",
      }
    );
  });

  bot.onText(/\/slots/, async ({ message_id, from, chat, date, text }) => {
    mixpanel.track("Check slots", {
      distinct_id: chat.id,
    });
    const gyms = await getGyms();
    bot.sendMessage(
      chat.id,
      `${
        ["Sure thing,", "Okay!", "Yep okay,"][Math.floor(3 * Math.random())]
      } which gym you want to check?`,
      {
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
      }
    );
  });

  bot.onText(/\/moreinfo/, async ({ message_id, from, chat, date, text }) => {
    mixpanel.track("More info", { distinct_id: chat.id });
    bot.sendMessage(
      chat.id,
      "Check out our website at https://climbwhere.sg for more information and better filtering options!"
    );
  });

  bot.on("callback_query", async ({ id, from, data }) => {
    const queryParams = queryString.parse(data);
    const results = await querySlots(queryParams);
    bot.answerCallbackQuery(id, "Done");
    bot.sendMessage(from.id, results, {
      parse_mode: "MarkdownV2",
    });
  });

  return bot;
}
