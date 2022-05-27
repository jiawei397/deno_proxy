import { parse } from "../deps.ts";
import { serveHttp } from "./serve.ts";
import { Config } from "./types.ts";

function parseConfig() {
  const config = parse(Deno.args) as unknown as Config;
  if (!config.port) {
    config.port = Deno.env.get("PORT") || "80";
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

export async function main() {
  const config = parseConfig();
  const server = Deno.listen({ port: Number(config.port) });
  console.log(
    `HTTP webserver running.  Access it at:  http://localhost:${config.port}/`,
  );
  for await (const conn of server) {
    serveHttp(conn, config);
  }
}
