export class Task {
    constructor({
        id,
        name,
        optimistic = null,
        mostLikely = null,
        pessimistic = null,
        status = "todo",
    }) {
        this.id = id;
        this.name = name;

        this.optimistic = optimistic;
        this.mostLikely = mostLikely;
        this.pessimistic = pessimistic;

        this.status = status;
    } static create(data) {
        return new Task({
            id: crypto.randomUUID(),
            ...data,
        });
    }
    static fromJSON(data) {
        return new Task(data);
    }
}