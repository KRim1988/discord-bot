import { Client, GatewayIntentBits } from "discord.js";
import axios from "axios";

const TOKEN = process.env.BOT_TOKEN;
const N8N_WEBHOOK = process.env.N8N_WEBHOOK;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages
  ],
  partials: ["CHANNEL"]  // ważne! pozwala odbierać DM
});

// Po starcie
client.on("ready", () => {
  console.log(`Bot zalogowany jako: ${client.user.tag}`);
});

// ⭐ ZMIANA 1 — odbiór DM i wysyłka channelId do n8n
client.on("messageCreate", async (message) => {
  try {
    // ignoruj wiadomości botów
    if (message.author.bot) return;

    // jeżeli to DM (Direct Message)
    if (message.channel.type === 1) {  
      console.log("DM od:", message.author.username, "-", message.content);

      // wysyłamy pełne dane do webhooka n8n
      await axios.post(N8N_WEBHOOK, {
        userId: message.author.id,
        username: message.author.username,
        content: message.content,
        channelId: message.channel.id,       // <<< NAJWAŻNIEJSZE
        timestamp: new Date().toISOString()
      });

      // odpowiedź bota (opcjonalna)
      await message.reply("Dziękuję! Jesteś już zarejestrowany ✔");
    }

  } catch (error) {
    console.error("Błąd DM:", error.message);
  }
});

// Logowanie bota
client.login(TOKEN);
