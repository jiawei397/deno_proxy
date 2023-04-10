import { CliConfig } from "./type.ts";

export function transUrl(
  originUrl: string,
  baseUrl: string,
  ignoreOrigins: string[] = [],
  currentUrl?: string,
): string {
  if (!/^https?/.test(originUrl)) {
    if (originUrl.startsWith("/") && currentUrl) {
      const pre = new URL(currentUrl).origin;
      return transUrl(pre + originUrl, baseUrl, ignoreOrigins, currentUrl);
    } else {
      return originUrl;
    }
  }
  if (ignoreOrigins.some((url) => originUrl.includes(url))) {
    return originUrl;
  }
  const last = originUrl.replace(/:\/\//, "/");
  return `${baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"}${last}`;
}

export function replaceImportText(
  originText: string,
  baseUrl: string,
  currentUrl?: string,
): string {
  // const reg = /[import|export]+\s.*["']+(http[s]?:\/\/[\w\.-]+)\//g;
  const reg =
    /(import|export)+[\s\S\w$*]*?["']+(((https?:\/\/)|\/)[\w\.-]+)\//g;
  return originText.replaceAll(reg, (match, _$0, str) => {
    const transed = transUrl(str, baseUrl, [], currentUrl);
    return match.replace(str, transed);
  });
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
  const { oldPath, newPath, baseUrl, ignoreOrigins } = options;
  const data = await Deno.readTextFile(oldPath);
  const json = JSON.parse(data);
  const map = json.imports;
  Object.keys(map).forEach((key) => {
    map[key] = transUrl(map[key], baseUrl, ignoreOrigins as string[]);
  });

  await Deno.writeTextFile(newPath, JSON.stringify(json, null, 2));
  return json;
}

export async function rewriteDeps(options: CliConfig) {
  const { oldPath, newPath, baseUrl } = options;
  const data = await Deno.readTextFile(oldPath);
  const newData = replaceImportText(data, baseUrl);

  await Deno.writeTextFile(newPath, newData);
  return newData;
}
