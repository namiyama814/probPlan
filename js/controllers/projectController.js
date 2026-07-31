// プロジェクト操作の入口。モデル変更とlocalStorage保存を一つの処理にまとめる。
import { Project } from "../models/project.js";
import { StorageService } from "../services/storageService.js";

export function createProject(manager, projectName, deadline) {
  // UIから受け取った値でモデルを作成し、追加後すぐに永続化する。
  const project = Project.create(projectName, deadline);

  manager.addProject(project);
  StorageService.save(manager);

  return project;
}

export function deleteProject(manager, projectId) {
  manager.removeProject(projectId);
  StorageService.save(manager);
}

export function updateProjectDeadline(manager, project, deadline) {
  project.setDeadline(deadline);
  StorageService.save(manager);
}

export function updateProjectName(manager, project, projectName) {
  project.setName(projectName);
  StorageService.save(manager);
}
