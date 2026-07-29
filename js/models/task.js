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
  }

  static create(data) {
    return new Task({
      id: crypto.randomUUID(),
      ...data,
    });
  }

  static fromJSON(data) {
    return new Task(data);
  }

  update(data) {
    this.name = data.name;
    this.optimistic = data.optimistic;
    this.mostLikely = data.mostLikely;
    this.pessimistic = data.pessimistic;
  }

  setCompleted(isCompleted) {
    this.status = isCompleted ? "completed" : "todo";
  }

  getProgress() {
    return this.status === "completed" ? 100 : 0;
  }
}
