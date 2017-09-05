import mongoose from "../server/mongo";

export const CategorySchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
    }
}, {
        timestamps: {}
    });

/**
 * Virtuals fields
 */

/**
 * Pre-save hooks
 */

/**
 * Methods
 */

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
    create(id, name) {
        const category = new this();
        category.id = id;
        category.name = name;
        return category.save();
    },

    /**
     * Get Category
     * @param {String} category - Category
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
