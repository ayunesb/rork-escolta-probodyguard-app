/**
 * Production-Safe Logger Utility
 * 
 * Replaces console.log/warn/error throughout the codebase with intelligent logging
 * that only outputs in development and routes to monitoring services in production.
 * 
 * Official Documentation:
 * - https://docs.expo.dev/guides/environment-variables/
 * - https://reactnative.dev/docs/debugging
 * 
 * Usage:
 * ```typescript
 * import { logger } from '@/utils/logger';
 * 
 * // Development: logs to console
 * // Production: sends to monitoring service
 * logger.log('[MyComponent] Action performed', { userId: '123' });
 * logger.error('[MyService] Operation failed', error);
 * logger.warn('[MyHook] Deprecated API used');
 * ```
 */

import { monitoringService } from '@/services/monitoringService';

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface LogOptions {
  context?: Record<string, any>;
  userId?: string;
  sendToMonitoring?: boolean;
}

class Logger {
  private isDevelopment = __DEV__;

  /**
   * General purpose logging
   * Development: console.log
   * Production: silent (unless sendToMonitoring: true)
   */
  log(message: string, data?: any, options?: LogOptions): void {
    if (this.isDevelopment) {
      console.log(message, data || '');
    } else if (options?.sendToMonitoring) {
      this.sendToMonitoring('info', message, data, options);
    }
  }

  /**
   * Informational messages
   * Development: console.log
   * Production: monitoring service
   */
  info(message: string, data?: any, options?: LogOptions): void {
    if (this.isDevelopment) {
      console.log(`ℹ️ ${message}`, data || '');
    }
    
    // Always send info to monitoring (for analytics)
    this.sendToMonitoring('info', message, data, options);
  }

  /**
   * Warning messages
   * Development: console.warn
   * Production: monitoring service
   */
  warn(message: string, data?: any, options?: LogOptions): void {
    if (this.isDevelopment) {
      console.warn(`⚠️ ${message}`, data || '');
    }
    
    // Always send warnings to monitoring
    this.sendToMonitoring('warn', message, data, options);
  }

  /**
   * Error messages
   * Development: console.error
   * Production: monitoring service + Sentry
   */
  error(message: string, error?: any, options?: LogOptions): void {
    if (this.isDevelopment) {
      console.error(`❌ ${message}`, error || '');
    }
    
    // Always send errors to monitoring
    this.sendToMonitoring('error', message, error, options);
  }

  /**
   * Debug messages (development only)
   * Production: completely silent
   */
  debug(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(`🐛 [DEBUG] ${message}`, data || '');
    }
  }

  /**
   * Performance timing
   * Development: console.log
   * Production: monitoring service
   */
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }

  /**
   * Send logs to monitoring service
   */
  private async sendToMonitoring(
    level: LogLevel,
    message: string,
    data?: any,
    options?: LogOptions
  ): Promise<void> {
    try {
      const context = {
        ...options?.context,
        ...(data && typeof data === 'object' ? data : { data }),
      };

      // Map log levels to monitoring service levels
      const monitoringLevel = 
        level === 'error' ? 'error' :
        level === 'warn' ? 'warn' :
        'info';

      await monitoringService.log(
        monitoringLevel,
        message,
        context,
        options?.userId
      );
    } catch (err) {
      // Silent fail - don't let logging break the app
      if (this.isDevelopment) {
        console.error('[Logger] Failed to send to monitoring:', err);
      }
    }
  }

  /**
   * Group related logs (development only)
   */
  group(label: string): void {
    if (this.isDevelopment && console.group) {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.isDevelopment && console.groupEnd) {
      console.groupEnd();
    }
  }

  /**
   * Table output for arrays/objects (development only)
   */
  table(data: any): void {
    if (this.isDevelopment && console.table) {
      console.table(data);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports for direct replacement
export const log = logger.log.bind(logger);
export const info = logger.info.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);
export const debug = logger.debug.bind(logger);

export default logger;
