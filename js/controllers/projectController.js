import { project } from "../models/project.js";
import { StorageService } from "../services/storageService.js";

export function createProject(manager, projectName) {
  const project = project.create(projectName);
  manager.addProject(project);
  StorageService.save(manager);

  return project;
}