import { describe, expect, it } from "vitest";
import {
  parseId,
  readBoolean,
  readInt,
  readOptionalString,
  readString,
} from "@/lib/forms";

function form(fields: Record<string, string | File>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("readString", () => {
  it("trims the value", () => {
    expect(readString(form({ a: "  halo  " }), "a")).toBe("halo");
  });

  it("returns an empty string for a missing field or a file", () => {
    expect(readString(form({}), "a")).toBe("");
    expect(readString(form({ a: new File(["x"], "a.txt") }), "a")).toBe("");
  });
});

describe("readOptionalString", () => {
  it("returns null for a blank value", () => {
    expect(readOptionalString(form({ a: "   " }), "a")).toBeNull();
    expect(readOptionalString(form({ a: "halo" }), "a")).toBe("halo");
  });
});

describe("readInt", () => {
  it("parses a number", () => {
    expect(readInt(form({ a: " 42 " }), "a")).toBe(42);
  });

  it("uses the fallback for something that is not a number", () => {
    expect(readInt(form({ a: "abc" }), "a", 7)).toBe(7);
  });
});

describe("readBoolean", () => {
  it("is true only for a ticked checkbox", () => {
    expect(readBoolean(form({ a: "on" }), "a")).toBe(true);
    expect(readBoolean(form({}), "a")).toBe(false);
  });
});

describe("parseId", () => {
  it("accepts a positive integer", () => {
    expect(parseId("12")).toBe(12);
  });

  it.each(["abc", "0", "-1", "1.5", "NaN", "Infinity"])("rejects %j", (value) => {
    expect(parseId(value)).toBeNull();
  });
});
