import logger from "../server/logger.js";
import discord from "../server/discord.js";
import Discord from "discord.js";


const arrayToString = array => {
  return array.reduce((prev, cur) => prev + ", " + cur);
};

const divideInMultipleArrays = (array, length) => {
  let returnArray = [];
  if (array.length == 1) return array;
  if (array.length > length) {
    //Because field value is limited to 1024 char
    while (array.length) {
      returnArray.push(array.splice(0, Math.round(length / 2)));
    }
  } else {
    let length = array.length % 2 == 0 ? array.length : array.length + 1;
    returnArray.push(array.slice(0, length / 2));
    returnArray.push(array.slice(length / 2, array.length));
  }

  return returnArray;
};

const extractName = (array, prefix) => {
  return array.map(element => prefix + element.name);
};

const sendErrorEmbed = async (message, messageError) => {
  const textMsg = `Error ${extractInfoFromMessage(
    message
  )} "${messageError}"`;
  const color = "#ff0000";
  discord.sendOnDefaultChannel(textMsg, color);
  logger.error(textMsg);
  const embed = new Discord.MessageEmbed()
    .setColor(color)
    .addField(messageError, "\u200B");
  try {
    message.channel.send({ embeds: [embed] });
  } catch (error) {
    logger.error(`Error while sending error embed ${error}`);
  }
};

const sadEmojiPicker = () => {
  const sadEmoji = ["😩", "😕", "😔", "😫", "😖"];
  return sadEmoji[Math.floor(Math.random() * sadEmoji.length)];
};

const shockedEmojiPicker = () => {
  const shockedEmoji = ["😯", "😲", "😱", "😵", "😳"];
  return shockedEmoji[Math.floor(Math.random() * shockedEmoji.length)];
};

const divideInMultipleEmbed = (arrays, length) => {
  let embeds = [];
  if (arrays.length > length) {
    while (arrays.length) {
      const embed = new Discord.MessageEmbed();
      arrays.every((array, index) => {
        if (index >= 21) {
          return false;
        } else {
          embed.addField("\u200b", array, true);
          return true;
        }
      });
      embeds.push(embed);
      arrays.splice(0, 21);
    }
  } else {
    const embed = new Discord.MessageEmbed();
    arrays.map(array => embed.addField("\u200B", array, true));
    embeds.push(embed);
  }
  return embeds;
};

const extractInfoFromMessage = message => {
  const info = `from ${message.member.user.username} in ${message.channel.name
    } in guild ${message.guild.name}`;
  return info;
};

const randomColor = () => {
  return `# ${((Math.random() * (1 << 24)) | 0).toString(16)}`;
};

const loggerDiscord = (message, textMessage) => {
  textMessage = `${textMessage} ${extractInfoFromMessage(message)}`;
  logger.info(textMessage);
  discord.sendOnDefaultChannel(textMessage);
};

export default {
  arrayToString,
  divideInMultipleArrays,
  extractName,
  sendErrorEmbed,
  sadEmojiPicker,
  divideInMultipleEmbed,
  shockedEmojiPicker,
  extractInfoFromMessage,
  randomColor,
  loggerDiscord
};
