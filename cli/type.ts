export interface CliConfig {
  baseUrl: string;
  oldPath: string;
  newPath: string;
  /**
   * 忽略的origins，推荐以斜杠开头，以斜杠结尾
   * 比如/cdn.skypack.dev/, /esm.sh/
   */
  ignoreOrigins?: string[] | string;
}
