import mongoose from "../server/mongo";

export const CategorySchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
    relatedCategory: {
        type: [String]
    },
    subreddits: [{
        name: {
            type: String
        },
        id: {
            type: Number
        }
    }],
    nbPics: {
        type: Number
    },
    nbGifs: {
        type: String
    },
    nsfw: {
        type: Boolean
    }
}, {
        timestamps: {}
    });

/**
 * Statics
 */

CategorySchema.statics = {
    /**
    * Save Category
    * @param {Number} id - id of the category
    * @param {String} category - Category
    * @returns {Promise}
    */
    createOrUpdate(category) {
        return this.get(category.name)
            .then(exist => {
                let cat;
                if (exist) {
                    cat = exist;
                }
                else {
                    cat = new this();
                }
                cat.id = category.id;
                cat.name = category.name;
                cat.relatedCategory = category.relatedCategory;
                cat.subreddits = category.subreddits;
                cat.nbPics = category.nbPics;
                cat.nbGifs = category.nbGifs;
                cat.nsfw = category.nsfw;
                return cat.save();
            });
    },

    /**
     * Get Category
     * @param {String} category
     * @returns {Promise}
     */
    get(category) {
        return this.findOne({
            name: category
        });
    },

    /**
     * Remove all Category
     * @returns {Promise}
     */
    delete() {
        return this.remove({});
    },
    /**
     * Get all Category
     * @returns {Promise}
     */
    all() {
        return this.find({});
    },

    /**
     * Search Category
     * @param {String} category
     * @returns {Promise}
     */
    search(category) {
        return this.find({
            name: { $regex: category, $options: "i" }
        }).select({ "name": 1, "_id": 0 });
    }
};

/**
 * @typedef Category
 */
export default mongoose.model("Category", CategorySchema);
