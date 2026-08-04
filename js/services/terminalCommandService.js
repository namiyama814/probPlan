// terminal.html から使うCLIコマンドの解析と実行をまとめる。
import { ProjectManager } from "../models/projectManager.js";
import { StorageService } from "./storageService.js";
import {
  createProject,
  deleteProject,
  updateProjectDeadline,
} from "../controllers/projectController.js";
import {
  createTask,
  deleteTask,
  setTaskCompleted,
  updateTask,
} from "../controllers/taskController.js";

const PRIORITIES = ["high", "medium", "low"];

function tokenize(input) {
  const tokens = [];
  let current = "";
  let quote = null;

  for (const character of input.trim()) {
    if ((character === "\"" || character === "'") && quote === null) {
      quote = character;
      continue;
    }

    if (character === quote) {
      quote = null;
      continue;
    }

    if (/\s/.test(character) && quote === null) {
      if (current) tokens.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  if (current) tokens.push(current);
  return tokens;
}

function parseFlags(tokens) {
  const values = [];
  const flags = {};

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];

    if (!token.startsWith("--")) {
      values.push(token);
      continue;
    }

    const key = token.slice(2);
    const next = tokens[index + 1];

    if (!next || next.startsWith("--")) {
      flags[key] = true;
      continue;
    }

    flags[key] = next;
    index++;
  }

  return { values, flags };
}

