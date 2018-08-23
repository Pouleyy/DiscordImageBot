import logger from "../server/logger";
import catCtrl from "../controllers/category";
import { RichEmbed } from "discord.js";
import utils from "../utils/utils";
import puppeteer from 'puppeteer';
import cheerio from 'cheerio';

//Set up browser at launch so it doesn't have to launch a new each time
var browser = "";
puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    .then(browzer => {
        browser = browzer;
        browser.newPage()
            .then(page => {
                page.goto('https://scrolller.com/cute')
                    .then(resp => page.click('#intro-settings > div > div > div > div:nth-child(3) > div:nth-child(2) > div'))
                    .then(resp => page.close());
            })
            .catch(err => logger.fatal(err));
    })
    .catch(err => logger.fatal(err));


function get(args, message) {
    const cat = args.shift();
    catCtrl.getCategory(cat)
        .then(category => {
            if (!category) {
                logger.error("No matching category :", cat);
                const embed = new RichEmbed().setColor(16711680).addField("No matching category, sorry :(", "\u200B");
                message.channel.send({ embed });
            } else {
                const nameCat = category.name;
                browser.newPage()
                    .then(page => {
                        let media = [];
                        args.includes("bomb") ? getMedia(page, nameCat, args, message, media, 5) : getMedia(page, nameCat, args, message, media, 1);

                    });
            }
        })
        .catch(err => logger.error(err));
}

function getMedia(page, nameCat, args, message, media, length) {
    const URL = "https://scrolller.com/" + nameCat
    page.goto(URL)
        .then(resp => page.setViewport({ width: 1000, height: 800 }))
        .then(resp => page.waitFor(2000))
        .then(resp => page.content())
        .then(content => {
            let $ = cheerio.load(content);
            const urlFound = $('img').toArray().map(image => $(image).attr("src"));
            if (urlFound.length <= 2) {
                page.click('#intro-settings > div > div > div > div:nth-child(3) > div:nth-child(2) > div')
                    .then(resp => {
                        getMedia(page, nameCat, args, message, media, length)
                    })
            }
            urlFound.pop();
            urlFound.shift();
            if (args.includes("gif")) {
                media = media.concat(urlFound.filter(url => url.includes("thumb")));
            } else if (args.includes("pic")) {
                media = media.concat(urlFound.find(url => url.includes(".jpg")));
            } else {
                media = media.concat(urlFound);
            }
            if (media.length >= length) {
                logger.info("Request category for :", nameCat);
                media = media.map(url => {
                    if (url.includes("-thumb")) {
                        url = url.replace("-thumb.jpg", ".mp4");
                    }
                    return url;
                })
                message.channel.send(media.slice(0, length)).then(buffer => {
                    logger.debug("Page " + nameCat + " closed");
                    page.close()
                })
            } else {
                getMedia(page, nameCat, args, message, media, length);
            }
        })
        .catch(err => logger.error(err));
}


function search(args, message) {
    const cat = args[0] ? args[0] : ".";
    const embed = new RichEmbed();
    catCtrl.searchCategory(cat)
        .then(cats => {
            if (cats.length === 0) {
                logger.info("No matching category :", cat);
                embed.setColor(16711680).addField("No matching subreddit, sorry :(", "\u200B");
                message.channel.send({ embed });
            } else {
                logger.info("Searched category " + cat + " " + cats.length + " match found");
                const catsWithOnlyName = utils.extractName(cats, "!c ");
                const array = utils.divideInMultipleArrays(catsWithOnlyName, 75);

                embed.setTitle("Search for category : " + cat);
                array.map(s => embed.addField("\u200B", s, true));
                embed.setColor("#" + (Math.random() * (1 << 24) | 0).toString(16));
                message.channel.send({ embed });
            }
        })
        .catch(err => logger.error(err));
}

function info(args, message) {
    const cat = args[0];
    logger.info("Info on :", cat);
    catCtrl.getCategory(cat)
        .then(catFound => {
            const embed = new RichEmbed();
            if (!catFound) {
                logger.error("No matching cat :", cat);
                embed.setColor(16711680).addField("No matching category, sorry :(", "\u200B");
                message.channel.send({ embed });
            } else {
                embed.setColor("#" + (Math.random() * (1 << 24) | 0).toString(16));
                embed.setTitle(catFound.name[0].toUpperCase() + catFound.name.slice(1));
                embed.setURL("https://scrolller.com/" + catFound.name);
                embed.setDescription("This category is made of " + catFound.subreddits.length + " subreddits");

                embed.addField("Pictures", catFound.nbPics, true);
                embed.addField("Gifs", catFound.nbGifs, true);

                embed.addField("Related category", catFound.relatedCategory.length == 0 ? "No related category 😕" : utils.arrayToString(catFound.relatedCategory));
                const array = utils.divideInMultipleArrays(utils.extractName(catFound.subreddits, ""), 25);
                array.map((element, index) => index === 0 ? embed.addField("Subreddits", element, true) : embed.addField("\u200b", element, true));

                message.channel.send({ embed });
            }
        })
        .catch(err => logger.error(err));
}

export default {
    get,
    search,
    info,
}