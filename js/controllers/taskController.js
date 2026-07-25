import { Task } from "../models/Task.js";
import { StorageService } from "../services/storageService.js";

export function createTask(manager, project, taskName) {
  const task = Task.create({
    name: taskName,
  });

  project.addTask(task);
  StorageService.save(manager);
  return task;
}