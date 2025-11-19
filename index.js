const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const axios = require('axios');

const TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL; // Twój webhook2
const GUILD_ID = process.env.GUILD_ID;       // Serwer gdzie bot działa

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

client.once('ready', () => {
    console.log(`Bot zalogowany jako: ${client.user.tag}`);
});

/**
 * Tworzy prywatny kanał dla użytkownika (jeśli nie istnieje)
 */
async function ensurePrivateChannel(userId) {
    const guild = await client.guilds.fetch(GUILD_ID);
    const channels = await guild.channels.fetch();

    // Szukamy kanału
    let channel = channels.find(c => c.name === `pp-${userId}`);

    if (!channel) {
        console.log(`Tworzę kanał dla: ${userId}`);

        channel = await guild.channels.create({
            name: `pp-${userId}`,
            type: 0, // CHANNEL_TEXT
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: userId,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages
                    ]
                },
                {
                    id: client.user.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages
                    ]
                }
            ]
        });
    }

    return channel.id;
}

client.on('messageCreate', async (message) => {

    if (message.author.bot) return;

    const userId = message.author.id;
    const username = message.author.username;
    const content = message.content;
    const timestamp = message.createdTimestamp;

    // tworzymy lub pobieramy prywatny kanał
    const privateChannelId = await ensurePrivateChannel(userId);

    // wysyłamy do webhook2
    await axios.post(WEBHOOK_URL, {
        userId,
        username,
        content,
        privateChannelId,
        timestamp
    });

    console.log(`Wysłano event dla użytkownika ${username}`);
});

client.login(TOKEN);
