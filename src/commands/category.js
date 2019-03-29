import logger from "../server/logger";
import catCtrl from "../controllers/category";
import { RichEmbed } from "discord.js";
import utils from "../utils/utils";
import puppeteer from "puppeteer";
import cheerio from "cheerio";

//Set up browser at launch so it doesn't have to launch a new each time
const struct = {};
(async () => {
  try {
    struct.browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await struct.browser.newPage();
    await page.goto("https://scrolller.com/cute");
    await page.click(
      "#intro-settings > div > div > div > div:nth-child(3) > div:nth-child(2) > div"
    );
    await page.close();
  } catch (err) {
    logger.fatal(err);
  }
})();

const get = (args, message) => {
  const cat = args.shift();
  catCtrl
    .getCategory(cat)
    .then(category => {
      if (!category) {
        cat
          ? utils.sendErrorEmbed(
              message,
              `No matching category ${cat}, sorry ${utils.sadEmojiPicker()}\nDon't forget to use the search command if you're not sure`
            )
          : utils.sendErrorEmbed(
              message,
              `You need to provide a category so I can get gifs and pics for you ${utils.sadEmojiPicker()}`
            );
      } else {
        const nameCat = category.name;
        let media = [];
        if (message.channel.nsfw) {
          struct.browser.newPage().then(page => {
            args.includes("bomb")
              ? getMedia(page, nameCat, args, message, media, 5)
              : getMedia(page, nameCat, args, message, media, 1);
          });
        } else {
          category.nsfw
            ? utils.sendErrorEmbed(
                message,
                `Sorry it seems that you're in a SFW channel and you request a NSFW category ${utils.sadEmojiPicker()}`
              )
            : struct.browser.newPage().then(page => {
                args.includes("bomb")
                  ? getMedia(page, nameCat, args, message, media, 5)
                  : getMedia(page, nameCat, args, message, media, 1);
              });
        }
      }
    })
    .catch(err => logger.error(err));
};

const getMedia = (page, nameCat, args, message, media, length) => {
  const URL = `https://scrolller.com/${nameCat}`;
  page
    .goto(URL)
    .then(resp => page.setViewport({ width: 1000, height: 800 }))
    .then(resp => page.waitFor(2000))
    .then(resp => page.content())
    .then(content => {
      let $ = cheerio.load(content);
      const urlFound = $("img")
        .toArray()
        .map(image => $(image).attr("src"));
      if (urlFound.length <= 2) {
        page
          .click(
            "#intro-settings > div > div > div > div:nth-child(3) > div:nth-child(2) > div"
          )
          .then(resp => {
            getMedia(page, nameCat, args, message, media, length);
          });
      }
      urlFound.pop();
      urlFound.shift();
      if (args.includes("gif")) {
        media = media.concat(urlFound.filter(url => url.includes("thumb")));
      } else if (args.includes("pic")) {
        media = media.concat(
          urlFound.find(url => url.includes(".jpg") && !url.includes("thumb"))
        );
      } else {
        media = media.concat(urlFound);
      }
      if (media.length >= length) {
        utils.loggerDiscord(
          message,
          `Request ${length} category for ${nameCat}`
        );
        media = media.map(url => {
          if (url.includes("-thumb")) {
            url = url.replace("-thumb.jpg", ".mp4");
          }
          return url;
        });
        const randomColor = utils.randomColor();
        media.slice(0, length).map(image => {
          if (image.includes(".jpg")) {
            const embed = new RichEmbed().setColor(randomColor).setImage(image);
            if (length === 1)
              embed.setDescription(
                `You can use the **bomb** option to get more content\nTry *!c ${nameCat} bomb*`
              );
            message.channel.send({ embed });
          } else {
            if (length === 1)
              image = `You can use the **bomb** option to get more content\nTry *!c ${nameCat} bomb*\n${image}`;
            message.channel.send(image);
          }
        });
        logger.debug(`Page ${nameCat} closed`);
        page.close();
      } else {
        getMedia(page, nameCat, args, message, media, length);
      }
    })
    .catch(err => logger.error(err));
};

const search = (args, message) => {
  const cat = args[0] ? args[0] : ".";
  catCtrl
    .searchCategory(cat)
    .then(cats => {
      if (cats.length === 0) {
        utils.sendErrorEmbed(
          message,
          `No matching category to your search "${cat}", sorry ${utils.sadEmojiPicker()}`
        );
      } else {
        utils.loggerDiscord(
          message,
          `Searched category ${cat} ${cats.length} match found`
        );
        const catsWithOnlyName = utils.extractName(cats, "!c ");
        const array = utils.divideInMultipleArrays(catsWithOnlyName, 30);
        const embed = new RichEmbed();
        embed.setTitle("Search for category : " + cat);
        array.map(s => embed.addField("\u200B", s, true));
        embed.setColor(utils.randomColor());
        message.channel.send({ embed });
      }
    })
    .catch(err => logger.error(err));
};

const info = (args, message) => {
  const cat = args[0];
  utils.loggerDiscord(message, `Info on category ${cat}`);
  catCtrl
    .getCategory(cat)
    .then(catFound => {
      if (!catFound) {
        utils.sendErrorEmbed(
          message,
          `No matching category for info on "${cat}", sorry ${utils.sadEmojiPicker()}\nDon't forget to use the search command if you're not sure`
        );
      } else {
        const embed = new RichEmbed();
        embed.setColor(utils.randomColor());
        embed.setTitle(catFound.name[0].toUpperCase() + catFound.name.slice(1));
        embed.setURL(`https://scrolller.com/${catFound.name}`);
        embed.setDescription(
          `This category is made of ${catFound.subreddits.length} subreddits`
        );

        embed.addField("Pictures", catFound.nbPics, true);
        embed.addField("Gifs", catFound.nbGifs, true);

        embed.addField(
          "Related category",
          catFound.relatedCategory.length == 0
            ? "No related category 😕"
            : utils.arrayToString(catFound.relatedCategory)
        );
        const subreddits = utils.divideInMultipleArrays(
          utils.extractName(catFound.subreddits, ""),
          25
        );
        subreddits.every((array, index) => {
          if (index >= 9) {
            return false;
          } else {
            index === 0
              ? embed.addField("Subreddits", array, true)
              : embed.addField("\u200b", array, true);
            return true;
          }
        });

        subreddits.splice(0, 9);
        if (subreddits.length === 0) {
          message.channel.send({ embed });
        } else {
          const embeds = utils.divideInMultipleEmbed(subreddits, 18);
          embeds.unshift(embed);
          embeds.map((embed, index) => {
            if (index === 0) message.channel.send({ embed });
            else {
              embed.setTitle(
                `Subreddits ${index + 1}/${
                  embeds.length
                } for ${catFound.name[0].toUpperCase() +
                  catFound.name.slice(1)}`
              );
              embed.setColor(utils.randomColor());
              message.channel.send({ embed });
            }
          });
        }
      }
    })
    .catch(err => logger.error(err));
};

export default {
  get,
  search,
  info
};