function isDateLike(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function formatProject(project, index) {
  const progress = `${project.getProgress()}%`;
  const deadline = project.deadline ? ` deadline:${project.deadline}` : "";
  const archived = project.archived ? " archived" : "";

  return `#${index + 1} ${project.name} (${project.tasks.length} tasks, ${progress}${deadline}${archived})`;
}

function formatTask(task, index) {
  const status = task.status === "completed" ? "done" : "todo";
  const priority = `priority:${task.priority}`;
  const deadline = task.deadline ? ` deadline:${task.deadline}` : "";
  const estimate = [task.optimistic, task.mostLikely, task.pessimistic]
    .every(value => value !== null && value !== undefined)
    ? ` estimate:${task.optimistic}/${task.mostLikely}/${task.pessimistic}`
    : "";

  return `#${index + 1} [${status}] ${task.name} (${priority}${deadline}${estimate})`;
}

function getProject(manager, reference) {
  if (!reference) return null;

  const index = Number(reference.replace(/^#/, ""));
  if (Number.isInteger(index) && index > 0) {
    return manager.projects[index - 1] ?? null;
  }

  return manager.getProject(reference) ??
    manager.projects.find(project => project.name === reference) ??
    null;
}

function getTask(project, reference) {
  if (!project || !reference) return null;

  const index = Number(reference.replace(/^#/, ""));
  if (Number.isInteger(index) && index > 0) {
    return project.tasks[index - 1] ?? null;
  }

  return project.getTask(reference) ??
    project.tasks.find(task => task.name === reference) ??
    null;
}

function parseEstimate(flags) {
  if (!flags.estimate) return null;

  const values = String(flags.estimate)
    .split(/[,/]/)
    .map(value => Number(value));

  if (values.length !== 3 || values.some(value => !Number.isFinite(value) || value < 0)) {
    throw new Error("estimateは 1,2,3 のように0以上の数値3つで指定してください。");
  }

  const [optimistic, mostLikely, pessimistic] = values;
  if (optimistic > mostLikely || mostLikely > pessimistic) {
    throw new Error("estimateは 最短 <= 最頻 <= 最長 の順で指定してください。");
  }

  return { optimistic, mostLikely, pessimistic };
}

function getManager() {
  const state = StorageService.loadState();

  if (state.status === "corrupted") {
    throw new Error("保存データが破損しています。GUIの復旧画面でリセットしてください。");
  }

  return state.manager ?? new ProjectManager();
}

function help() {
  return [
    "ProbPlan CLI",
    "",
    "help                                      このヘルプを表示",
    "clear                                     画面をクリア",
    "projects                                  プロジェクト一覧",
    "project add \"名前\" [--deadline YYYY-MM-DD]",
    "project delete <project-id|#番号|名前>",
    "project deadline <project> YYYY-MM-DD",
    "tasks <project-id|#番号|名前>              タスク一覧",
    "task add <project> \"名前\" [--deadline YYYY-MM-DD] [--priority high|medium|low] [--estimate 1,2,3]",
    "task done <project> <task-id|#番号|名前>",
    "task todo <project> <task-id|#番号|名前>",
    "task delete <project> <task-id|#番号|名前>",
    "",
    "例: project add \"応募準備\" --deadline 2026-08-31",
    "例: task add #1 \"UIを磨く\" --priority high --estimate 1,2,4",
  ].join("\n");
}

export function executeTerminalCommand(input) {
  const tokens = tokenize(input);
  if (tokens.length === 0) {
    return { ok: true, output: "" };
  }

  const [command, subcommand, ...rest] = tokens;

  try {
    if (command === "help") {
      return { ok: true, output: help() };
    }

    if (command === "clear") {
      return { ok: true, output: "", clear: true };
    }

    const manager = getManager();

    if (command === "projects") {
      const output = manager.projects.length === 0
        ? "プロジェクトはありません。project add \"名前\" で作成できます。"
        : manager.projects.map(formatProject).join("\n");
      return { ok: true, output };
    }

    if (command === "project" && subcommand === "add") {
      const { values, flags } = parseFlags(rest);
      const name = values.join(" ").trim();
      if (!name) throw new Error("プロジェクト名を指定してください。");
      if (flags.deadline && !isDateLike(flags.deadline)) {
        throw new Error("deadlineは YYYY-MM-DD で指定してください。");
      }

      const project = createProject(manager, name, flags.deadline ?? null);
      return { ok: true, output: `作成しました: ${formatProject(project, manager.projects.length - 1)}` };
    }

    if (command === "project" && subcommand === "delete") {
      const project = getProject(manager, rest.join(" "));
      if (!project) throw new Error("プロジェクトが見つかりません。");
      deleteProject(manager, project.id);
      return { ok: true, output: `削除しました: ${project.name}` };
    }

    if (command === "project" && subcommand === "deadline") {
      const [projectReference, deadline] = rest;
      const project = getProject(manager, projectReference);
      if (!project) throw new Error("プロジェクトが見つかりません。");
      if (!isDateLike(deadline)) throw new Error("deadlineは YYYY-MM-DD で指定してください。");
      updateProjectDeadline(manager, project, deadline);
      return { ok: true, output: `締切を更新しました: ${project.name} -> ${deadline}` };
    }

    if (command === "tasks") {
      const projectReference = [subcommand, ...rest].filter(Boolean).join(" ");
      const project = getProject(manager, projectReference);
      if (!project) throw new Error("プロジェクトが見つかりません。");
      const output = project.tasks.length === 0
        ? `${project.name} にタスクはありません。`
        : project.tasks.map(formatTask).join("\n");
      return { ok: true, output };
    }

    if (command === "task" && subcommand === "add") {
      const { values, flags } = parseFlags(rest);
      const [projectReference, ...nameParts] = values;
      const project = getProject(manager, projectReference);
      if (!project) throw new Error("プロジェクトが見つかりません。");
      const name = nameParts.join(" ").trim();
      if (!name) throw new Error("タスク名を指定してください。");
      if (flags.deadline && !isDateLike(flags.deadline)) {
        throw new Error("deadlineは YYYY-MM-DD で指定してください。");
      }
      if (flags.priority && !PRIORITIES.includes(flags.priority)) {
        throw new Error("priorityは high / medium / low のいずれかで指定してください。");
      }
      const estimate = parseEstimate(flags);

      const task = createTask(
        manager,
        project,
        name,
        flags.deadline ?? null,
        flags.priority ?? "medium"
      );
      if (estimate) {
        updateTask(manager, task, {
          name: task.name,
          deadline: task.deadline,
          priority: task.priority,
          ...estimate,
        });
      }

      return { ok: true, output: `作成しました: ${formatTask(task, project.tasks.length - 1)}` };
    }

    if (command === "task" && ["done", "todo", "delete"].includes(subcommand)) {
      const [projectReference, taskReference] = rest;
      const project = getProject(manager, projectReference);
      if (!project) throw new Error("プロジェクトが見つかりません。");
      const task = getTask(project, taskReference);
      if (!task) throw new Error("タスクが見つかりません。");

      if (subcommand === "delete") {
        deleteTask(manager, project, task.id);
        return { ok: true, output: `削除しました: ${task.name}` };
      }

      setTaskCompleted(manager, task, subcommand === "done");
      return { ok: true, output: `${subcommand === "done" ? "完了" : "未完了"}にしました: ${task.name}` };
    }

    return { ok: false, output: `未知のコマンドです: ${input}\nhelp で使い方を確認できます。` };
  } catch (error) {
    return {
      ok: false,
      output: error instanceof Error ? error.message : String(error),
    };
  }
}
