import { Task } from "../models/task.js";
import { StorageService } from "../services/storageService.js";

export function createTask(manager, project, taskName) {
  const task = Task.create({
    name: taskName,
  });

  project.addTask(task);
  StorageService.save(manager);

  return task;
}

export function updateTask(manager, task, data) {
  task.update(data);
  StorageService.save(manager);

  return task;
}

export function deleteTask(manager, project, taskId) {
  project.removeTask(taskId);
  StorageService.save(manager);
}
