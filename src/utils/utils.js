import { RichEmbed } from "discord.js";
import logger from "../server/logger";

function arrayToString(array) {
    return array.reduce((prev, cur) => prev + ", " + cur);
}

function divideInMultipleArrays(array, length) {
    let returnArray = [];
    if (array.length == 1) return array;
    if (array.length > length) { //Because field value is limited to 1024 char
        while (array.length) {
            returnArray.push(array.splice(0, Math.round(length / 2)));
        }
    } else {
        let length = array.length % 2 == 0 ? array.length : array.length + 1;
        returnArray.push(array.slice(0, length / 2));
        returnArray.push(array.slice(length / 2, array.length));
    }

    return returnArray;
}

function extractName(array, prefix) {
    return array.map(element => prefix + element.name);
}

function sendErrorEmbed(message, messageError) {
    logger.error(`Error from ${message.member.user.username} in ${message.channel.name} in guild ${message.guild.name} "${messageError}"`);
    const embed = new RichEmbed().setColor(16711680).addField(messageError, "\u200B");
    message.channel.send({ embed });
}

function sadEmojiPicker() {
    const sadEmoji = ["😩", "😕", "😔", "😫", "😖"];
    return sadEmoji[Math.floor((Math.random() * sadEmoji.length))];
}

function shockedEmojiPicker() {
    const shockedEmoji = ["😯", "😲", "😱", "😵", "😳"];
    return shockedEmoji[Math.floor((Math.random() * shockedEmoji.length))];

}

function divideInMultipleEmbed(arrays, length) {
    let embeds = [];
    if (arrays.length > length) {
        while (arrays.length) {
            const embed = new RichEmbed();
            arrays.every((array, index) => {
                if (index >= 21) {
                    return false;
                } else {
                    embed.addField("\u200b", array, true)
                    return true;
                }
            });
            embeds.push(embed);
            arrays.splice(0, 21);
        }
    } else {
        const embed = new RichEmbed();
        arrays.map(array => embed.addField("\u200B", array, true));
        embeds.push(embed);
    }
    return embeds;
}

export default {
    arrayToString,
    divideInMultipleArrays,
    extractName,
    sendErrorEmbed,
    sadEmojiPicker,
    divideInMultipleEmbed,
    shockedEmojiPicker,
}