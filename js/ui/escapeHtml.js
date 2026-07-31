// ユーザー入力をinnerHTMLへ表示する際の最低限のHTMLエスケープ。
const HTML_ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => HTML_ENTITIES[character]);
}
