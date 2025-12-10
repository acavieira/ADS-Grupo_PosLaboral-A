import type { InjectionKey } from 'vue'
import { ConsoleLogger } from '@git-dash/core'
import type { ILoggerBase } from '../../packages/core/src/utils/logger/types/logger-base.ts'

export const appLogger = new ConsoleLogger();
export const LoggerKey: InjectionKey<ILoggerBase> = Symbol('Logger');
