import { transUrl } from "./utils.ts";
import { assertEquals } from "../test_deps.ts";

Deno.test("transUrl", () => {
  const originUrl = "https://deno.land/std@0.117.0/";
  assertEquals(
    transUrl(originUrl, "http://localhost:3000/"),
    "http://localhost:3000/https/deno.land/std@0.117.0/",
  );
  assertEquals(
    transUrl(originUrl, "http://localhost:3000"),
    "http://localhost:3000/https/deno.land/std@0.117.0/",
  );
});
