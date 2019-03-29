import Subreddit from "../models/subreddit";

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

export default {
  getSubreddit,
  searchSubreddit
};
