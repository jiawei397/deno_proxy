import { hasVersion } from "./utils.ts";
import { assertEquals } from "../test_deps.ts";

Deno.test("hasVersion should return true for paths with version numbers", async (it) => {
  await it.step("hasVersion should return true for paths with version numbers", () => {
    const path = "/example@v1.0.0";
    const result = hasVersion(path);
    assertEquals(result, true);

    const path2 = "/example@v1";
    const result2 = hasVersion(path2);
    assertEquals(result2, true);

    const path3 = "/example@1";
    const result3 = hasVersion(path3);
    assertEquals(result3, true);

    const path4 = "/example@1/mod.ts";
    const result4 = hasVersion(path4);
    assertEquals(result4, true);
  });

  await it.step("hasVersion should return false for paths without version numbers", () => {
    const path = "/example";
    const result = hasVersion(path);
    assertEquals(result, false);
  });
});
