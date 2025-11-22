import type { ILoggerBase } from "./types/logger-base"; // Use your existing import path

function mergeFields(base: Record<string, unknown>, additional: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!additional) return base;
  if (!base) return additional;
  return { ...base, ...additional };
}

export class ConsoleLogger implements ILoggerBase {
  private readonly defaultFields: Record<string, unknown>;

  constructor(defaultFields: Record<string, unknown> = {}) {
    this.defaultFields = defaultFields;
  }

  private format(level: string, msg: string, fields: Record<string, unknown> | undefined): unknown[] {
    const mergedFields = mergeFields(this.defaultFields, fields);

    const output: unknown[] = [`[${level.toUpperCase()}] ${msg}`];
    if (mergedFields && Object.keys(mergedFields).length > 0) {
      output.push(mergedFields);
    }
    return output;
  }

  debug(msg: string, fields?: Record<string, unknown>): void {
    console.log(...this.format("DEBUG", msg, fields));
  }

  info(msg: string, fields?: Record<string, unknown>): void {
    console.info(...this.format("INFO", msg, fields));
  }

  warn(msg: string, fields?: Record<string, unknown>): void {
    console.warn(...this.format("WARN", msg, fields));
  }

  error(msg: string, fields?: Record<string, unknown>): void {
    console.error(...this.format("ERROR", msg, fields));
  }

}
