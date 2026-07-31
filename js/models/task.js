// タスク本体。3点見積もり、完了状態、作成日時を保持する。
export class Task {
  constructor({
    id,
    name,
    optimistic = null,
    mostLikely = null,
    pessimistic = null,
    deadline = null,
    status = "todo",
    createdAt = null,
  }) {
    this.id = id;
    this.name = name;

    this.optimistic = optimistic;
    this.mostLikely = mostLikely;
    this.pessimistic = pessimistic;
    this.deadline = deadline;

    this.status = status;
    this.createdAt = createdAt;
  }

  static create(data) {
    // 新規タスクだけに一意なIDと作成日時を自動付与する。
    return new Task({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
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
    this.deadline = data.deadline ?? null;
  }

  setCompleted(isCompleted) {
    this.status = isCompleted ? "completed" : "todo";
  }

  getProgress() {
    return this.status === "completed" ? 100 : 0;
  }
}
