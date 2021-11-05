import { contentType, parse } from "./deps.ts";

const CACHE_DIR = "data";

async function readTextFile(path: string) {
  try {
    const text = await Deno.readTextFile(path);
    return text;
  } catch {
    return null;
  }
}

async function fetchFromRemote(url: string) {
  const filePath = CACHE_DIR + "/" + url.replace(/:\/\//, "/");
  const text = await readTextFile(filePath);
  if (text !== null) {
    console.debug(`${url} loaded from local file`);
    return text;
  }
  const res = await fetch(url);
  const data = await res.arrayBuffer();
  console.info(`${url} loaded from remote file ok`);
  const arr = filePath.split("/");
  arr.pop();
  await Deno.mkdir(arr.join("/"), { recursive: true });
  await Deno.writeFile(filePath, new Uint8Array(data));
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
    const userAgent = req.headers.get("User-Agent");
    if (!userAgent || !userAgent.startsWith("Deno")) {
      return requestEvent.respondWith(
        new Response(null, {
          status: 301,
          headers: new Headers({
            location: realUrl,
          }),
        }),
      );
    }
    try {
      const body = await fetchFromRemote(realUrl);
      requestEvent.respondWith(
        new Response(body, {
          status: 200,
          headers: new Headers({
            "content-type": contentType(url) || "text/plain",
          }),
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
