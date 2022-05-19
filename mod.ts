import { ExtMapping, extname, parse } from "./deps.ts";

const CACHE_DIR_BROWSER = "data/1";
const CACHE_DIR_DENO = "data/2";
// 缓存了不带版本号的文件，需要把它记录到一个文件里，过期清除
const isCacheNoVersion = true; //Deno.env.get("CACHE_NO_VERSION") === "true";

async function readTextFile(path: string) {
  try {
    const text = await Deno.readTextFile(path);
    return text;
  } catch {
    return null;
  }
}

async function mkdir(path: string) {
  try {
    await Deno.mkdir(path, { recursive: true });
  } catch (e) {
    console.error(e);
  }
}

function hasVersion(path: string) {
  return /@v?\d{1,3}\.\d{1,3}\.\d{1,3}/.test(path);
}

async function fetchFromRemote(url: string, req: Request) {
  let cacheDir = CACHE_DIR_DENO;
  const userAgent = req.headers.get("User-Agent");
  if (!userAgent || !userAgent.startsWith("Deno")) {
    cacheDir = CACHE_DIR_BROWSER;
  }
  let filePath = cacheDir + "/" + url.replace(/:\/\//, "/");
  // console.log(filePath, hasVersion(url));
  const ext = extname(filePath);
  if (!ext || !ExtMapping[ext]) { // 没有后缀，或者后缀不在映射表中，表示很可能是个目录，这时需要拼接一下，不然它会造成创建目录失败
    // console.log(ExtMapping[ext]);
    filePath += "-index.html";
  }
  const isHasVersion = hasVersion(url);
  if (isHasVersion || isCacheNoVersion) {
    const text = await readTextFile(filePath);
    if (text !== null) {
      console.debug(`${url} loaded from local file`);
      return text;
    }
  }
  const headers = new Headers(req.headers);

  const res = await fetch(url, {
    headers,
  });
  const data = await res.arrayBuffer();
  console.info(`${url} loaded from remote file ok`);
  if (isHasVersion || isCacheNoVersion) {
    const arr = filePath.split("/");
    arr.pop();
    await mkdir(arr.join("/"));
    await Deno.writeFile(filePath, new Uint8Array(data));
  }
  return data;
}

async function serveHttp(conn: Deno.Conn) {
  const httpConn = Deno.serveHttp(conn);
  for await (const requestEvent of httpConn) {
    const req = requestEvent.request;
    const url = req.url;
    console.info(`${req.method} ${url}`);
    const urlMap = new URL(url);
    const tempArr = urlMap.pathname.split("/").filter(Boolean);
    const first = tempArr.shift()!;
    if (!/^http[s]$/.test(first)) {
      return requestEvent.respondWith(
        new Response("Wrong agreement", {
          status: 404,
        }),
      );
    }
    const realUrl = first + "://" + tempArr.join("/");
    // const userAgent = req.headers.get("User-Agent");
    // if (!userAgent || !userAgent.startsWith("Deno")) {
    //   return requestEvent.respondWith(
    //     new Response(null, {
    //       status: 301,
    //       headers: new Headers({
    //         location: realUrl,
    //       }),
    //     }),
    //   );
    // }
    try {
      const body = await fetchFromRemote(realUrl, req);
      requestEvent.respondWith(
        new Response(body, {
          status: 200,
          headers: req.headers,
        }),
      );
    } catch (e) {
      requestEvent.respondWith(
        new Response(e.message, {
          status: 500,
        }),
      );
    }
  }
}

interface ServerArgs {
  port?: string;
}

async function main() {
  const serverArgs = parse(Deno.args) as ServerArgs;
  const port = serverArgs.port || Deno.env.get("PORT") || "8080";
  const server = Deno.listen({ port: Number(port) });
  console.log(
    `HTTP webserver running.  Access it at:  http://localhost:${port}/`,
  );
  for await (const conn of server) {
    serveHttp(conn);
  }
}

main();
