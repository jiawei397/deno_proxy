export function transUrl(originUrl: string, baseUrl: string) {
  const last = originUrl.replace(/:\/\//, "/");
  return `${baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"}${last}`;
}

export async function readTextFile(path: string) {
  try {
    const text = await Deno.readTextFile(path);
    return text;
  } catch {
    return null;
  }
}

export async function mkdir(path: string) {
  try {
    await Deno.mkdir(path, { recursive: true });
  } catch {
    // console.error(e);
  }
}

export function hasVersion(path: string) {
  return /@v?\d{1,3}\.\d{1,3}\.\d{1,3}/.test(path);
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
export async function rewriteImportMap(options: {
  oldPath: string;
  newPath: string;
  baseUrl: string;
}) {
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
