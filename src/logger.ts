import { DateFileLogConfig, getLogger, initLog, LogAppender } from "../deps.ts";
import globals from "./globals.ts";

const appenders: LogAppender[] = globals.logAppenders
  ? (Array.isArray(globals.logAppenders)
    ? globals.logAppenders
    : [globals.logAppenders])
  : ["console"];
const config: DateFileLogConfig = {
  "appenders": {
    "dateFile": {
      "filename": globals.logFilePath || "logs/deno",
      "daysToKeep": 10,
      "pattern": "yyyy-MM-dd.log",
    },
  },
  "categories": {
    "default": {
      appenders,
      level: globals.logLevel || "INFO",
    },
  },
};

await initLog(config);

export const logger = getLogger();
