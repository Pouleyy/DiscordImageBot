import Discord from "discord.js";
import config from "./config.js";
import DBL from "dblapi.js";

import logger from "../server/logger.js";
import utils from "../utils/utils.js";

const client = new Discord.Client(
  {
    intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES']
  }
);
//const dbl = new DBL(config.DISCORD_BOTS_TOKEN, client);

/**
 * Login Discord Bot
 * @returns {Promise}
 */
function clientLogin() {
  return client.login(config.DISCORD_TOKEN);
}

/**
 * Register message listener on DISCORD_CMD_CHAN_ID
 * @param {Function} callback
 */
function onCmdChannelMessage(callback) {
  client.on("message", message => {
    if (message.channel.id === config.DISCORD_CMD_CHAN_ID) {
      callback(message);
    }
  });
}

/**
 * Register message listener on DISCORD_CHAN_ID
 * @param {Function} callback
 */
function onDefaultChannelMessage(callback) {
  client.on("message", message => {
    if (message.channel.id === config.DISCORD_CHAN_ID) {
      callback(message);
    }
  });
}

/**
 * Register message listener on every channels
 * @param {Function} callback
 */
function onMessageEverywhere(callback) {
  client.on("message", message => {
    callback(message);
  });
}

/**
 * Send message on cmd channel
 * @param {String} message
 * @returns {Promise}
 */
function sendOnCmdChannel(message) {
  return client.channels.cache.get(config.DISCORD_CMD_CHAN_ID).send(message);
}

/**
 * Send message on default channel
 * @param {String} message
 * @param {String} [color]
 * @returns {Promise}
 */
function sendOnDefaultChannel(message, color) {
  const embed = new Discord.MessageEmbed()
    .setColor(color ? color : "#551A8B")
    .addField(message, "\u200B");
  return client.channels.cache.get(config.DISCORD_CHAN_ID).send({ embeds: [embed] });
}

/**
 * Send message on requested channel
 * @param {TextChannel} channel
 * @param {String} message
 * @returns {Promise}
 */
function sendOn(channel, message) {
  return channel.send(message);
}

/**
 * Set the game played by the bot
 */
client.on("ready", async () => {
  guildName();
  client.user.setActivity("!help for help", { type: "WATCHING" });
  /* setInterval(() => {
     dbl.postStats(client.guilds.size);
   }, 1800000);*/
});

/**
 * Handle on error event
 */
client.on("error", error => {
  try {
    logger.error(error);
    sendOnDefaultChannel(error);
  } catch (err) {
    logger.info(err);
  }
});

/**
 * New server join :hype:
 */
client.on("guildCreate", guild => {
  sendOnDefaultChannel(
    `I just joined "${guild.name}" server with ${guild.memberCount
    } users on it`,
    "#00ff00"
  );
});

/**
 * Server left :(
 */
client.on("guildDelete", guild => {
  sendOnDefaultChannel(
    `I've been removed from "${guild.name}" server with ${guild.memberCount
    } users on it`,
    "#ff0000"
  );
});

/**
 * Get the bot avatar URL
 * @returns {String}
 */
function getAvatarURL() {
  return client.user.avatarURL;
}

/**
 * Get the bot username
 * @returns {String}
 */
function getUsername() {
  return client.user.username;
}

/**
 * Get the bot ID
 * @returns {Number}
 */
function getID() {
  return client.user.id;
}

/**
 * Get an emoji by its id
 * @returns {String}
 */
function getEmoji(id) {
  return client.emojis.get(id);
}

/**
 *
 */
function guildName() {
  const guilds = client.guilds.cache;
  sendOnDefaultChannel(`I'm on ${guilds.size} servers`);
  guilds.map(guild => {
    sendOnDefaultChannel(
      `I'm on ${guild.name} server with ${guild.memberCount} users on it`
    );
  });
}

export default {
  client,
  clientLogin,
  onCmdChannelMessage,
  onDefaultChannelMessage,
  onMessageEverywhere,
  sendOnCmdChannel,
  sendOnDefaultChannel,
  sendOn,
  getAvatarURL,
  getUsername,
  getID,
  guildName,
  getEmoji
};
