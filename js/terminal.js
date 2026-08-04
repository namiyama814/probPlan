// terminal.html のエントリポイント。入力されたコマンドを実行し、結果を履歴として表示する。
import { executeTerminalCommand } from "./services/terminalCommandService.js";
import { initializeTheme } from "./ui/theme.js";

const form = document.getElementById("terminal-form");
const input = document.getElementById("terminal-input");
const output = document.getElementById("terminal-output");

initializeTheme();

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
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
      "<span class=\"text-[#8be28b]\">ProbPlan CLIへようこそ。</span>",
      "help でコマンド一覧、projects でプロジェクト一覧を表示できます。",
      "",
      "例: project add \"応募準備\" --deadline 2026-08-31",
      "例: task add #1 \"UIを磨く\" --priority high --estimate 1,2,4",
    ].join("\n")
  );
}

function appendCommand(command) {
  appendBlock(`<span class="text-[#8be28b]">$</span> ${escapeHtml(command)}`);
}

function appendResult(result) {
  if (!result.output) return;

  const statusClass = result.ok ? "text-[#d7f9df]" : "text-[#ff9b92]";
  appendBlock(`<span class="${statusClass}">${escapeHtml(result.output)}</span>`);
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const command = input.value.trim();

  if (!command) return;

  appendCommand(command);
  input.value = "";

  const result = executeTerminalCommand(command);

  if (result.clear) {
    output.textContent = "";
    return;
  }

  appendResult(result);
});

document.addEventListener("click", () => {
  // ターミナルの外側をクリックしても、すぐ次の入力に戻れるようにする。
  input.focus();
});

appendWelcome();
input.focus();
