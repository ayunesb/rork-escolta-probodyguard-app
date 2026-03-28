import { useCallback, useRef, useEffect } from 'react';
import React from "react";

export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps);
};

export const useDebounceCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};

export const useThrottleCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastRun.current = Date.now();
        }, delay - (now - lastRun.current));
      }
    },
    [callback, delay]
  );
};

export const batchUpdates = <T>(
  updates: T[],
  batchSize: number,
  processFn: (batch: T[]) => Promise<void>
): Promise<void[]> => {
  const batches: T[][] = [];
  
  for (let i = 0; i < updates.length; i += batchSize) {
    batches.push(updates.slice(i, i + batchSize));
  }

  return Promise.all(batches.map(batch => processFn(batch)));
};

export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);

    return result;
  }) as T;
};

export const asyncMemoize = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string,
  ttl?: number
): T => {
  const cache = new Map<string, { value: Awaited<ReturnType<T>>; timestamp: number }>();

  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    const now = Date.now();

    const cached = cache.get(key);
    if (cached && (!ttl || now - cached.timestamp < ttl)) {
      return cached.value;
    }

    const result = await fn(...args);
    cache.set(key, { value: result, timestamp: now });

    return result;
  }) as T;
};
