import discord from "../server/discord";
import logger from "../server/logger";
import subreddit from "../commands/subreddit";
import cat from "../commands/category";
import { RichEmbed } from "discord.js";
import utils from "../utils/utils";

const prefix = "!";

discord.onMessageEverywhere(message => {
    if (message.author.bot) return;
    if (message.content.indexOf(prefix) !== 0) {
        return;
    }
    if (message.channel.type === "dm") {
        return;
    }
    const args = message.content.slice(prefix.length).trim().split(/ +/g).map(arg => arg.toLowerCase());
    const command = args.shift();
    logger.debug(`${command} ${utils.extractInfoFromMessage(message)}`);
    if (command == "help") {
        help(message);
    } else if (command == "info") {
        subreddit.info(args, message);
    } else if (command == "infoc") {
        cat.info(args, message);
    } else if (command == "search") {
        subreddit.search(args, message);
    } else if (command == "searchc") {
        cat.search(args, message);
    } else if (command == "c") {
        cat.get(args, message);
    } else if (command == "s") {
        subreddit.get(args, message);
    }
});

function help(message) {
    logger.info(`Help requested ${utils.extractInfoFromMessage(message)}`);
    const username = discord.getUsername();
    const avatarURL = discord.getAvatarURL();
    const ID = discord.getID();
    const embed = new RichEmbed()
        .setTitle("Show you pictures and gifs from Reddit")
        .setURL("https://reddit.com")
        .setDescription("All the content is provided by [scrolller](https://scrolller.com/) \n")
        .setColor('#' + (Math.random() * (1 << 24) | 0).toString(16))
        .setThumbnail(avatarURL)
        .setAuthor(username, avatarURL, "https://github.com/Pouleyy/DiscordImageBot")
        .addField("If you have any trouble with the bot feel free to contact me, Pouley#7340", "\u200b")
        .addField("`!info subreddit`", "Get info about a subreddit\n**Usage**\n`!info winterporn` Give information about the *winterporn* subreddit")
        .addBlankField()
        .addField("`!s subreddit (gif|pic) (bomb)`", "Get for you pictures and gifs from this subreddit, you can ask gifs only with `gif` option or pictures only with `pic` option\n`bomb` option give you 5 pics/gifs\n**Usage**\n`!s winterporn pic bomb` Show you 5 pic from *winterporn* subreddit")
        .addBlankField()
        .addField("`!search subreddit`", "Search subreddit by looking in the Okedan's database for subreddits that match your research\n**Usage**\n`!search imaginary` Send you all the subreddit that have *imaginary* in their name")
        .addBlankField()
        .addField("Categories explained", "Categories are a way to regroup subreddits by similarity and simply get a bunch of content from different sub")
        .addBlankField()
        .addField("`!infoc category`", "Get info about a category\n**Usage**\n`!infoc cute` Give you information about the *cute* category")
        .addBlankField()
        .addField("`!c category (gif|pic) (bomb)`", "Get for you pictures and gifs from this category, you can ask gifs only with `gif` option or pictures only with `pic` option\n`bomb` option give you 5 pics/gifs\n**Usage**\n`!c cute gif` Show you a gif from the *cute* category")
        .addBlankField()
        .addField("`!searchc category`", "Search category by looking in the Okedan's database for categories that match your research \nYou can search all categories with `!searchc`\n**Usage**\n`!searchc a` Send you all the category that contains *a*")
        .addField(`Invite ${username} to your server by clicking on this :`, `[Invitation link](https://discordapp.com/api/oauth2/authorize?client_id=${ID}&scope=bot&permissions=19456)`);
    message.channel.send({ embed })
}
