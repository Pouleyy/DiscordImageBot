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
  const args = message.content
    .slice(prefix.length)
    .trim()
    .split(/ +/g)
    .map(arg => arg.toLowerCase());
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
  } else if (command == "random") {
    subreddit.random(args, message);
  }
});

const help = message => {
  utils.loggerDiscord(message, "Help requested");
  const username = discord.getUsername();
  const avatarURL = discord.getAvatarURL();
  const ID = discord.getID();
  const embed = new RichEmbed()
    .setTitle("Show you pictures and gifs from Reddit")
    .setURL("https://reddit.com")
    .setDescription(
      "All the content is provided by [scrolller](https://scrolller.com/)\nSo you can't get content from all existent subreddit, use the `search` command to know which subreddit you can request\n"
    )
    .setColor(utils.randomColor())
    .setThumbnail(avatarURL)
    .setAuthor(
      username,
      avatarURL,
      "https://github.com/Pouleyy/DiscordImageBot"
    )
    .addField(
      "If you have any trouble with the bot feel free to contact me, Pouleyy#7340",
      "\u200b"
    )
    .addField(
      "`!random (gif|pic) (bomb)`",
      "Get you pictures and gifs from a random subreddit, you can ask gifs only with `gif` option or pictures only with `pic` option\n`bomb` option give you 5 pics/gifs\n**Usage**\n`!random` Show you 5 pic from a *random* subreddit"
    )
    .addBlankField()
    .addField(
      "`!s [subreddit] (gif|pic) (bomb)`",
      "Get for you pictures and gifs from this subreddit, you can ask gifs only with `gif` option or pictures only with `pic` option\n`bomb` option give you 5 pics/gifs\n**Usage**\n`!s winterporn pic bomb` Show you 5 pic from *winterporn* subreddit"
    )
    .addBlankField()
    .addField(
      "`!search [subreddit]`",
      "Search subreddit by looking in the Okedan's database for subreddits that match your research\n**Usage**\n`!search imaginary` Send you all the subreddit that have *imaginary* in their name"
    )
    .addBlankField()
    .addField(
      "`!info [subreddit]`",
      "Get info about a subreddit\n**Usage**\n`!info winterporn` Give information about the *winterporn* subreddit"
    )
    .addBlankField()
    .addField(
      "Categories explained",
      "Categories are a way to regroup subreddits by similarity and simply get a bunch of content from different sub"
    )
    .addBlankField()
    .addField(
      "`!c [category] (gif|pic) (bomb)`",
      "⚠️ This feature has some trouble at this time, sorry for that, there is no way to fix for the moment\nGet for you pictures and gifs from this category, you can ask gifs only with `gif` option or pictures only with `pic` option\n`bomb` option give you 5 pics/gifs\n**Usage**\n`!c cute gif` Show you a gif from the *cute* category"
    )
    .addBlankField()
    .addField(
      "`!searchc [category]`",
      "Search category by looking in the Okedan's database for categories that match your research \nYou can search all categories with `!searchc`\n**Usage**\n`!searchc a` Send you all the category that contains *a*"
    )
    .addBlankField()
    .addField(
      "`!infoc [category]`",
      "Get info about a category\n**Usage**\n`!infoc cute` Give you information about the *cute* category"
    )
    .addBlankField()
    .addField(
      `Invite ${username} to your server`,
      `[Invitation link](https://discordapp.com/api/oauth2/authorize?client_id=${ID}&scope=bot&permissions=19456)`
    )
    .addField(
      `You can vote from ${username} on discordbots.org`,
      `[Vote link](https://discordbots.org/bot/${ID}/vote)`
    );
  message.channel.send({ embed });
}
