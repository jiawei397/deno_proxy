// const url = `https://deno.land/x/oak@v9.0.1/deps.ts`;
import { contentType } from "https://deno.land/x/mime_types@1.0.0/mod.ts";

async function fetchFromRemote(url: string) {
  const res = await fetch(url);
  const data = await res.text();
  const dir = "data/" + url.replace(/:\/\//, "/");
  const arr = dir.split("/");
  arr.pop();
  await Deno.mkdir(arr.join("/"), { recursive: true });
  await Deno.writeTextFile(dir, data);
  return data;
}

// fetchFromRemote(url);

// Start listening on port 8080 of localhost.
const server = Deno.listen({ port: 8080 });
console.log(`HTTP webserver running.  Access it at:  http://localhost:8080/`);

// Connections to the server will be yielded up as an async iterable.
for await (const conn of server) {
  // In order to not be blocking, we need to handle each connection individually
  // without awaiting the function
  serveHttp(conn);
}

async function serveHttp(conn: Deno.Conn) {
  // This "upgrades" a network connection into an HTTP connection.
  const httpConn = Deno.serveHttp(conn);
  // Each request sent over the HTTP connection will be yielded as an async
  // iterator from the HTTP connection.
  for await (const requestEvent of httpConn) {
    console.log(requestEvent.request.url);
    const url = requestEvent.request.url;
    if (!url.endsWith(".ts") && !url.endsWith(".js")) {
      return requestEvent.respondWith(
        new Response("Not Supported", {
          status: 404,
        }),
      );
    }
    // The native HTTP server uses the web standard `Request` and `Response`
    // objects.
    // const body = `Your user-agent is:\n\n${
    //   requestEvent.request.headers.get(
    //     "user-agent",
    //   ) ?? "Unknown"
    // }`;

    const urlMap = new URL(url);
    console.log(urlMap);
    const remoteUrl = "https://deno.land" + urlMap.pathname;
    console.log(remoteUrl);
    const body = await fetchFromRemote(remoteUrl);
    // const body = "ok";

    // The requestEvent's .respondWith() method is how we send the response back to the client.
    requestEvent.respondWith(
      new Response(body, {
        status: 200,
        headers: new Headers({
          "content-type": contentType(url) || "text/plain",
        }),
      }),
    );
  }
}
