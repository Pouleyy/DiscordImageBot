import mongoose from "../server/mongo";

export const SubredditSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      require: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      unique: true
    },
    canIGifIt: {
      type: Boolean,
      require: true
    },
    categoryName: {
      type: [String]
    },
    relatedCategory: {
      type: [String]
    },
    title: {
      type: String
    },
    subscriber: {
      type: Number
    },
    description: {
      type: String
    },
    age: {
      type: String
    },
    similarSub: {
      type: [String]
    },
    nbPics: {
      type: Number
    },
    nbGifs: {
      type: Number
    },
    nsfw: {
      type: Boolean
    }
  },
  {
    timestamps: {}
  }
);

SubredditSchema.statics = {
  /**
   * Create Subreddit or update
   * @param {Subreddit} subToSave
   * @returns {Promise}
   */
  createOrUpdate(subToSave) {
    return this.get(subToSave.name).then(exist => {
      let sub;
      if (exist) {
        sub = exist;
      } else {
        sub = new this();
      }
      sub.id = subToSave.id;
      sub.name = subToSave.name;
      sub.canIGifIt = subToSave.canIGifIt;
      sub.categoryName = subToSave.categoryName;
      sub.relatedCategory = subToSave.relatedCategory;
      sub.title = subToSave.title;
      sub.subscriber = subToSave.subscriber;
      sub.description = subToSave.description;
      sub.age = subToSave.age;
      sub.similarSub = subToSave.similarSub;
      sub.nbPics = subToSave.nbPics;
      sub.nbGifs = subToSave.nbGifs;
      sub.nsfw = subToSave.nsfw;
      return sub.save();
    });
  },

  /**
   * Get Subreddit
   * @param {String} subName
   * @returns {Promise}
   */
  get(subName) {
    return this.findOne({
      name: subName
    });
  },

  /**
   * Remove one Subreddit
   * @param {String} sub Name of the subreddit to delete
   * @returns {Promise}
   */
  remove(sub) {
    return this.deleteOne({ name: sub });
  },
  /**
   * Remove all Subreddit
   * @returns {Promise}
   */
  delete() {
    return this.remove({});
  },
  /**
   * Get all Subreddit
   * @returns {Promise}
   */
  all() {
    return this.find({});
  },

  /**
   * Search Subreddit
   * @param {String} subName
   * @returns {Promise}
   */
  search(subName) {
    return this.find({
      name: { $regex: subName, $options: "i" }
    }).select({ name: 1, _id: 0 });
  }
};

/**
 * @typedef Subreddit
 */
export default mongoose.model("Subreddit", SubredditSchema);
