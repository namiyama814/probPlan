import { projectManager } from "../models/projectManager.js";

const STORAGE_KEY = "probplan";

export const StorageService = {
  save(manager) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(manager)
    );
  },

  load() {
    const json = localStorage.getItem(STORAGE_KEY);

    if (!json) return null;

    return projectManager.fromJSON(
      JSON.parse(json)
    );
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  }
};