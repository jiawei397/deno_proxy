import { parse } from "../deps.ts";
import { Config, Scripts } from "./types.ts";
import { readYaml } from "./utils.ts";

function parseConfig() {
  const config = parse(Deno.args) as unknown as Config;
  if (!config.port) {
    config.port = Deno.env.get("PORT") || "80";
  }
  if (!config.baseUrl) {
    config.baseUrl = Deno.env.get("BASE_URL") ||
      `http://localhost:${config.port}`;
  }
  if (!config.cacheBrowserDir) {
    config.cacheBrowserDir = Deno.env.get("CACHE_DIR_BROWSER") || "cache/1";
  }
  if (!config.cacheDenoDir) {
    config.cacheDenoDir = Deno.env.get("CACHE_DIR_DENO") || "cache/2";
  }
  if (config.isCacheNoVersion === undefined) {
    config.isCacheNoVersion = Deno.env.get("CACHE_NO_VERSION") === "true";
  }

  return config;
}

const config = parseConfig();

export default config;

const scriptsConfig = await readYaml<Scripts>("scripts.yml");

export const version = scriptsConfig.version;
