type LogLevel = 'info' | 'warn' | 'error';

function log(level: LogLevel, msg: string, meta?: unknown): void {
  const entry: Record<string, unknown> = { level, msg, ts: new Date().toISOString() };
  if (meta && typeof meta === 'object') Object.assign(entry, meta);
  const replacer = (_: string, value: unknown) => {
    if (value instanceof Error) return { message: value.message, stack: value.stack };
    return value;
  };
  const out = JSON.stringify(entry, replacer);
  if (level === 'error') console.error(out);
  else if (level === 'warn') console.warn(out);
  else console.log(out);
}

export const logger = {
  info: (msg: string, meta?: unknown): void => log('info', msg, meta),
  warn: (msg: string, meta?: unknown): void => log('warn', msg, meta),
  error: (msg: string, meta?: unknown): void => log('error', msg, meta),
};
