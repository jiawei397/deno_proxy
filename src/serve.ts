import { replaceImportText } from "../cli/utils.ts";
import { ExtMapping, extname } from "../deps.ts";
import { logger } from "./logger.ts";
import { Config } from "./types.ts";
import { hasVersion, mkdir, readTextFile } from "./utils.ts";

async function fetchFromRemote(url: string, req: Request, config: Config) {
  logger.debug(`start fetch ${url}`);
  let cacheDir = config.cacheDenoDir;
  let isDeno = true;
  const userAgent = req.headers.get("User-Agent");
  if (!userAgent || !userAgent.startsWith("Deno")) {
    cacheDir = config.cacheBrowserDir;
    isDeno = false;
  }
  if (cacheDir.endsWith("/")) {
    cacheDir = cacheDir.substring(0, cacheDir.length - 1);
  }
  const isHasVersion = hasVersion(url);
  let filePath = cacheDir + (isHasVersion ? "/" : "/noversion/") +
    url.replace(/:\/\//, "/");
  // console.log(filePath, hasVersion(url));
  const ext = extname(filePath);
  if (!ext || !ExtMapping[ext]) { // 没有后缀，或者后缀不在映射表中，表示很可能是个目录，这时需要拼接一下，不然它会造成创建目录失败
    // console.log(ExtMapping[ext]);
    filePath += "-index.html";
  }
  if (isHasVersion || config.isCacheNoVersion) {
    const text = await readTextFile(filePath);
    if (text !== null) {
      logger.debug(`${url} loaded from local file`);
      const contentType = isDeno
        ? null
        : await readTextFile(filePath + "_type");
      return {
        contentType,
        status: 200,
        data: text,
      };
    }
  }
  const headers = new Headers(req.headers);
  const res = await fetch(url, {
    headers,
  });
  const contentType = res.headers.get("content-type");
  let data;
  if (
    ["application/javascript", "application/typescript"].some((str) =>
      contentType?.includes(str)
    )
  ) {
    data = await res.text();
    data = replaceImportText(data, config.baseUrl);
  } else {
    data = await res.arrayBuffer();
  }
  logger.info(`${url} loaded from remote file ok`);
  if (res.ok && (isHasVersion || config.isCacheNoVersion)) {
    const arr = filePath.split("/");
    arr.pop();
    await mkdir(arr.join("/"));
    if (typeof data === "string") {
      await Deno.writeTextFile(filePath, data);
    } else {
      await Deno.writeFile(filePath, new Uint8Array(data));
    }
    if (!isDeno && contentType && contentType !== "text/plain") {
      if (ExtMapping[ext]) {
        await Deno.writeTextFile(
          filePath + "_type",
          contentType,
        );
      }
    }
  }
  return {
    contentType,
    data,
    status: res.status,
  };
}

export async function serveHttp(conn: Deno.Conn, config: Config) {
  const httpConn = Deno.serveHttp(conn);
  for await (const requestEvent of httpConn) {
    const req = requestEvent.request;
    if (req.method !== "GET") {
      requestEvent.respondWith(
        new Response("not allowed", {
          status: 400,
        }),
      );
      continue;
    }
    const url = req.url;
    logger.info(`${req.method} ${url}`);
    const urlMap = new URL(url);
    const tempArr = urlMap.pathname.split("/").filter(Boolean);
    const first = tempArr.shift()!;
    if (!first) {
      requestEvent.respondWith(
        new Response("hello deno proxy"),
      );
      continue;
    }
    if (!/^http[s]$/.test(first)) {
      //   console.debug(`first ${first} not start with http[s]`);
      requestEvent.respondWith(
        new Response("Wrong agreement", {
          status: 404,
        }),
      );
      continue;
    }
    const realUrl = first + "://" + tempArr.join("/");
    try {
      const { contentType, data, status } = await fetchFromRemote(
        realUrl,
        req,
        config,
      );
      const resHeaders = new Headers();
      if (contentType) {
        resHeaders.set("content-type", contentType);
      }
      requestEvent.respondWith(
        new Response(data, {
          status: status,
          headers: resHeaders,
        }),
      );
    } catch (e) {
      logger.error(`fetch ${url} error`, e.message);
      requestEvent.respondWith(
        new Response(e.message, {
          status: e.status || 500,
        }),
      );
    }
  }
}
