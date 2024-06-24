const TelegramBot = require("node-telegram-bot-api");

const botToken = "7020662782:AAG5T5I2fSBnRnyJun5A5m6ghw8eSTHLmhM";
const bot = new TelegramBot(botToken, { polling: true });

bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  console.log(`Your chat ID: ${chatId}`);

  process.exit();
});
