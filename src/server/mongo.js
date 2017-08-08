import config from "./config";
import mongo from "mongoose";

mongo.Promise = Promise;
mongo.connect(config.MONGO_URL);

const mongoError = new Error("Unable to connect mongodb : " + config.MONGO_URL);

/**
 * Check if mongodb is alive
 * @returns {Promise}
 */
export function isAlive() {
    return new Promise((resolve, reject) => {
        let connection = mongo.connection;
        if (connection.readyState === 1) {
            resolve();
        }
        else if (connection.readyState === 2) {
            connection.on("error", () => {
                reject(mongoError);
            });
            connection.once("open", () => {
                resolve();
            });
        }
        else {
            reject(mongoError);
        }
    });
}

export default mongo;
