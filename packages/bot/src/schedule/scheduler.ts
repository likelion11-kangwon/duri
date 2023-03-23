import { randomUUID } from 'crypto';
import { schedule, ScheduledTask } from 'node-cron';
export class Scheduler {
  private scheduled: Record<string, ScheduledTask> = {};

  schedule(expression: string, callback: () => void): string {
    const id = randomUUID();
    const task = schedule(expression, callback);
    this.scheduled[id] = task;
    return id;
  }

  stop(id: string): void {
    if (this.scheduled[id] === undefined) {
      throw new Error(`No schedule with id: ${id}`);
    }

    this.scheduled[id].stop();
    delete this.scheduled[id];
  }
}
