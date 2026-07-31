// 複数プロジェクトを横断して検索・一覧取得するコレクションモデル。
import { Project } from "./project.js";

export class ProjectManager {
  constructor(projects = []) {
    this.projects = projects;
  }
  
  addProject(project) {
    this.projects.push(project);
  }

  removeProject(projectId) {
    this.projects = this.projects.filter(
      project => project.id !== projectId
    );
  }

  getProject(projectId) {
    return this.projects.find(
      project => project.id === projectId
    );
  }

  getProjects() {
    return this.projects;
  }

  searchTasks(query) {
    // Unicode正規化と小文字化で、表記ゆれを吸収した検索を行う。
    const normalizedQuery = String(query ?? "")
      .normalize("NFKC")
      .toLocaleLowerCase()
      .trim();

    if (!normalizedQuery) return [];

    return this.projects.flatMap(project =>
      project.tasks
        .filter(task =>
          task.name
            .normalize("NFKC")
            .toLocaleLowerCase()
            .includes(normalizedQuery)
        )
        .map(task => ({ task, project }))
    );
  }

  getRecentTasks(limit = 3, { includeCompleted = true } = {}) {
    // 日付が壊れた古いデータも表示できるよう、元の配列順をフォールバックにする。
    let fallbackOrder = 0;

    const tasks = this.projects.flatMap(project =>
      project.tasks
        .filter(task =>
          includeCompleted || task.status !== "completed"
        )
        .map(task => {
          const timestamp = Date.parse(task.createdAt);

          return {
            task,
            project,
            timestamp: Number.isNaN(timestamp) ? null : timestamp,
            fallbackOrder: fallbackOrder++,
          };
        })
    );

    return tasks
      .sort((a, b) => {
        if (a.timestamp !== null && b.timestamp !== null) {
          return b.timestamp - a.timestamp ||
            b.fallbackOrder - a.fallbackOrder;
        }

        if (a.timestamp !== null) return -1;
        if (b.timestamp !== null) return 1;

        return b.fallbackOrder - a.fallbackOrder;
      })
      .slice(0, limit)
      .map(({ task, project }) => ({ task, project }));
  }

  static fromJSON(data) {
    return new ProjectManager(
      data.projects.map(project => Project.fromJSON(project))
    );
  }
}
