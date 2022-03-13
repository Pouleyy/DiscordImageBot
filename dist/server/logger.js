import bunyan from "bunyan";
import config from "./config.js";

const logger = new bunyan.createLogger({
    name: "Okedan",
    stream: process.stdout,
    level: config.LOG_LEVEL
});

export default logger;