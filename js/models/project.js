// プロジェクト本体。タスクの集合と、プロジェクト単位の進捗を管理する。
import { Task } from "./task.js";

export class Project {
  constructor({
    id,
    name,
    deadline = null,
    archived = false,
    tasks = []
  }) {
    this.id = id;
    this.name = name;
    this.deadline = deadline;
    this.archived = archived;
    this.tasks = tasks;
  }
  
  static create(name, deadline = null) {
    return new Project({
      id: crypto.randomUUID(),
      name,
      deadline,
      tasks: []
    });
  }
  
  static fromJSON(data) {
    return new Project({
      id: data.id,
      name: data.name,
      deadline: data.deadline ?? null,
      archived: data.archived ?? false,
      tasks: data.tasks.map(task => Task.fromJSON(task))
    });
  }

  setDeadline(deadline) {
    this.deadline = deadline;
  }

  setName(name) {
    this.name = name;
  }

  setArchived(isArchived) {
    this.archived = isArchived;
  }

  addTask(task) {
    this.tasks.push(task);
  }

  removeTask(taskId) {
    this.tasks = this.tasks.filter(task => task.id !== taskId);
  }

  getTask(taskId) {
    return this.tasks.find(task => task.id === taskId);
  }

  getProgress() {
    // 各タスクの完了率を平均し、プロジェクト全体の進捗として表示する。
    if (this.tasks.length === 0) return 0;

    const totalProgress = this.tasks.reduce(
      (total, task) => total + task.getProgress(),
      0
    );

    return Math.round(totalProgress / this.tasks.length);
  }
}
