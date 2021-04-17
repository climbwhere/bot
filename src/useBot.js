import TelegramBot from "node-telegram-bot-api";

export default function useBot({ token, botURL }) {
  const bot = new TelegramBot(token, { polling: true });

  bot.setWebHook(`${botURL}/bot${token}`);

  bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    console.info(msg);

    bot.sendMessage(chatId, "Received your message");
  });

  return bot;
}
