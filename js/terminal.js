// terminal.html のエントリポイント。入力されたコマンドを実行し、結果を履歴として表示する。
import { executeTerminalCommand } from "./services/terminalCommandService.js";
import { initializeTheme } from "./ui/theme.js";
import { escapeHtml } from "./ui/escapeHtml.js";

const form = document.getElementById("terminal-form");
const input = document.getElementById("terminal-input");
const output = document.getElementById("terminal-output");
const shell = document.querySelector(".terminal-shell");
const titlebar = document.getElementById("terminal-titlebar");
const windowControls = document.getElementById("terminal-window-controls");
const commandHistory = [];
let historyIndex = 0;

initializeTheme();

function getPlatform() {
  const platform =
    navigator.userAgentData?.platform ||
    navigator.platform ||
    "";

  if (/win/i.test(platform)) return "windows";
  if (/mac|iphone|ipad|ipod/i.test(platform)) return "mac";
  return "mac";
}

function renderWindowControls() {
  const platform = getPlatform();

  titlebar.dataset.platform = platform;
  windowControls.innerHTML = platform === "windows"
    ? `
      <span class="terminal-window-button" title="Minimize">
        <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 8h8"/></svg>
      </span>
      <span class="terminal-window-button" title="Maximize">
        <svg viewBox="0 0 12 12" aria-hidden="true"><rect x="2.5" y="2.5" width="7" height="7" rx="0.8"/></svg>
      </span>
      <span class="terminal-window-button terminal-window-close" title="Close">
        <svg viewBox="0 0 12 12" aria-hidden="true"><path d="m3 3 6 6M9 3 3 9"/></svg>
      </span>
    `
    : `
      <span class="terminal-traffic-light bg-[#ff5f57]"></span>
      <span class="terminal-traffic-light bg-[#ffbd2e]"></span>
      <span class="terminal-traffic-light bg-[#28c840]"></span>
    `;
}

function appendBlock(html) {
  const block = document.createElement("div");

  block.className = "terminal-line";
  block.innerHTML = html;
  output.appendChild(block);
  output.scrollTop = output.scrollHeight;
}

function appendWelcome() {
  appendBlock(
    [
      "<span class=\"terminal-accent\">Welcome to ProbPlan CLI.</span>",
      "Run help to see commands, or projects to list your projects.",
      "Add --ja to commands when you want Japanese output.",
      "",
      "Example: project add \"Contest prep\" --deadline 2026-08-31",
      "Example: task add #1 \"Polish UI\" --priority high --estimate 1,2,4",
    ].join("\n")
  );
}

function appendCommand(command) {
  appendBlock(`<span class="terminal-accent">$</span> ${escapeHtml(command)}`);
}

function appendResult(result) {
  if (!result.output) return;

  const statusClass = result.ok ? "terminal-success" : "terminal-error";
  appendBlock(`<span class="${statusClass}">${escapeHtml(result.output)}</span>`);
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const command = input.value.trim();

  if (!command) return;

  commandHistory.push(command);
  historyIndex = commandHistory.length;
  appendCommand(command);
  input.value = "";

  const result = executeTerminalCommand(command);

  if (result.clear) {
    output.textContent = "";
    return;
  }

  if (result.exit) {
    window.location.href = "./index.html";
    return;
  }

  appendResult(result);
});

input.addEventListener("keydown", event => {
  if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
  if (commandHistory.length === 0) return;

  event.preventDefault();

  if (event.key === "ArrowUp") {
    historyIndex = Math.max(0, historyIndex - 1);
  } else {
    historyIndex = Math.min(commandHistory.length, historyIndex + 1);
  }

  input.value = commandHistory[historyIndex] ?? "";
  input.setSelectionRange(input.value.length, input.value.length);
});

shell.addEventListener("pointerdown", event => {
  // 出力テキストを選択している時は、フォーカス復帰で選択を消さない。
  if (event.target.closest("#terminal-output")) return;
  if (event.target.closest("input, button, a")) return;
  input.focus();
});

renderWindowControls();
appendWelcome();
input.focus();
