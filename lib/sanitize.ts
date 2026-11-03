import sanitizeHtml from "sanitize-html";

/**
 * Article bodies are authored in CKEditor by an admin and rendered with
 * dangerouslySetInnerHTML, so the stored HTML is trusted only as far as the
 * single shared admin account is. Sanitising on render means a compromised
 * account (or an imported document) cannot plant a script that runs for every
 * public visitor.
 *
 * The allowlist mirrors the nine plugins configured in
 * components/admin/RichTextEditorInner.tsx — anything the editor cannot
 * produce has no reason to survive.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "h2",
    "h3",
    "h4",
    "ul",
    "ol",
    "li",
    "blockquote",
    "a",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  transformTags: {
    // Links authored in the editor can point anywhere; make sure an external
    // target cannot reach back through window.opener.
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
  },
};

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, OPTIONS);
}
