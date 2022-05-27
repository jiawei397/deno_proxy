import { main } from "./src/main.ts";
export * from "./src/utils.ts";

if (import.meta.main) {
  main();
}
