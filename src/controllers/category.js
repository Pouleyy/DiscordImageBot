import Category from "../models/category";

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
    getCategory,
    searchCategory,
};