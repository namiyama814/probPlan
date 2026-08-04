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
const LANGUAGE_FLAG = "--ja";

const messages = {
  en: {
    noProjects: "No projects yet. Create one with project add \"Name\".",
    created: "Created",
    deleted: "Deleted",
    projectNameRequired: "Please provide a project name.",
    taskNameRequired: "Please provide a task name.",
    deadlineFormat: "deadline must use YYYY-MM-DD.",
    projectNotFound: "Project not found.",
    taskNotFound: "Task not found.",
    deadlineUpdated: "Deadline updated",
    noTasks: projectName => `${projectName} has no tasks.`,
    priorityInvalid: "priority must be high, medium, or low.",
    estimateCountInvalid: "estimate must contain three non-negative numbers, such as 1,2,3.",
    estimateOrderInvalid: "estimate must be ordered as optimistic <= most likely <= pessimistic.",
    done: "Marked as done",
    todo: "Marked as todo",
    unknownCommand: input => `Unknown command: ${input}\nRun help to see available commands.`,
    corrupted: "Saved data is corrupted. Please reset it from the GUI recovery screen.",
  },
  ja: {
    noProjects: "プロジェクトはありません。project add \"名前\" で作成できます。",
    created: "作成しました",
    deleted: "削除しました",
    projectNameRequired: "プロジェクト名を指定してください。",
    taskNameRequired: "タスク名を指定してください。",
    deadlineFormat: "deadlineは YYYY-MM-DD で指定してください。",
    projectNotFound: "プロジェクトが見つかりません。",
    taskNotFound: "タスクが見つかりません。",
    deadlineUpdated: "締切を更新しました",
    noTasks: projectName => `${projectName} にタスクはありません。`,
    priorityInvalid: "priorityは high / medium / low のいずれかで指定してください。",
    estimateCountInvalid: "estimateは 1,2,3 のように0以上の数値3つで指定してください。",
    estimateOrderInvalid: "estimateは 最短 <= 最頻 <= 最長 の順で指定してください。",
    done: "完了にしました",
    todo: "未完了にしました",
    unknownCommand: input => `未知のコマンドです: ${input}\nhelp で使い方を確認できます。`,
    corrupted: "保存データが破損しています。GUIの復旧画面でリセットしてください。",
  },
};

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

function extractLanguage(tokens) {
  const language = tokens.includes(LANGUAGE_FLAG) ? "ja" : "en";
  const commandTokens = tokens.filter(token => token !== LANGUAGE_FLAG);

  return { language, commandTokens };
}

function formatProject(project, index, language = "en") {
  const progress = `${project.getProgress()}%`;
  const taskLabel = language === "ja" ? "件のタスク" : "tasks";
  const deadline = project.deadline
    ? ` ${language === "ja" ? "締切" : "deadline"}:${project.deadline}`
    : "";
  const archived = project.archived
    ? ` ${language === "ja" ? "アーカイブ済み" : "archived"}`
    : "";

  return `#${index + 1} ${project.name} (${project.tasks.length} ${taskLabel}, ${progress}${deadline}${archived})`;
}

