import { Injectable } from '@angular/core';
import {NGXLogger, NgxLoggerLevel} from 'ngx-logger';

export interface ILogger {
  trace(message: string, ...additional: any[]): void;
  debug(message: string, ...additional: any[]): void;
  info(message: string, ...additional: any[]): void;
  log(message: string, ...additional: any[]): void;
  warn(message: string, ...additional: any[]): void;
  error(message: string, ...additional: any[]): void;
  fatal(message: string, ...additional: any[]): void;
}

class NGXLoggerDecorator implements ILogger {

  constructor(private msgPrefix, private logger: NGXLogger) {
  }

  private wrapMessage(message: string): string {
    if (this.msgPrefix) {
      return `${this.msgPrefix}. ${message}`;
    }

    return message;
  }

  trace(message: string, ...additional: any[]): void {
    this.logger.trace(this.wrapMessage(message), ...additional);
  }
  debug(message: string, ...additional: any[]): void {
    this.logger.debug(this.wrapMessage(message), ...additional);
  }
  info(message: string, ...additional: any[]): void {
    this.logger.info(this.wrapMessage(message), ...additional);
  }
  log(message: string, ...additional: any[]): void {
    this.logger.log(this.wrapMessage(message), ...additional);
  }
  warn(message: string, ...additional: any[]): void {
    this.logger.warn(this.wrapMessage(message), ...additional);
  }
  error(message: string, ...additional: any[]): void {
    this.logger.error(this.wrapMessage(message), ...additional);
  }
  fatal(message: string, ...additional: any[]): void {
    this.logger.fatal(this.wrapMessage(message), ...additional);
  }
}

@Injectable()
export class LoggerFactory {

  constructor(private logger: NGXLogger) {
    const config = logger.getConfigSnapshot();
    config.level = this.getLoggerLevel();
    logger.updateConfig(config);
  }

  private getLoggerLevel(): NgxLoggerLevel {
    try {
      return window.localStorage.getItem('audithon-2021-logger-level')
        ? NgxLoggerLevel[window.localStorage.getItem('audithon-2021-logger-level')] : NgxLoggerLevel.ERROR;
    } catch (e) {
      return NgxLoggerLevel.ERROR;
    }
  }

  getLogger(msgPrefix: string): ILogger {
    return new NGXLoggerDecorator(msgPrefix, this.logger);
  }
}
