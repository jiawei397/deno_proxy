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

  await t.step("no http", () => {
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

  await t.step("esm.sh", () => {
    const originUrl = "https://esm.sh/ejs@1.0.0/mod.ts";
    assertEquals(
      transUrl(originUrl, "http://localhost:3000/"),
      originUrl,
    );
    assertEquals(
      transUrl(originUrl, "http://localhost:3000"),
      originUrl,
    );

    const originUrl2 = "https://esm.sh.test/ejs@1.0.0/mod.ts";
    assertEquals(
      transUrl(originUrl2, "http://localhost:3000/"),
      `http://localhost:3000/https/esm.sh.test/ejs@1.0.0/mod.ts`,
    );
    assertEquals(
      transUrl(originUrl2, "http://localhost:3000"),
      `http://localhost:3000/https/esm.sh.test/ejs@1.0.0/mod.ts`,
    );
  });

  await t.step("localhost or 127.0.0.1", () => {
    const originUrl = "http://localhost:8080/mod.ts";
    assertEquals(
      transUrl(originUrl, "http://localhost:3000/"),
      originUrl,
    );
    assertEquals(
      transUrl(originUrl, "http://localhost:3000"),
      originUrl,
    );

    const originUrl2 = "http://127.0.0.1:5500/ejs/mod.ts";
    assertEquals(
      transUrl(originUrl2, "http://localhost:3000/"),
      originUrl2,
    );
    assertEquals(
      transUrl(originUrl2, "http://localhost:3000"),
      originUrl2,
    );

    const originUrl3 = "http://localhost/mod.ts";
    assertEquals(
      transUrl(originUrl3, "http://localhost:3000/"),
      originUrl3,
    );
    assertEquals(
      transUrl(originUrl3, "http://localhost:3000"),
      originUrl3,
    );
  });

  await t.step("ignoreOrigins", () => {
    const originUrl = "https://baidu.com/aa.js";
    const ignoreOrigins = ["/baidu.com/"];
    assertEquals(
      transUrl(originUrl, "http://localhost:3000/", ignoreOrigins),
      originUrl,
    );
    assertEquals(
      transUrl(originUrl, "http://localhost:3000", ignoreOrigins),
      originUrl,
    );

    const ignoreOrigins2 = ["www.baidu.com/"];
    assertEquals(
      transUrl(originUrl, "http://localhost:3000/", ignoreOrigins2),
      `http://localhost:3000/https/baidu.com/aa.js`,
    );
    assertEquals(
      transUrl(originUrl, "http://localhost:3000", ignoreOrigins2),
      `http://localhost:3000/https/baidu.com/aa.js`,
    );
  });
});
