import { blue, parse, red } from "../deps.ts";
import { CliConfig } from "./type.ts";
import { rewriteImportMap } from "./utils.ts";

function parseConfig() {
  const config = parse(Deno.args) as unknown as CliConfig;
  if (!config.baseUrl) {
    console.error(red(`baseUrl must be set`));
    Deno.exit(1);
  }
  if (!config.oldPath) {
    config.oldPath = "import_map.json";
  }
  if (!config.newPath) {
    config.newPath = config.oldPath;
  }
  return config;
}

async function main() {
  const config = parseConfig();
  await rewriteImportMap(config);
  console.info(blue(`write to ${config.newPath} ok`));
}

if (import.meta.main) {
  main();
}
