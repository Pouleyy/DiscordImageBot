import logger from "../server/logger";
import subCtrl from "../controllers/subreddit";
import request from "request";
import { RichEmbed } from "discord.js";
import utils from "../utils/utils";

function get(command, args, message) {
    const sub = command;
    const embed = new RichEmbed();
    return subCtrl.getSubreddit(sub)
        .then(subSearched => {
            if (!subSearched) {
                logger.error("No matching subreddit :", sub);
                embed.setColor(16711680).addField("No matching subreddit, sorry :(", "\u200B");
                message.channel.send({ embed });
            } else {
                let images = [];
                args.includes("bomb") ? getMedia(subSearched, args, message, images, 5) : getMedia(subSearched, args, message, images, 1);
            }
        })
        .catch(err => logger.error(err));
}

function getMedia(sub, args, message, images, length) {
    makeRequest(sub.name, function (imageURL) {
        if (imageURL == null) {
            const embed = new RichEmbed();
            logger.error("Error while requesting", sub);
            embed.setColor(16711680).addField("Oops, something went wrong :/", "\u200B");
            message.channel.send({ embed });
        } else {
            if (args.includes("gif") && sub.canIGifIt) {
                images = images.concat(imageURL.filter(url => url.includes(".mp4") || url.includes(".webm")));
            } else if (args.includes("pic")) {
                images = images.concat(imageURL.find(url => url.includes(".jpg")));
            } else {
                images = images.concat(imageURL);
            }
            if (images.length >= length) {
                logger.info("Request subreddit for :", sub.name);
                message.channel.send(images.slice(0, length));
            } else {
                getMedia(sub, args, message, images, length);
            }
        }
    });
}

function makeRequest(sub, callback) {
    const HEADER = {
        "Content-Type": "application/json"
    };
    const TARGET_URL = `https://scrolller.com/api/random/${sub}`;
    const METHOD = "GET";
    request({
        headers: HEADER,
        url: TARGET_URL,
        method: METHOD,
    }, function (err, res, body) {
        if (err || res.statusCode != 200 || body.length < 1) {
            logger.error("Error while scraping scrolller.com ", JSON.stringify(body));
            callback(null);
        } else {
            callback(JSON.parse(body));
        }
    });
}


function search(args, message) {
    const sub = args[0];
    const embed = new RichEmbed();
    subCtrl.searchSubreddit(sub)
        .then(subs => {
            if (subs.length === 0) {
                logger.error("No matching subreddit :", sub);
                embed.setColor(16711680).addField("No matching subreddit, sorry :(", "\u200B");
                message.channel.send({ embed });
            } else {
                logger.info(`Searched sub ${sub} ${sub.length} match found`);
                const subsWithOnlyName = utils.extractName(subs, "!");
                const array = utils.divideInMultipleArrays(subsWithOnlyName, 70);
                embed.setTitle(`Search for subreddit : ${sub}`);
                array.map(s => embed.addField("\u200B", s, true));
                embed.setColor("#" + (Math.random() * (1 << 24) | 0).toString(16));
                message.channel.send({ embed });
            }
        })
        .catch(err => logger.error(err));
}

function info(args, message) {
    const sub = args[0];
    logger.info("Info on :", sub);
    subCtrl.getSubreddit(sub)
        .then(subFound => {
            const embed = new RichEmbed();
            if (!subFound) {
                logger.error("No matching sub :", sub);
                embed.setColor(16711680).addField("No matching subreddit, sorry :(", "\u200B");
                message.channel.send({ embed });
                return;
            } else {
                makeRequest(subFound.name, function (imageURL) {
                    const thumbnail = imageURL ? imageURL.find(url => url.includes(".jpg")) : "";
                    embed.setColor("#" + (Math.random() * (1 << 24) | 0).toString(16));
                    embed.setTitle(sub[0].toUpperCase() + sub.slice(1));
                    embed.setURL(`https://www.reddit.com/r/${sub}`);
                    embed.setDescription(subFound.title);
                    embed.setThumbnail(thumbnail);

                    subFound.description ? embed.addField("Description", subFound.description) : "embed.addBlankField() //Not so pretty :/";
                    embed.addField("Age", subFound.age, true);
                    embed.addField("Subscriber", subFound.subscriber, true);
                    thumbnail ? "" : embed.addField("\u200B", "\u200B", true);

                    embed.addField("Similar subreddit", subFound.similarSub.length == 0 ? "None 🤷" : utils.arrayToString(subFound.similarSub));

                    embed.addField("Pictures", subFound.nbPics, true);
                    embed.addField("Gifs", subFound.nbGifs, true);
                    embed.addField("NSFW", subFound.nsfw ? "Totally NSFW" : "Nah, SFW", true);

                    embed.addField("Category", subFound.categoryName.length == 0 ? "Not in a category sorry 😕" : utils.arrayToString(subFound.categoryName), true);
                    embed.addField("Related category", subFound.relatedCategory.length == 0 ? "No related category sorry 😞" : utils.arrayToString(subFound.relatedCategory), true);

                    message.channel.send({ embed });
                });
            }
        })
        .catch(err => logger.error(err));
}

export default {
    get,
    search,
    info,
};