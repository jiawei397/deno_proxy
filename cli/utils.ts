import { CliConfig } from "./type.ts";

export function transUrl(originUrl: string, baseUrl: string) {
  const last = originUrl.replace(/:\/\//, "/");
  return `${baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"}${last}`;
}

/**
   * 重写import_map.json
   * @example
   * await rewriteImportMap({
      oldPath: "example/import_map.json",
      newPath: "example/import_map_proxy.json",
      baseUrl: "http://localhost:8080",
    }),
   */
export async function rewriteImportMap(options: CliConfig) {
  const { oldPath, newPath, baseUrl } = options;
  const data = await Deno.readTextFile(oldPath);
  const json = JSON.parse(data);
  const map = json.imports;
  Object.keys(map).forEach((key) => {
    map[key] = transUrl(map[key], baseUrl);
  });

  await Deno.writeTextFile(newPath, JSON.stringify(json, null, 2));
  return json;
}
