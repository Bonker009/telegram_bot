const express = require("express");
const bodyParser = require("body-parser");
const TelegramBot = require("node-telegram-bot-api");
const crypto = require("crypto");

const app = express();
const port = process.env.PORT || 3000;
const botToken = "7493553730:AAFtCR1eBNqxYu5XwyKAuJn1qmPLbex-gjI";
const bot = new TelegramBot(botToken, { polling: true });

app.use(express.json());

app.post("/github-webhook", (req, res) => {
  const { body, headers } = req;

  const secret =
    "62a2922d806a73e66c03f5b6a01fb88346212edbfefe7216653a49a27fe2f51b";
  const payload = JSON.stringify(body);
  const signature = headers["x-hub-signature"];

  if (!validateSignature(signature, payload, secret)) {
    console.error("Invalid GitHub webhook signature");
    return res.status(403).send("Invalid signature");
  }

  if (headers["x-github-event"] === "push") {
    const repository = body.repository.full_name;
    const pushedBy = body.pusher.name;
    const commitCount = body.commits.length;
    const commits = body.commits
      .map((commit) => {
        const commitDetails = [
          `\n- [${commit.message}](${commit.url}) by ${commit.author.name}`,
          `    - *Timestamp:* ${commit.timestamp}`,
          `    - *Added files:* ${commit.added.join(", ") || "None"}`,
          `    - *Modified files:* ${commit.modified.join(", ") || "None"}`,
          `    - *Removed files:* ${commit.removed.join(", ") || "None"}`,
        ];
        return commitDetails.join("\n");
      })
      .join("\n");

    const message =
      `🚀 *Push event in ${repository}*\n` +
      `👤 *Pushed by:* ${pushedBy}\n` +
      `🔵 *Number of commits:* ${commitCount}\n` +
      `📄 *Commits:* ${commits}`;
   const truncatedMessage = message.substring(0, 4096);
    const chatId = "-1002113369147";
    bot
      .sendMessage(chatId, truncatedMessage, { parse_mode: "MarkdownV2" })
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

function validateSignature(signature, payload, secret) {
  const hmac = crypto.createHmac("sha1", secret);
  const digest = Buffer.from(
    "sha1=" + hmac.update(payload).digest("hex"),
    "utf8"
  );
  const checksum = Buffer.from(signature, "utf8");
  return crypto.timingSafeEqual(digest, checksum);
}

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
