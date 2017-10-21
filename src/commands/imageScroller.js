import discord from "../server/discord";
import logger from "../server/logger";
import imgCtrl from "../controllers/imageScroller";
import request from "request";


discord.onDefaultChannelMessage(message => {
    if (message.content.startsWith("!search")) {
        search(message);
    } else if (message.content.startsWith("!")) {
        if (message.content.includes(" bomb")) {
            getImageBomb(message);
        } else {
            getImage(message);
        }
    }
});

function search(message) {
    let category = message.content.replace("!search ", "").toLowerCase();
    imgCtrl.searchCategory(category)
        .then(categories => {
            if (categories.length === 0) {
                logger.info("No matching category :", category);
                message.channel.send("No matching category, sorry :(");
            } else {
                logger.info("SEARCHED CATEGORY", category);
                let msg;
                for (var i = 0; i < categories.length; i++) {
                    msg += "!" + categories[i].name + "\n";
                }
                msg = msg.substring(9, msg.length);
                msg = "Search result :\n" + msg;
                message.channel.send(msg);
            }
        })
        .catch(err => logger.error(err));
}

function getImage(message) {
    const category = message.content.replace("!", "").toLowerCase();
    console.log("test");
    imgCtrl.getCategory(category)
        .then(categorySearched => {
            if (!categorySearched) {
                logger.info("No matching category :", category);
                message.channel.send("No matching category, sorry :(");
            } else {
                makeRequest(category, function (imageURL) {
                    logger.info("Search done :", categorySearched.id, category);
                    if (imageURL == null) {
                        message.channel.send("Oops, something went wrong :/");
                    } else {
                        message.channel.send(imageURL[0]);
                    }
                });
            }
        })
        .catch(err => logger.error(err));
}

function getImageBomb(message) {
    console.log("HEY MAIS C'EST UNE BOMBE");
    const splitMessage = message.content.toLowerCase().split(" ");
    const category = splitMessage[0].replace("!", "");
    const bombNumber = splitMessage[2] && splitMessage[2] <= 5 ? splitMessage[2] : 5; //Discord limit preview to 5 ATM, so useless to send more :(
    imgCtrl.getCategory(category)
        .then(categorySearched => {
            if (!categorySearched) {
                logger.info("No matching category :", category);
                message.channel.send("No matching category, sorry :(");
            } else {
                makeRequest(category, function (imageURL) {
                    logger.info("BOMB search done :", categorySearched.id, category);
                    if (imageURL == null) {
                        message.channel.send("Oops, something went wrong :/");
                    } else {
                        let msg;
                        for (let i = 0; i < bombNumber; i++) {
                            msg += imageURL[i] + "\n";
                        }
                        msg = msg.substring(9, msg.length);
                        message.channel.send(msg);
                    }
                });
            }
        })
        .catch(err => logger.error(err));
}

function makeRequest(category, callback) {
    const HEADER = {
        "Content-Type": "application/json"
    };
    const TARGET_URL = "https://scrolller.com/api/random/" + category;
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
