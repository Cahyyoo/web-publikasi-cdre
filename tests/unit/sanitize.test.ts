import { describe, expect, it } from "vitest";
import { sanitizeArticleHtml } from "@/lib/sanitize";

describe("sanitizeArticleHtml", () => {
  it("keeps what the editor can produce", () => {
    const html =
      "<h2>Judul</h2><p><strong>a</strong> <em>b</em> <u>c</u></p><ul><li>d</li></ul><blockquote>e</blockquote>";
    expect(sanitizeArticleHtml(html)).toBe(html);
  });

  it.each([
    ["script tag", "<p>a</p><script>alert(1)</script>", "<p>a</p>"],
    ["event handler", '<p onclick="alert(1)">a</p>', "<p>a</p>"],
    ["image", '<img src="x" onerror="alert(1)">', ""],
    ["iframe", '<iframe src="https://evil.com"></iframe>', ""],
    ["style attribute", '<p style="position:fixed">a</p>', "<p>a</p>"],
  ])("removes a %s", (_label, input, expected) => {
    expect(sanitizeArticleHtml(input)).toBe(expected);
  });

  it.each(["javascript:alert(1)", "JaVaScRiPt:alert(1)", "data:text/html,x"])(
    "removes the dangerous link %s",
    (href) => {
      expect(sanitizeArticleHtml(`<a href="${href}">a</a>`)).not.toContain("href");
    }
  );

  it.each(["https://stargate.id", "mailto:a@b.id", "tel:0812"])(
    "keeps the safe link %s and protects window.opener",
    (href) => {
      const output = sanitizeArticleHtml(`<a href="${href}" target="_blank">a</a>`);
      expect(output).toContain(`href="${href}"`);
      expect(output).toContain('rel="noopener noreferrer"');
    }
  );
});
