import globals from "./globals.ts";
import { serveHttp } from "./serve.ts";

export async function main() {
  const server = Deno.listen({ port: Number(globals.port) });
  console.log(
    `HTTP webserver running.  Access it at:  http://localhost:${globals.port}/`,
  );
  addEventListener("unhandledrejection", (evt) => {
    evt.preventDefault();
    console.error(`unhandledrejection`, evt.reason);
  });

  addEventListener("error", (evt) => {
    evt.preventDefault(); // 这句很重要
    console.error(`global error`, evt.error);
  });
  for await (const conn of server) {
    serveHttp(conn, globals);
  }
}
