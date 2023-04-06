#!/usr/bin/node

// Require the necessary discord.js classes
const {Client, Intents} = require(`discord.js`);
const {token} = process.env;

// Create a new Discord client instance
const client = new Client({
  intents: [Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES],
});

const mascot = require('./functions/mascot/mascot');
const spoofy = require('./functions/spotify/spotify');

client.on(`ready`, (async () => {
  console.log(`Ready`);
  spoofy.spotifyToken();
  mascot.masBot(client);
}));

// Fires on every message
client.on(`messageCreate`, async (msg) => {
  spoofy.spotifyBot(msg);
});


// Everything past this point is simply used for troubleshooting.
client.once(`reconnecting`, () => {
  console.log(`Reconnecting!`);
});

client.once(`disconnect`, () => {
  console.log(`Disconnect!`);
});

client.on(`warn`, async (info) => {
  console.error(new Date() + `: Discord client encountered a warning`);
  console.log(info);
});
client.on(`error`, async (error) => {
  console.error(new Date() + `: Discord client encountered an error`);
  console.log(error);
});
client.on(`unhandledReject`, console.log);

client.login(token);
