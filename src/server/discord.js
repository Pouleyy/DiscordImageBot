import Discord from "discord.js";
import config from "./config";
import DBL from "dblapi.js";

import logger from "../server/logger";

const client = new Discord.Client();
const dbl = new DBL(config.DISCORD_BOTS_TOKEN, client);
let startDate;

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
    return client.channels.get(config.DISCORD_CMD_CHAN_ID).send(message);
}

/**
 * Send message on default channel
 * @param {String} message
 * @returns {Promise}
 */
function sendOnDefaultChannel(message) {
    return client.channels.get(config.DISCORD_CHAN_ID).send(message);
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
    startDate = new Date();
    client.user.setActivity("!help for help", { type: "WATCHING" });
    setInterval(() => {
        dbl.postStats(client.guilds.size);
    }, 1800000);

});

/**
 * 
 */
//dbl.

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
    return client.emojis.get(id)
}

/**
 * 
 */
function guildName() {
    const test = client.guilds;
    logger.info(test.map(guild => guild.name));
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
    getEmoji,
};