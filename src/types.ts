import { LevelName, LogAppender } from "../deps.ts";

export interface Config {
  baseUrl: string; // http://localhost
  port: string;
  cacheBrowserDir: string;
  cacheDenoDir: string;
  isCacheNoVersion?: boolean; // 缓存了不带版本号的文件，需要把它的引用记录到一个文件里，过期清除
  logLevel?: LevelName;
  logFilePath?: string;
  logAppenders?: LogAppender | LogAppender[];
}
