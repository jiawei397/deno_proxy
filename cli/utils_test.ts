import { replaceImportText, transUrl } from "./utils.ts";
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
    assertEquals(
      transUrl(originUrl, "http://localhost"),
      "http://localhost/http/deno.land/std@0.117.0/",
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
      "http://localhost:3000/https/esm.sh/ejs@1.0.0/mod.ts",
    );
    assertEquals(
      transUrl(originUrl, "http://localhost:3000"),
      "http://localhost:3000/https/esm.sh/ejs@1.0.0/mod.ts",
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
      "http://localhost:3000/http/localhost:8080/mod.ts",
    );
    assertEquals(
      transUrl(originUrl, "http://localhost:3000"),
      "http://localhost:3000/http/localhost:8080/mod.ts",
    );

    const originUrl2 = "http://127.0.0.1:5500/ejs/mod.ts";
    assertEquals(
      transUrl(originUrl2, "http://localhost:3000/"),
      "http://localhost:3000/http/127.0.0.1:5500/ejs/mod.ts",
    );
    assertEquals(
      transUrl(originUrl2, "http://localhost:3000"),
      "http://localhost:3000/http/127.0.0.1:5500/ejs/mod.ts",
    );

    const originUrl3 = "http://localhost/mod.ts";
    assertEquals(
      transUrl(originUrl3, "http://localhost:3000/"),
      "http://localhost:3000/http/localhost/mod.ts",
    );
    assertEquals(
      transUrl(originUrl3, "http://localhost:3000"),
      "http://localhost:3000/http/localhost/mod.ts",
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

Deno.test("replaceImportText", async (t) => {
  await t.step("不使用currentUrl", () => {
    const currentUrl = "https://esm.sh/v114/jszip@3.5.0/deno/jszip.mjs";
    const originText =
      `import $,{abcd as bc, abcd} from "https://www.baidu.com/aeei132/riri/";`;
    const result =
      `import $,{abcd as bc, abcd} from "http://localhost/https/www.baidu.com/aeei132/riri/";`;
    assertEquals(
      replaceImportText(originText, "http://localhost/"),
      result,
    );
    assertEquals(
      replaceImportText(originText, "http://localhost"),
      result,
    );
    assertEquals(
      replaceImportText(originText, "http://localhost/", currentUrl),
      result,
    );
    assertEquals(
      replaceImportText(originText, "http://localhost", currentUrl),
      result,
    );
  });

  await t.step("使用currentUrl", () => {
    const originText =
      `import $,{abcd as bc, abcd} from "https://www.baidu.com/aeei132/riri/";
      import * as _1$ from "/v114/pako@1.0.11/deno/pako.mjs";`;
    const result =
      `import $,{abcd as bc, abcd} from "http://localhost/https/www.baidu.com/aeei132/riri/";
      import * as _1$ from "/v114/pako@1.0.11/deno/pako.mjs";`;
    assertEquals(
      replaceImportText(originText, "http://localhost/"),
      result,
    );
    assertEquals(
      replaceImportText(originText, "http://localhost"),
      result,
    );

    const currentUrl = "https://esm.sh/v114/jszip@3.5.0/deno/jszip.mjs";
    const result2 =
      `import $,{abcd as bc, abcd} from "http://localhost/https/www.baidu.com/aeei132/riri/";
      import * as _1$ from "http://localhost/https/esm.sh/v114/pako@1.0.11/deno/pako.mjs";`;
    assertEquals(
      replaceImportText(originText, "http://localhost/", currentUrl),
      result2,
    );
    assertEquals(
      replaceImportText(originText, "http://localhost", currentUrl),
      result2,
    );
  });

  await t.step("换行", () => {
    const originText = `export {
        ExtMapping,
        MimeMapping,
      } from "https://deno.land/x/common_mime_types@0.1.1/mod.ts";`;
    const result = `export {
        ExtMapping,
        MimeMapping,
      } from "http://localhost/https/deno.land/x/common_mime_types@0.1.1/mod.ts";`;
    assertEquals(
      replaceImportText(originText, "http://localhost/"),
      result,
    );
  });

  await t.step(
    "Deno test case 1: should replace one import URL with a new URL",
    () => {
      const originText =
        `import $,{abcd as bc, abcd} from "https://www.baidu.com/aeei132/riri/";`;
      const result =
        `import $,{abcd as bc, abcd} from "http://localhost/https/www.baidu.com/aeei132/riri/";`;
      assertEquals(
        replaceImportText(
          originText,
          "http://localhost/",
          "https://esm.sh/v114/jszip@3.5.0/deno/jszip.mjs",
        ),
        result,
      );
    },
  );

  await t.step(
    "replaceImportText should replace multiple export URLs with new URLs",
    () => {
      const originText = `export * from "https://www.google.com/a/bcd.html";
       export * from "https://esm.sh/v86/dayjs@1.11.3/es2022/dayjs.js";`;
      const result =
        `export * from "http://localhost/https/www.google.com/a/bcd.html";
       export * from "http://localhost/https/esm.sh/v86/dayjs@1.11.3/es2022/dayjs.js";`;
      assertEquals(
        replaceImportText(
          originText,
          "http://localhost/",
          "https://esm.sh/v114/jszip@3.5.0/deno/jszip.mjs",
        ),
        result,
      );
    },
  );

  await t.step(
    "replaceImportText should replace one import URL and one export URL with new URLs",
    () => {
      const originText =
        `import * as _1$ from "/v114/pako@1.0.11/deno/pako.mjs";
       export { default } from "https://esm.sh/v86/dayjs@1.11.3/es2022/dayjs.js";`;
      const result =
        `import * as _1$ from "http://localhost/https/esm.sh/v114/pako@1.0.11/deno/pako.mjs";
       export { default } from "http://localhost/https/esm.sh/v86/dayjs@1.11.3/es2022/dayjs.js";`;
      assertEquals(
        replaceImportText(
          originText,
          "http://localhost/",
          "https://esm.sh/v114/jszip@3.5.0/deno/jszip.mjs",
        ),
        result,
      );
    },
  );
});
