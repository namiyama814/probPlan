export class Project {
    constructor({
        id,
        name,
        tasks = [],
    }) {
        this.id = id;
        this.name = name;
        this.tasks = tasks;
    }

    static create(name) {
        return new Project({
            id: crypto.randomUUID(),
            name,
            tasks: [],
        });
    }

    addTask(task) {
        this.tasks.push(task);
    }

    removeTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
    }

    getTask(taskId) {
        return this.tasks.find(task => task.id === taskId);
    }
}