import { Task } from "./task.js";

export class Project {
  constructor({
    id,
    name,
    tasks = []
  }) {
    this.id = id;
    this.name = name;
    this.tasks = tasks;
  }
  
  static create(name) {
    return new Project({
      id: crypto.randomUUID(),
      name,
      tasks: []
    });
  }
  
  static fromJSON(data) {
    return new Project({
      id: data.id,
      name: data.name,
      tasks: data.tasks.map(task => Task.fromJSON(task))
    });
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
    if (this.tasks.length === 0) return 0;

    const totalProgress = this.tasks.reduce(
      (total, task) => total + task.getProgress(),
      0
    );

    return Math.round(totalProgress / this.tasks.length);
  }
}
