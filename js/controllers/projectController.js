import { Project } from "../models/project.js";
import { StorageService } from "../services/storageService.js";

export function createProject(manager, projectName) {
  const project = Project.create(projectName);

  manager.addProject(project);
  StorageService.save(manager);

  return project;
}

export function deleteProject(manager, projectId) {
  manager.removeProject(projectId);
  StorageService.save(manager);
}
