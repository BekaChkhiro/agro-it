/**
 * Isomorphic HTML sanitizer.
 *
 * Product/blog descriptions are admin-authored rich text (Quill) stored as HTML.
 * We render them with dangerouslySetInnerHTML, so they must be sanitized.
 *
 * We use `sanitize-html` (pure JS) instead of DOMPurify because DOMPurify needs
 * a DOM and throws during Next.js server-side rendering ("sanitize is not a
 * function"), which caused the whole product page to bail out of SSR — no H1,
 * description, or JSON-LD in the initial HTML. `sanitize-html` runs identically
 * on the server and the client, so the content is server-rendered for crawlers
 * and hydrates without a mismatch.
 */
import sanitizeHtmlLib from "sanitize-html";

// Tags Quill can emit for formatted content.
const ALLOWED_TAGS = [
  "p", "br", "span", "div",
  "strong", "b", "em", "i", "u", "s", "sub", "sup",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  "a", "img", "hr",
  "table", "thead", "tbody", "tr", "th", "td",
];

export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return "";
  return sanitizeHtmlLib(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      // Quill uses classes for alignment/indent (e.g. ql-align-center).
      "*": ["class", "style"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    // Force safe rel on links that open in a new tab.
    transformTags: {
      a: (tagName, attribs) => {
        if (attribs.target === "_blank") {
          attribs.rel = "noopener noreferrer";
        }
        return { tagName, attribs };
      },
    },
  });
}
