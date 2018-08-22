import discord from "./server/discord";
import logger from "./server/logger";
import { isAlive as isMongoAlive } from "./server/mongo";

import "./commands/all";
import scroller from "./controllers/imageScroller";

isMongoAlive()
    .then(() => {
        logger.info("Mongo is alive");
    })
    .then(() => {
        logger.info("ImageBaleine is started");
        return discord.clientLogin();
    })
    .then(() => {
        scroller.retrieveAllData();
    })
    .catch(err => {
        logger.error(err);
        process.exit(1);
    });