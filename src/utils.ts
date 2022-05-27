export function transUrl(originUrl: string, baseUrl: string) {
  const last = originUrl.replace(/:\/\//, "/");
  console.log(last);
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
