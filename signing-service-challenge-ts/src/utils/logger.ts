import moment from "moment";

export type LogSource = InstanceType<any> | null;

export enum LogLevel {
  VERBOSE = 0,
  DEBUG = 1,
  INFO = 2,
  WARNING = 3,
  ERROR = 4,
  CRITICAL = 5,
}

export class Logger {
  private static readonly DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";

  logLevel: LogLevel | "NONE" = LogLevel.VERBOSE;

  setLogLevel(level: LogLevel | "NONE"): void {
    this.logLevel = level;
  }

  _log(level: LogLevel, source: LogSource, ...objects: unknown[]): void {
    if (this.logLevel === "NONE" || level < this.logLevel) return;
    const timestampStr = moment(new Date()).format(Logger.DATE_FORMAT);
    const prefix = source ? `[${source.constructor.name}]` : "";
    // eslint-disable-next-line no-console
    const logFunc = console.log;
    logFunc(`${timestampStr} ${level} ${prefix}`, ...objects);
  }

  verbose = this._log.bind(this, LogLevel.VERBOSE);
  debug = this._log.bind(this, LogLevel.DEBUG);
  info = this._log.bind(this, LogLevel.INFO);
  warn = this._log.bind(this, LogLevel.WARNING);
  error = this._log.bind(this, LogLevel.ERROR);
  fatal = this._log.bind(this, LogLevel.CRITICAL);
}

export const Log = new Logger();
