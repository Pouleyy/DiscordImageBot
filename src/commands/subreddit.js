import logger from "../server/logger";
import subCtrl from "../controllers/subreddit";
import { RichEmbed } from "discord.js";
import utils from "../utils/utils";
import axios from "axios";

const get = async (args, message) => {
  const sub = args.shift();
  try {
    const subSearched = await subCtrl.getSubreddit(sub);
    if (!subSearched) {
      sub
        ? utils.sendErrorEmbed(
          message,
          `No matching subreddit ${sub}, sorry ${utils.sadEmojiPicker()}\nDon't forget to use the search command if you're not sure`
        )
        : utils.sendErrorEmbed(
          message,
          `You need to provide a subreddit so I can get gifs and pics for you ${utils.sadEmojiPicker()}`
        );
    } else {
      let images = [];
      if (message.channel.nsfw) {
        args.includes("bomb")
          ? getMedia(subSearched, args, message, images, 5)
          : getMedia(subSearched, args, message, images, 1);
      } else {
        subSearched.nsfw
          ? utils.sendErrorEmbed(
            message,
            `Sorry it seems that you're in a SFW channel and you request a NSFW subreddit ${utils.sadEmojiPicker()}`
          )
          : args.includes("bomb")
            ? getMedia(subSearched, args, message, images, 5)
            : getMedia(subSearched, args, message, images, 1);
      }
    }
  } catch (error) {
    logger.error(error);
  }
};

const getMedia = async (sub, args, message, images, length) => {
  try {
    let imageURL = await makeRequest(sub.name);
    if (imageURL == null) {
      utils.sendErrorEmbed(
        message,
        `Error while requesting ${sub}, sorry ${utils.sadEmojiPicker()}`
      );
    } else {
      if (args.includes("gif") && sub.canIGifIt) {
        images = images.concat(
          imageURL.filter(url => url.includes(".mp4") || url.includes(".webm"))
        );
      } else if (args.includes("pic")) {
        images = images.concat(imageURL.find(url => url.includes(".jpg")));
      } else {
        images = images.concat(imageURL);
      }
      images.length >= length
        ? sendContent(images, length, message, sub)
        : getMedia(sub, args, message, images, length, sub);
    }
  } catch (err) {
    utils.sendErrorEmbed(
      message,
      `Error while requesting ${sub}, sorry ${utils.sadEmojiPicker()}`
    );
    logger.error(`Error while getting media in ${sub.name}`);
  }
};

const sendContent = async (images, length, message, sub) => {
  utils.loggerDiscord(message, `Request ${length} subreddit ${sub.name}`);
  const randomColor = utils.randomColor();
  images.slice(0, length).map(image => {
    if (image.includes(".jpg")) {
      const embed = new RichEmbed().setColor(randomColor).setImage(image);
      if (length === 1)
        embed.setDescription(
          `You can use the **bomb** option to get more content\nTry *!s ${
          sub.name
          } bomb*`
        );
      message.channel.send({ embed });
    } else {
      if (length === 1)
        image = `You can use the **bomb** option to get more content\nTry *!s ${
          sub.name
          } bomb*\n${image}`;
      try {
        message.channel.send(image);
      } catch (error) {
        logger.error(`Error while sending content for sub ${sub} : ${error}`);
      }
    }
  });
};

const makeRequest = async sub => {
  const TARGET_URL = `https://scrolller.com/api/random/${sub}`;
  try {
    const response = await axios.get(TARGET_URL);
    const data = response.data;
    return data;
  } catch (err) {
    logger.error("Error while scraping scrolller.com ", err);
    return null;
  }
};

const search = async (args, message) => {
  const sub = args[0];
  try {
    const subs = await subCtrl.searchSubreddit(sub);
    if (subs.length === 0) {
      utils.sendErrorEmbed(
        message,
        `No matching subreddit to your search "${sub}", sorry ${utils.sadEmojiPicker()}`
      );
    } else {
      utils.loggerDiscord(
        message,
        `Searched subreddit ${sub} ${subs.length} match found`
      );
      const subsWithOnlyName = utils.extractName(subs, "!s ");
      const arrays = utils.divideInMultipleArrays(subsWithOnlyName, 30);
      const embeds = utils.divideInMultipleEmbed(arrays, 18);
      embeds.map((embed, index) => {
        embed.setTitle(
          `Search ${index + 1}/${embeds.length} for subreddit : ${sub}`
        );
        embed.setColor(utils.randomColor());
        try {
          message.channel.send({ embed });
        } catch (error) {
          logger.error(
            `Error while sending searched content for sub ${sub} : ${error}`
          );
        }
      });
    }
  } catch (error) {
    logger.error(`Error while searching ${sub}`, error);
  }
};

