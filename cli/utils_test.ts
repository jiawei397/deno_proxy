import { transUrl } from "./utils.ts";
import { assertEquals } from "../test_deps.ts";

Deno.test("transUrl", async (t) => {
  await t.step("https", () => {
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

  await t.step("http", () => {
    const originUrl = "http://deno.land/std@0.117.0/";
    assertEquals(
      transUrl(originUrl, "http://localhost:3000/"),
      "http://localhost:3000/http/deno.land/std@0.117.0/",
    );
    assertEquals(
      transUrl(originUrl, "http://localhost:3000"),
      "http://localhost:3000/http/deno.land/std@0.117.0/",
    );
  });

  await t.step("https", () => {
    const originUrl = "./src";
    assertEquals(
      transUrl(originUrl, "http://localhost:3000/"),
      originUrl,
    );
    assertEquals(
      transUrl(originUrl, "http://localhost:3000"),
      originUrl,
    );
  });
});
