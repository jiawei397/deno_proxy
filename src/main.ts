import globals from "./globals.ts";
import { serveHttp } from "./serve.ts";

export async function main() {
  const server = Deno.listen({ port: Number(globals.port) });
  console.log(
    `HTTP webserver running.  Access it at:  http://localhost:${globals.port}/`,
  );
  for await (const conn of server) {
    serveHttp(conn, globals);
  }
}
