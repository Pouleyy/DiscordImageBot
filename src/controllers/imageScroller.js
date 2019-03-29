import logger from "../server/logger";
import request from "request";
import xml2js from "xml2js";
import cheerio from "cheerio";
import Subreddit from "../models/subreddit";
import Category from "../models/category";
import axios from "axios";

/**
 * Retrieve all Data from scrolller.com
 */

const retrieveAllData = () => {
  retrieveAllSub();
  retrieveAllCat();
};

const retrieveAllSub = async () => {
  const TARGET_URL = "https://scrolller.com/sitemap.xml";
  try {
    const response = await axios.get(TARGET_URL);
    let parser = new xml2js.Parser();
    parser.parseString(response.data, function(err, allSubXML) {
      if (err) {
        logger.fatal("Error while parsing XML " + err);
      } else {
        logger.info("Parse done");
        getInfoAllSub(allSubXML);
      }
    });
  } catch (err) {
    logger.error(`${err} Sitemap got a problem`);
  }
};

const getInfoAllSub = allSubJSON => {
  const allSub = allSubJSON.urlset.url.filter(url => filterSub(url));
  loop(allSub);
};

const filterSub = obj => {
  return (
    obj.loc[0].includes("/r/") &&
    !(obj.loc[0].includes("-gifs") || obj.loc[0].includes("-pics"))
  );
};

const loop = async allSub => {
  const TIME_BETWEEN_REQUEST = 250;
  const INDEX_MAX = allSub.length;
  let index = 0;
  logger.info(INDEX_MAX + " subreddits to save");
  let finish = setInterval(async () => {
    if (index >= INDEX_MAX - 1) {
      logger.info(
        index +
          " subreddit saved in " +
          (TIME_BETWEEN_REQUEST * index) / 60000 +
          " min"
      );
      clearInterval(finish);
    }
    const url = allSub[index].loc[0];
    const subName = url.substring(24);
    //logger.info("Request N°" + index + "/" + INDEX_MAX);
    index++;
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      let sub = extractSubData($);
      saveOneSub(sub);
    } catch (err) {
      logger.warn(`${subName} ${err}`);
      if (err.response.status == 404) {
        removeDeletedSubreddit(subName);
      }
    }
  }, TIME_BETWEEN_REQUEST);
};

const extractSubData = $ => {
  let textNode = $("head > script")
    .map((i, x) => x.children[0])
    .filter((i, x) => x && x.data.match(/window.scrolllerPageInfo/))
    .get(0);
  let sub = textNode.data.substring(37);
  sub = sub.slice(0, -3);
  sub = JSON.parse(sub);
  return sub;
};

const saveOneSub = async sub => {
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
    nsfw: sub[0][2]
  };
  try {
    const subSaved = await Subreddit.createOrUpdate(subToSave);
    logger.info(`SUBREDDIT: ${subSaved.name} saved`);
  } catch (err) {
    logger.error(`Error while saving ${subToSave.name} : ${err}`);
  }
};

const removeDeletedSubreddit = async subName => {
  logger.warn(`${subName} will be remove from the database due to 404`);
  try {
    await Category.remove(subName);
    logger.info(`${subName} removed`);
  } catch (err) {
    logger.error(err);
  }
};

const retrieveAllCat = async () => {
  const TARGET_URL =
    "https://scrolller.com/database/category-database.c5e089db1aab264c520f63ead1285c4f.js";
  try {
    const response = await axios.get(TARGET_URL);
    let data = response.data;
    data = data.substring(81, data.length - 1);
    data = JSON.parse(data);
    let categories = [];
    data.map(category => {
      let cat = {
        id: category[1],
        name: category[2],
        subreddits: []
      };
      category[3].map(sub => {
        if (sub[0] != 0) {
          cat.subreddits.push({ name: sub[2], id: sub[1] });
        } else {
          let subcat = {
            id: sub[1],
            name: sub[2],
            subreddits: []
          };
          sub[3].map(subsub => {
            if (subsub[0] != 0) {
              cat.subreddits.push({ name: subsub[2], id: subsub[1] });
              subcat.subreddits.push({ name: subsub[2], id: subsub[1] });
            }
          });
          categories.push(subcat);
        }
      });
      categories.push(cat);
    });
    getInfoCat(categories);
  } catch (err) {
    logger.error(err + " Category database got problem");
  }
};

const getInfoCat = categories => {
  const TIME_BETWEEN_REQUEST = 1000;
  const INDEX_MAX = categories.length;
  let index = 0;
  logger.info(INDEX_MAX + " category to save");
  let finish = setInterval(async () => {
    if (index >= INDEX_MAX - 1) {
      logger.info(
        index +
          " category saved in " +
          (TIME_BETWEEN_REQUEST * index) / 60000 +
          " min"
      );
      clearInterval(finish);
    }
    const catName = categories[index].name;
    const url = "https://scrolller.com/" + catName;
    const category = categories[index];
    index++;
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      let json = extractCategoryData($);
      saveOneCat(category, json);
    } catch (err) {
      logger.warn(`${catName} ${err}`);
      if (err.response.status == 404) {
        removeDeletedCategory(catName);
      }
    }
  }, TIME_BETWEEN_REQUEST);
};

const saveOneCat = async (category, info) => {
  let catToSave = {
    id: category.id,
    name: category.name,
    relatedCategory: info[0][6],
    subreddits: category.subreddits,
    nbPics: info[0][7][0],
    nbGifs: info[0][7][1],
    nsfw: info[0][2]
  };
  try {
    const catSaved = await Category.createOrUpdate(catToSave);
    logger.info("CATEGORY: " + catSaved.name + " saved");
  } catch (err) {
    logger.error(`Error while saving ${catToSave} : ${err}`);
  }
};

const removeDeletedCategory = async catName => {
  logger.warn(`${catName} will be remove from the database due to 404`);
  try {
    await Category.remove(catName);
    logger.info(`${catName} removed`);
  } catch (err) {
    logger.error(err);
  }
};

const extractCategoryData = $ => {
  let textNode = $("head > script")
    .map((i, x) => x.children[0])
    .filter((i, x) => x && x.data.match(/window.scrolllerPageInfo/))
    .get(0);
  let json = textNode.data.substring(42);
  json = json.slice(0, -17);
  json = JSON.parse(json);
  return json;
};

export default {
  retrieveAllData
};
