import logger from "../server/logger";
import request from "request";
import Category from "../models/category";

/**
 * Retrieve all Category from scrolller.com
 */
function retrieveAllCategory() {
    const HEADER = {
        "Content-Type": "application/json"
    };
    const TARGET_URL = "https://scrolller.com/api/media";
    const TIME_BETWEEN_REQUEST = 500;
    const NUMBER_CATEGORY = 42000;
    const START_CATEGORY = 907;
    Category.delete()
        .then(dbReturn => {
            logger.info("Purge done", dbReturn);
            var categoryToGet = START_CATEGORY;
            var finish = setInterval(function () {
                if (categoryToGet > NUMBER_CATEGORY) {
                    clearInterval(finish);
                }
                let bodyCat = [
                    [categoryToGet, 1, 1, 1]
                ];
                categoryToGet++;
                console.log(TARGET_URL);
                console.log(HEADER);
                console.log(bodyCat);
                request({
                    headers: HEADER,
                    url: TARGET_URL,
                    method: "POST",
                    json: bodyCat
                }, function (err, res, body) {
                    if (err || res.statusCode != 200) {
                        logger.error(err + categoryToGet);
                    } else {
                        let numCategory = body[0][0];
                        let nameCategory;
                        if (body[0][1]) {
                            nameCategory = body[0][1].toLowerCase();
                            Category.create(numCategory, nameCategory)
                                .then(category => {
                                    logger.info("Category " + category.id + " " + category.name);
                                })
                                .catch(err => logger.error(err));
                        }
                    }
                });
            }, TIME_BETWEEN_REQUEST);
        })
        .catch(err => logger.error(err));
}


/**
 *
 * @returns {Promise}
 * @param {String} category - Category
 */
function getCategory(category) {
    return Category.get(category);
}

/**
 *
 * @returns {Promise}
 * @param {String} category - Category
 */
function searchCategory(category) {
    return Category.search(category);
}



export default {
    retrieveAllCategory,
    getCategory,
    searchCategory,
};