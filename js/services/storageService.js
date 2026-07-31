// localStorageへの保存・復元を担当する薄いアダプター。
import { ProjectManager } from "../models/projectManager.js";

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

    try {
      // 壊れた保存データがあっても、アプリ全体の起動失敗にはしない。
      return ProjectManager.fromJSON(JSON.parse(json));
    } catch {
      return null;
    }
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  }
};
