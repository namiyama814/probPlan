import { Project } from "../models/project.js";
import { StorageService } from "../services/storageService.js";

export function createProject(manager, projectName, deadline) {
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
