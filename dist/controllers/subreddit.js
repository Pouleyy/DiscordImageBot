import Subreddit from "../models/subreddit.js";

/**
 *
 * @returns {Promise}
 * @param {String} subreddit - Subreddit
 */
const getSubreddit = subreddit => {
  return Subreddit.get(subreddit);
};

/**
 *
 * @returns {Promise}
 * @param {String} subreddit - Subreddit
 */
const searchSubreddit = subreddit => {
  return Subreddit.search(subreddit);
};

/**
 * 
 * @returns {Promise}
 */
const getRandomSubreddit = () => {
  return Subreddit.random();
};

export default {
  getSubreddit,
  searchSubreddit,
  getRandomSubreddit
};
