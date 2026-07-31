// タスク操作の入口。画面からの変更をモデルへ反映し、必ず保存する。
import { Task } from "../models/task.js";
import { StorageService } from "../services/storageService.js";

export function createTask(manager, project, taskName, deadline = null) {
  const task = Task.create({
    name: taskName,
    deadline,
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

export function setTaskCompleted(manager, task, isCompleted) {
  // 完了状態の変更は進捗計算にも使われるため、専用メソッドを通して更新する。
  task.setCompleted(isCompleted);
  StorageService.save(manager);

  return task;
}

export function deleteTask(manager, project, taskId) {
  project.removeTask(taskId);
  StorageService.save(manager);
}
