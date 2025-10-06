import { Platform } from 'react-native';
import { db } from '@/config/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

type LogLevel = 'info' | 'warn' | 'error' | 'critical';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  timestamp: Date;
  platform: string;
  appVersion?: string;
}

interface ErrorReport {
  error: Error;
  context?: Record<string, any>;
  userId?: string;
  fatal?: boolean;
}

class MonitoringService {
  private enabled: boolean = true;
  private logBuffer: LogEntry[] = [];
  private flushInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startFlushInterval();
  }

  private startFlushInterval() {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000);
  }

  async log(level: LogLevel, message: string, context?: Record<string, any>, userId?: string): Promise<void> {
    const entry: LogEntry = {
      level,
      message,
      context,
      userId,
      timestamp: new Date(),
      platform: Platform.OS,
    };

    this.logBuffer.push(entry);

    if (level === 'error' || level === 'critical') {
      await this.flush();
    }

    if (__DEV__) {
      const logFn = level === 'error' || level === 'critical' ? console.error : console.log;
      logFn(`[${level.toUpperCase()}] ${message}`, context || '');
    }
  }

  async flush(): Promise<void> {
    if (!this.enabled || this.logBuffer.length === 0) return;

    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];

    try {
      const batch = logsToFlush.map(entry => ({
        level: entry.level,
        message: entry.message,
        context: entry.context || {},
        userId: entry.userId || null,
        timestamp: Timestamp.fromDate(entry.timestamp),
        platform: entry.platform,
      }));

      for (const log of batch) {
        await addDoc(collection(db, 'logs'), log);
      }

      console.log(`[Monitoring] Flushed ${batch.length} logs`);
    } catch (error) {
      console.error('[Monitoring] Failed to flush logs:', error);
      this.logBuffer.unshift(...logsToFlush);
    }
  }

  async reportError(report: ErrorReport): Promise<void> {
    const { error, context, userId, fatal = false } = report;

    const errorData = {
      name: error.name,
      message: error.message,
      stack: error.stack || '',
      context: context || {},
      userId: userId || null,
      fatal,
      timestamp: Timestamp.now(),
      platform: Platform.OS,
    };

    try {
      await addDoc(collection(db, 'errors'), errorData);
      console.log('[Monitoring] Error reported:', error.message);
    } catch (err) {
      console.error('[Monitoring] Failed to report error:', err);
    }

    await this.log(fatal ? 'critical' : 'error', error.message, {
      ...context,
      stack: error.stack,
    }, userId);
  }

  async trackEvent(eventName: string, properties?: Record<string, any>, userId?: string): Promise<void> {
    try {
      await addDoc(collection(db, 'analytics'), {
        eventName,
        properties: properties || {},
        userId: userId || null,
        timestamp: Timestamp.now(),
        platform: Platform.OS,
      });

      console.log('[Monitoring] Event tracked:', eventName);
    } catch (error) {
      console.error('[Monitoring] Failed to track event:', error);
    }
  }

  async trackPerformance(metric: string, value: number, context?: Record<string, any>): Promise<void> {
    try {
      await addDoc(collection(db, 'performance'), {
        metric,
        value,
        context: context || {},
        timestamp: Timestamp.now(),
        platform: Platform.OS,
      });

      console.log(`[Monitoring] Performance tracked: ${metric} = ${value}`);
    } catch (error) {
      console.error('[Monitoring] Failed to track performance:', error);
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    console.log(`[Monitoring] Monitoring ${enabled ? 'enabled' : 'disabled'}`);
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flush();
  }
}

export const monitoringService = new MonitoringService();
