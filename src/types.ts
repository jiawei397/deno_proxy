export interface Config {
  port: string;
  cacheBrowserDir: string;
  cacheDenoDir: string;
  debug?: boolean;
  isCacheNoVersion?: boolean; // 缓存了不带版本号的文件，需要把它的引用记录到一个文件里，过期清除
}
