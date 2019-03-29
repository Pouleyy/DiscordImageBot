import Category from "../models/category";

/**
 *
 * @returns {Promise}
 * @param {String} category - Category
 */
const getCategory = category => {
  return Category.get(category);
};

/**
 *
 * @returns {Promise}
 * @param {String} category - Category
 */
const searchCategory = category => {
  return Category.search(category);
};

export default {
  getCategory,
  searchCategory
};
