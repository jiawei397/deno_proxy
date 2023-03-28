import { YamlLoader } from "../deps.ts";

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
  return /@v?\d+/.test(path);
}

export async function readYaml<T>(
  path: string,
): Promise<T> {
  const yamlLoader = new YamlLoader();
  let allPath = path;
  if (!/\.(yaml|yml)$/.test(path)) {
    allPath += ".yaml";
  }
  const data = await yamlLoader.parseFile(allPath);
  return data as T;
}