function formatTask(task, index, language = "en") {
  const status = task.status === "completed"
    ? language === "ja" ? "完了" : "done"
    : language === "ja" ? "未完了" : "todo";
  const priority = `${language === "ja" ? "優先度" : "priority"}:${task.priority}`;
  const deadline = task.deadline
    ? ` ${language === "ja" ? "締切" : "deadline"}:${task.deadline}`
    : "";
  const estimate = [task.optimistic, task.mostLikely, task.pessimistic]
    .every(value => value !== null && value !== undefined)
    ? ` ${language === "ja" ? "見積" : "estimate"}:${task.optimistic}/${task.mostLikely}/${task.pessimistic}`
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

function parseEstimate(flags, language) {
  if (!flags.estimate) return null;

  const values = String(flags.estimate)
    .split(/[,/]/)
    .map(value => Number(value));

  if (values.length !== 3 || values.some(value => !Number.isFinite(value) || value < 0)) {
    throw new Error(messages[language].estimateCountInvalid);
  }

  const [optimistic, mostLikely, pessimistic] = values;
  if (optimistic > mostLikely || mostLikely > pessimistic) {
    throw new Error(messages[language].estimateOrderInvalid);
  }

  return { optimistic, mostLikely, pessimistic };
}

function getManager(language) {
  const state = StorageService.loadState();

  if (state.status === "corrupted") {
    throw new Error(messages[language].corrupted);
  }

  return state.manager ?? new ProjectManager();
}

function help() {
  return [
    "ProbPlan CLI",
    "",
    "help                                      このヘルプを表示",
    "clear                                     画面をクリア",
    "exit                                      GUIに戻る",
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
    "各コマンドに --ja をつけると日本語で表示します（helpを除く）。",
    "",
    "例: project add \"応募準備\" --deadline 2026-08-31",
    "例: task add #1 \"UIを磨く\" --priority high --estimate 1,2,4",
  ].join("\n");
}

export function executeTerminalCommand(input) {
  const rawTokens = tokenize(input);
  const { language, commandTokens } = extractLanguage(rawTokens);
  const text = messages[language];
  const tokens = commandTokens;

  if (tokens.length === 0) {
    return { ok: true, output: "" };
  }

  const [rawCommand, rawSubcommand, ...rest] = tokens;
  const command = rawCommand.toLowerCase();
  const subcommand = rawSubcommand?.toLowerCase();

  try {
    if (command === "help") {
      return { ok: true, output: help() };
    }

    if (command === "clear") {
      return { ok: true, output: "", clear: true };
    }

    if (command === "exit") {
      return { ok: true, output: "", exit: true };
    }

    const manager = getManager(language);

    if (command === "projects") {
      const output = manager.projects.length === 0
        ? text.noProjects
        : manager.projects.map((project, index) => formatProject(project, index, language)).join("\n");
      return { ok: true, output };
    }

    if (command === "project" && subcommand === "add") {
      const { values, flags } = parseFlags(rest);
      const name = values.join(" ").trim();
      if (!name) throw new Error(text.projectNameRequired);
      if (flags.deadline && !isDateLike(flags.deadline)) {
        throw new Error(text.deadlineFormat);
      }

      const project = createProject(manager, name, flags.deadline ?? null);
      return { ok: true, output: `${text.created}: ${formatProject(project, manager.projects.length - 1, language)}` };
    }

    if (command === "project" && subcommand === "delete") {
      const project = getProject(manager, rest.join(" "));
      if (!project) throw new Error(text.projectNotFound);
      deleteProject(manager, project.id);
      return { ok: true, output: `${text.deleted}: ${project.name}` };
    }

    if (command === "project" && subcommand === "deadline") {
      const [projectReference, deadline] = rest;
      const project = getProject(manager, projectReference);
      if (!project) throw new Error(text.projectNotFound);
      if (!isDateLike(deadline)) throw new Error(text.deadlineFormat);
      updateProjectDeadline(manager, project, deadline);
      return { ok: true, output: `${text.deadlineUpdated}: ${project.name} -> ${deadline}` };
    }

    if (command === "tasks") {
      const projectReference = [subcommand, ...rest].filter(Boolean).join(" ");
      const project = getProject(manager, projectReference);
      if (!project) throw new Error(text.projectNotFound);
      const output = project.tasks.length === 0
        ? text.noTasks(project.name)
        : project.tasks.map((task, index) => formatTask(task, index, language)).join("\n");
      return { ok: true, output };
    }

    if (command === "task" && subcommand === "add") {
      const { values, flags } = parseFlags(rest);
      const [projectReference, ...nameParts] = values;
      const project = getProject(manager, projectReference);
      if (!project) throw new Error(text.projectNotFound);
      const name = nameParts.join(" ").trim();
      if (!name) throw new Error(text.taskNameRequired);
      if (flags.deadline && !isDateLike(flags.deadline)) {
        throw new Error(text.deadlineFormat);
      }
      if (flags.priority && !PRIORITIES.includes(flags.priority)) {
        throw new Error(text.priorityInvalid);
      }
      const estimate = parseEstimate(flags, language);

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

      return { ok: true, output: `${text.created}: ${formatTask(task, project.tasks.length - 1, language)}` };
    }

    if (command === "task" && ["done", "todo", "delete"].includes(subcommand)) {
      const [projectReference, taskReference] = rest;
      const project = getProject(manager, projectReference);
      if (!project) throw new Error(text.projectNotFound);
      const task = getTask(project, taskReference);
      if (!task) throw new Error(text.taskNotFound);

      if (subcommand === "delete") {
        deleteTask(manager, project, task.id);
        return { ok: true, output: `${text.deleted}: ${task.name}` };
      }

      setTaskCompleted(manager, task, subcommand === "done");
      return { ok: true, output: `${subcommand === "done" ? text.done : text.todo}: ${task.name}` };
    }

    return { ok: false, output: text.unknownCommand(input) };
  } catch (error) {
    return {
      ok: false,
      output: error instanceof Error ? error.message : String(error),
    };
  }
}
