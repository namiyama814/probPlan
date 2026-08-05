// 保存テーマ、OSのカラースキーム、切替ボタンを同期する。
const THEME_STORAGE_KEY = "probplan-theme";
const LIGHT_FAVICON_PATH = "./image/favicon_light.ico";
const DARK_FAVICON_PATH = "./image/favicon_dark.ico";

function getSavedTheme() {
  try {
    const theme = localStorage.getItem(THEME_STORAGE_KEY);
    return theme === "light" || theme === "dark" ? theme : null;
  } catch {
    return null;
  }
}

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function setTheme(theme) {
  // CSS変数はhtml要素のdata属性を基準に切り替える。
  document.documentElement.dataset.theme = theme;

  const resolvedTheme = theme === "dark" ? "dark" : "light";
  let favicon = document.querySelector('link[data-app-favicon="true"]');

  if (!favicon) {
    favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/x-icon";
    favicon.dataset.appFavicon = "true";
    document.head.appendChild(favicon);
  }

  favicon.href =
    resolvedTheme === "dark" ? DARK_FAVICON_PATH : LIGHT_FAVICON_PATH;
}

function renderThemeToggle(button, theme) {
  const isDark = theme === "dark";

  button.setAttribute("aria-pressed", String(isDark));
  button.setAttribute(
    "aria-label",
    isDark ? "ライトモードに切り替え" : "ダークモードに切り替え"
  );
  button.title =
    isDark ? "ライトモードに切り替え" : "ダークモードに切り替え";

  button.innerHTML = isDark
    ? `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-5 w-5"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2"/>
        <path d="M12 20v2"/>
        <path d="m4.93 4.93 1.42 1.42"/>
        <path d="m17.66 17.66 1.41 1.41"/>
        <path d="M2 12h2"/>
        <path d="M20 12h2"/>
        <path d="m6.34 17.66-1.41 1.41"/>
        <path d="m19.07 4.93-1.41 1.41"/>
      </svg>
    `
    : `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
      </svg>
    `;
}

export function initializeTheme() {
  const button = document.getElementById("theme-toggle");
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  let theme = getSavedTheme() ?? getSystemTheme();
  setTheme(theme);

  if (button) {
    renderThemeToggle(button, theme);

    button.addEventListener("click", () => {
      theme =
        document.documentElement.dataset.theme === "dark"
          ? "light"
          : "dark";

      setTheme(theme);

      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch {
        // The selected theme still applies for the current page.
      }

      renderThemeToggle(button, theme);
    });
  }

  mediaQuery.addEventListener("change", event => {
    if (getSavedTheme()) return;

    theme = event.matches ? "dark" : "light";
    setTheme(theme);

    if (button) {
      renderThemeToggle(button, theme);
    }
  });
}
