// localStorageへの保存・復元を担当する薄いアダプター。
import { ProjectManager } from "../models/projectManager.js";

const STORAGE_KEY = "probplan";

function parseManager(json) {
  return ProjectManager.fromJSON(JSON.parse(json));
}

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
      return parseManager(json);
    } catch {
      return null;
    }
  },

  loadState() {
    const json = localStorage.getItem(STORAGE_KEY);

    if (!json) {
      return {
        status: "empty",
        manager: null,
      };
    }

    try {
      // ホーム画面では「データなし」と「破損」を区別し、破損時だけ復旧UIを出す。
      return {
        status: "ok",
        manager: parseManager(json),
      };
    } catch {
      return {
        status: "corrupted",
        manager: null,
      };
    }
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  }
};
