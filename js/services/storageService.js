const STORAGE_KEY = "probplan";

export const StorageService = {

    save(project) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(project)
        );
    },

    load() {
        const json = localStorage.getItem(STORAGE_KEY);

        if (!json) return null;

        return JSON.parse(json);
    },

    clear() {
        localStorage.removeItem(STORAGE_KEY);
    }

};