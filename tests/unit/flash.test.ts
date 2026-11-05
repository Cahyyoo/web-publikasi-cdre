import { describe, expect, it } from "vitest";
import { toFlashCode, withFlash } from "@/lib/flash";

describe("toFlashCode", () => {
  it("accepts a known code", () => {
    expect(toFlashCode("created")).toBe("created");
  });

  it.each([undefined, "", "tidak-ada", "constructor", "toString", "hasOwnProperty", "__proto__"])(
    "rejects %j, which a visitor can type into ?flash=",
    (value) => {
      expect(toFlashCode(value)).toBeNull();
    }
  );
});

describe("withFlash", () => {
  it("starts a query string", () => {
    expect(withFlash("/admin", "created")).toBe("/admin?flash=created");
  });

  it("extends an existing query string", () => {
    expect(withFlash("/admin/login?next=%2Fadmin", "login-failed")).toBe(
      "/admin/login?next=%2Fadmin&flash=login-failed"
    );
  });
});
