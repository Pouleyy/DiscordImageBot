import discord from "../server/discord";
import logger from "../server/logger";
import subreddit from "../commands/subreddit";
import cat from "../commands/category";
import { RichEmbed } from "discord.js";

const prefix = "!";

discord.onMessageEverywhere(message => {
    if (message.author.bot) return;
    if (message.content.indexOf(prefix) !== 0) {
        return;
    }
    const args = message.content.slice(prefix.length).trim().split(/ +/g).map(arg => arg.toLowerCase());
    const command = args.shift();
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
    } else {
        subreddit.get(command, args, message);
    }
});

function help(message) {
    logger.info("Help send");
    const username = discord.getUsername();
    const avatarURL = discord.getAvatarURL();
    const embed = new RichEmbed()
        .setTitle("Show you pictures and gifs from Reddit")
        .setURL("https://reddit.com")
        .setDescription("All the content is provided by [scrolller](https://scrolller.com/) \n")
        .setColor('#' + (Math.random() * (1 << 24) | 0).toString(16))
        .setThumbnail(avatarURL)
        .setAuthor(username, avatarURL, "https://github.com/Pouleyy/DiscordImageBot")
        .addField("Get info about a subreddit", "`!info subreddit`")
        .addField("Get content from a subreddit", "`!subreddit (gif|pic) (bomb)` \nGet for you pictures and gifs from this subreddit, you can ask only gifs with `gif` option or only pictures with `pic` the option\n`bomb` option give you 5 pics/gifs")
        .addField("Search subreddit", "`!search subreddit` Look in the Okedan's database for subreddit that match your research")
        .addField("Categories explained", "Categories are a way to regroup subreddits by similarity and simply get a bunch of content from different sub")
        .addField("Get info about a category", "`!infoc category`")
        .addField("Get content from a category", "`!c category (gif|pic) (bomb)` \nGet for you pictures and gifs from this category, you can ask only gifs with `gif` option or only pictures with `pic` the option\n`bomb` option give you 5 pics/gifs")
        .addField("Search category", "`!searchc category` Look in the Okedan's database for categories that match your research");

    message.channel.send({ embed })
}
