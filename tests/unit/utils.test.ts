import { describe, expect, it } from "vitest";
import {
  buildWhatsAppLink,
  excerpt,
  formatDate,
  formatViews,
  slugify,
  toDateInputValue,
} from "@/lib/utils";

describe("formatDate", () => {
  it("writes the month in Indonesian", () => {
    expect(formatDate(new Date(2026, 0, 15))).toBe("15 Januari 2026");
  });
});

describe("formatViews", () => {
  it.each([
    [0, "0"],
    [999, "999"],
    [1_000, "1.0rb"],
    [1_500, "1.5rb"],
    [1_000_000, "1.0jt"],
  ])("%i -> %s", (views, expected) => {
    expect(formatViews(views)).toBe(expected);
  });
});

describe("buildWhatsAppLink", () => {
  it.each([
    ["08123456789", "https://wa.me/628123456789"],
    ["628123456789", "https://wa.me/628123456789"],
    ["+62 812-3456-789", "https://wa.me/628123456789"],
  ])("normalises %s", (number, expected) => {
    expect(buildWhatsAppLink(number)).toBe(expected);
  });

  it("encodes the message", () => {
    expect(buildWhatsAppLink("0812", "Halo & salam")).toBe(
      "https://wa.me/62812?text=Halo%20%26%20salam"
    );
  });
});

describe("excerpt", () => {
  it("strips tags and entities", () => {
    expect(excerpt("<p>Halo&nbsp;<strong>Tim</strong> &amp; warga&#39;</p>")).toBe(
      "Halo Tim & warga"
    );
  });

  it("returns short text untouched", () => {
    expect(excerpt("<p>pendek</p>", 10)).toBe("pendek");
  });

  it("cuts long text at a word boundary", () => {
    expect(excerpt("satu dua tiga empat", 10)).toBe("satu dua…");
  });

  it("cuts inside a single long word", () => {
    expect(excerpt("abcdefghijkl", 5)).toBe("abcde…");
  });
});

describe("slugify", () => {
  it.each([
    ["Program PPM 2026", "program-ppm-2026"],
    ["  Halo,   Dunia!  ", "halo-dunia"],
    ["a - b -- c", "a-b-c"],
  ])("%j -> %s", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });
});

describe("toDateInputValue", () => {
  it("uses the local date and pads the month and day", () => {
    expect(toDateInputValue(new Date(2026, 0, 5, 1, 30))).toBe("2026-01-05");
  });
});
