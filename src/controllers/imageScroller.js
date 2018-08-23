import logger from "../server/logger";
import request from "request";
import xml2js from "xml2js";
import cheerio from "cheerio";
import Subreddit from "../models/subreddit";
import Category from "../models/category";

/**
 * Retrieve all Data from scrolller.com
 */

function retrieveAllData() {
    retrieveAllSub();
    retrieveAllCat();
}

function retrieveAllSub() {
    const TARGET_URL = "https://scrolller.com/sitemap.xml";
    request({
        url: TARGET_URL
    }, function (err, res, body) {
        if (err || res.statusCode != 200) {
            logger.error(err + " Sitemap got problem");
        } else {
            let parser = new xml2js.Parser();
            parser.parseString(body, function (err, allSubXML) {
                if (err) {
                    logger.fatal("Error while parsing XML " + err);
                } else {
                    logger.info("Parse done");
                    getInfoAllSub(allSubXML);
                }
            });
        }
    });
}

function getInfoAllSub(allSubJSON) {
    const allSub = allSubJSON.urlset.url.filter(url => filterSub(url));
    loop(allSub);
}

function filterSub(obj) {
    return obj.loc[0].includes("/r/") && !(obj.loc[0].includes("-gifs") || obj.loc[0].includes("-pics"));
}

function loop(allSub) {
    const TIME_BETWEEN_REQUEST = 150;
    const INDEX_MAX = allSub.length;
    let index = 0;
    logger.info(INDEX_MAX + " subreddits to save");
    let finish = setInterval(function () {
        if (index >= INDEX_MAX - 1) {
            logger.info(index + " subreddit saved in " + TIME_BETWEEN_REQUEST * index / 60000 + " min");
            clearInterval(finish);
        }
        const url = allSub[index].loc[0];
        const subName = url.substring(24);
        //logger.info("Request N°" + index + "/" + INDEX_MAX);
        index++;
        request({
            url: url
        }, function (err, res, body) {
            if (err || res.statusCode != 200) {
                logger.warn(subName + " " + err);
            } else {
                const $ = cheerio.load(body);
                let textNode = $("head > script").map((i, x) => x.children[0])
                    .filter((i, x) => x && x.data.match(/window.scrolllerPageInfo/)).get(0);
                let sub = textNode.data.substring(37);
                sub = sub.slice(0, -3);
                sub = JSON.parse(sub);
                saveOneSub(sub);
            }
        });
    }, TIME_BETWEEN_REQUEST);
}

function saveOneSub(sub) {
    let subToSave = {
        id: sub[0][1],
        name: sub[0][0].toLowerCase(),
        canIGifIt: sub[0][13],
        categoryName: sub[0][3],
        relatedCategory: sub[0][4],
        title: sub[0][5],
        subscriber: sub[0][6],
        description: sub[0][7],
        age: sub[0][8],
        similarSub: sub[0][9],
        nbPics: sub[0][10][0],
        nbGifs: sub[0][10][1],
        nsfw: sub[0][2],
    };
    Subreddit.createOrUpdate(subToSave)
        .then(subSaved => {
            //logger.info("SUBREDDIT: " + subSaved.name + " saved");
        })
        .catch(err => logger.error(subToSave.name + " " + err));
}

function retrieveAllCat() {
    const TARGET_URL = "https://scrolller.com/database/category-database.c5e089db1aab264c520f63ead1285c4f.js";
    request({
        url: TARGET_URL
    }, function (err, res, body) {
        if (err || res.statusCode != 200) {
            logger.error(err + " Category database got problem");
        } else {
            body = body.substring(81, body.length - 1);
            body = JSON.parse(body);
            let categories = [];
            body.map(category => {
                let cat = {
                    id: category[1],
                    name: category[2],
                    subreddits: [],
                }
                category[3].map(sub => {
                    if (sub[0] != 0) {
                        cat.subreddits.push({ "name": sub[2], "id": sub[1] });
                    } else {
                        let subcat = {
                            id: sub[1],
                            name: sub[2],
                            subreddits: [],
                        }
                        sub[3].map(subsub => {
                            if (subsub[0] != 0) {
                                cat.subreddits.push({ "name": subsub[2], "id": subsub[1] });
                                subcat.subreddits.push({ "name": subsub[2], "id": subsub[1] });
                            }
                        })
                        categories.push(subcat);
                    }
                });
                categories.push(cat);
            });
            getInfoCat(categories);
        }
    });
}

function getInfoCat(categories) {
    const TIME_BETWEEN_REQUEST = 1000;
    const INDEX_MAX = categories.length;
    let index = 0;
    logger.info(INDEX_MAX + " category to save");
    let finish = setInterval(function () {
        if (index >= INDEX_MAX - 1) {
            logger.info(index + " category saved in " + TIME_BETWEEN_REQUEST * index / 60000 + " min");
            clearInterval(finish);
        }
        const catName = categories[index].name;
        const url = "https://scrolller.com/" + catName;
        //logger.info("Request N°" + index + "/" + INDEX_MAX);
        const category = categories[index];
        index++;
        request({
            url: url
        }, function (err, res, body) {
            if (err || res.statusCode != 200) {
                logger.warn(catName + " " + err);
                logger.warn(catName + " " + body);
            } else {
                const $ = cheerio.load(body);
                let textNode = $("head > script").map((i, x) => x.children[0])
                    .filter((i, x) => x && x.data.match(/window.scrolllerPageInfo/)).get(0);

                let json = textNode.data.substring(42);
                json = json.slice(0, -17);

                json = JSON.parse(json);
                saveOneCat(category, json);
            }
        });
    }, TIME_BETWEEN_REQUEST);
}

function saveOneCat(category, info) {
    let catToSave = {
        id: category.id,
        name: category.name,
        relatedCategory: info[0][6],
        subreddits: category.subreddits,
        nbPics: info[0][7][0],
        nbGifs: info[0][7][1],
    };
    Category.createOrUpdate(catToSave)
        .then(catSaved => {
            //logger.info("CATEGORY: " + catSaved.name + " saved");
        })
        .catch(err => logger.error(catToSave.name + " " + err));
}

export default {
    retrieveAllData,
};