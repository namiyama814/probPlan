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

  static fromJSON(data) {
    return new ProjectManager(
      data.projects.map(project => Project.fromJSON(project))
    );
  }
}