const info = async (args, message) => {
  const sub = args[0];
  utils.loggerDiscord(message, `Info on subreddit ${sub}`);
  try {
    const subFound = await subCtrl.getSubreddit(sub);
    if (!subFound) {
      utils.sendErrorEmbed(
        message,
        `No matching subreddit for info on "${sub}", sorry ${utils.sadEmojiPicker()}`
      );
    } else {
      try {
        const url = await makeRequest(subFound.name);
        const thumbnail = !url
          ? null
          : message.channel.nsfw
            ? url.find(url => url.includes(".jpg"))
            : subFound.nsfw
              ? null
              : url.find(url => url.includes(".jpg"));
        const embed = new RichEmbed();
        embed.setColor(utils.randomColor());
        embed.setTitle(sub[0].toUpperCase() + sub.slice(1));
        embed.setURL(`https://www.reddit.com/r/${sub}`);
        embed.setDescription(subFound.title);
        embed.setThumbnail(thumbnail);

        subFound.description
          ? embed.addField("Description", subFound.description)
          : "embed.addBlankField() //Not so pretty :/";
        embed.addField("Age", subFound.age, true);
        embed.addField("Subscriber", subFound.subscriber, true);
        thumbnail ? "" : embed.addField("\u200B", "\u200B", true);

        embed.addField(
          "Similar subreddit",
          subFound.similarSub.length == 0
            ? "None 🤷"
            : utils.arrayToString(subFound.similarSub)
        );

        embed.addField("Pictures", subFound.nbPics, true);
        embed.addField("Gifs", subFound.nbGifs, true);
        embed.addField(
          "NSFW",
          subFound.nsfw ? "Totally NSFW" : "Nah, SFW",
          true
        );

        embed.addField(
          "Category",
          subFound.categoryName.length == 0
            ? "Not in a category sorry 😕"
            : utils.arrayToString(subFound.categoryName),
          true
        );
        embed.addField(
          "Related category",
          subFound.relatedCategory.length == 0
            ? "No related category sorry 😞"
            : utils.arrayToString(subFound.relatedCategory),
          true
        );

        try {
          message.channel.send({ embed });
        } catch (error) {
          logger.error(
            `Error while sending searched content for sub ${sub} : ${error}`
          );
        }
      } catch (error) {
        logger.error(
          `Problem while requesting thumbnail for sub ${sub}`,
          error
        );
      }
    }
  } catch (error) {
    logger.error(`Problem while searching info on ${sub}`, error);
  }
};

const random = async (args, message) => {
  logger.info("Tututu");
  try {
    const randomSubs = await subCtrl.getRandomSubreddit();
    const randomSub = randomSubs.shift();
    if (!randomSub) {
      utils.sendErrorEmbed(
        message,
        `Something went wrong while getting you a random pics, sorry ${utils.sadEmojiPicker()}`
      );
    } else {
      logger.info("SUB RANDOM");
      logger.info(randomSub);
      let images = [];
      if (message.channel.nsfw) {
        args.includes("bomb")
          ? getMedia(randomSub, args, message, images, 5)
          : getMedia(randomSub, args, message, images, 1);
      } else {
        randomSub.nsfw
          ? utils.sendErrorEmbed(
            message,
            `Sorry it seems that you're in a SFW channel and you request a NSFW subreddit ${utils.sadEmojiPicker()}`
          )
          : args.includes("bomb")
            ? getMedia(randomSub, args, message, images, 5)
            : getMedia(randomSub, args, message, images, 1);
      }
    }
  } catch (error) {
    logger.error(error);
  }
};

export default {
  get,
  search,
  info,
  random,
};
