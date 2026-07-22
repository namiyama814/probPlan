export class Task {
    constructor({
        id,
        name,
        optimistic,
        mostLikely,
        pessimistic,
    }) {
        this.id = id;
        this.name = name;

        this.optimistic = optimistic;
        this.mostLikely = mostLikely;
        this.pessimistic = pessimistic;
    }

    static create(data) {
        return new Task({
            id: crypto.randomUUID(),
            ...data,
        });
    }
}