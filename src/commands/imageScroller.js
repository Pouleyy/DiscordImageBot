import discord from "../server/discord";
import logger from "../server/logger";
import imgCtrl from "../controllers/imageScroller";
import request from "request";


discord.onDefaultChannelMessage(message => {
    if (message.content.startsWith("!search")) {
        search(message);
    } else if (message.content.startsWith("!")) {
        getImage(message);
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
    imgCtrl.getCategory(category)
        .then(numCategory => {
            if (!numCategory) {
                logger.info("No matching category :", category);
                message.channel.send("No matching category, sorry :(");
            } else {
                makeRequest(numCategory.id, function (imageURL) {
                    logger.info("Search done :", numCategory.id, category);
                    if (imageURL === "none") {
                        message.channel.send("This category exists but I had a problem, try again please :/");
                    } else {
                        message.channel.send(imageURL);
                    }
                });
            }
        })
        .catch(err => logger.error(err));
}

function makeRequest(numCategory, callback) {
    const HEADER = {
        "Content-Type": "application/json"
    };
    const TARGET_URL = "https://scrolller.com/api/media";
    const METHOD = "POST";
    const DATA = [
        [numCategory, Math.round(Math.random() * (10000 - 1) + 1), Math.round(Math.random() * (300 - 1) + 1), 1]
    ];
    request({
        headers: HEADER,
        url: TARGET_URL,
        method: METHOD,
        json: DATA
    }, function (err, res, body) {
        if (err || res.statusCode != 200 || body[0][3].length < 1) {
            logger.error("Error while scraping scrolller.com ", JSON.stringify(body));
            logger.error("DATA ERROR", DATA);
            callback("none");
        } else {
            let URL;
            if (body[0][3][0][3][0][1].length > 1) {
                URL = body[0][3][0][3][0][1][0][0];
            } else {
                URL = "https://scrolller.com/media/" + body[0][3][0][3][0][1][0][0][1];
            }
            callback(URL);
        }
    });
}
