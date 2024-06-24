const express = require("express");
const bodyParser = require("body-parser");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
const port = process.env.PORT || 3000;
const botToken = "7020662782:AAG5T5I2fSBnRnyJun5A5m6ghw8eSTHLmhM";
const bot = new TelegramBot(botToken);
app.use(bodyParser.json());

app.post("/github-webhook", (req, res) => {
  const { body } = req;
  if (req.headers["x-github-event"] === "push") {
    const repository = body.repository.full_name;
    const pushedBy = body.pusher.name;
    const commitCount = body.commits.length;

    const message =
      `🚀 Push event in ${repository}\n` +
      `👤 Pushed by: ${pushedBy}\n` +
      `🔵 Number of commits: ${commitCount}`;
    const chatId = "1144386354";
    bot
      .sendMessage(chatId, message)
      .then(() => {
        console.log("Message sent to Telegram successfully");
        res.status(200).send("Message sent to Telegram successfully");
      })
      .catch((error) => {
        console.error("Error sending message to Telegram:", error.message);
        res.status(500).send("Error sending message to Telegram");
      });
  } else {
    res.status(200).send("Received webhook event");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
