import discord from "./server/discord.js";
import logger from "./server/logger.js";
import { isAlive as isMongoAlive } from "./server/mongo.js";

import "./commands/all.js";
import scroller from "./controllers/imageScroller.js";

isMongoAlive()
    .then(() => {
        logger.info("Mongo is alive");
    })
    .then(() => {
        logger.info("Okedan is started");
        return discord.clientLogin();
    })
    .then(() => {
        scroller.retrieveAllData();
    })
    .catch(err => {
        logger.error(err);
        process.exit(1);
    });