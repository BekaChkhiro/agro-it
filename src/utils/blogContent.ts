/**
 * Convert plain-text blog content into HTML with paragraphs, headings, and lists.
 * Safe for server-side rendering (no DOM dependency).
 */
export function plainTextToHtml(rawContent: string): string {
  if (!rawContent) return "";

  // If content already contains HTML tags, return as-is
  if (/<[a-z][\s\S]*>/i.test(rawContent)) {
    return rawContent;
  }

  return rawContent
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .map((block) => {
      // Numbered section headings: "1. Title"
      if (/^\d+\.\s+[^\n]+$/.test(block)) {
        return `<h3>${escapeHtml(block)}</h3>`;
      }

      // Single line that looks like a heading (short, ends without punctuation)
      if (!block.includes("\n") && block.length < 80 && !/[.!?]$/.test(block)) {
        return `<h3>${escapeHtml(block)}</h3>`;
      }

      // Bullet list (lines starting with "- " or "• ")
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.every((l) => /^[-•]\s/.test(l))) {
        const items = lines.map((l) => `<li>${escapeHtml(l.replace(/^[-•]\s/, ""))}</li>`).join("");
        return `<ul>${items}</ul>`;
      }

      // Regular paragraph — convert single newlines to <br/>
      const escaped = escapeHtml(block).replace(/\n/g, "<br/>");
      return `<p>${escaped}</p>`;
    })
    .join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Clean %0A (URL-encoded newline) from image URLs */
export function cleanImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  return url.replace(/%0[aA]/g, "");
}
