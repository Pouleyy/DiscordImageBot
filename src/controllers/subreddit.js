import Subreddit from "../models/subreddit";

/**
 *
 * @returns {Promise}
 * @param {String} subreddit - Subreddit
 */
function getSubreddit(subreddit) {
    return Subreddit.get(subreddit);
}

/**
 *
 * @returns {Promise}
 * @param {String} subreddit - Subreddit
 */
function searchSubreddit(subreddit) {
    return Subreddit.search(subreddit);
}



export default {
    getSubreddit,
    searchSubreddit,
};