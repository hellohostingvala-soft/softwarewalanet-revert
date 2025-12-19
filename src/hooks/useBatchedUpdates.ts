import { useState, useCallback, useRef, useEffect } from 'react';

interface BatchConfig {
  maxSize?: number;
  maxWait?: number;
  onFlush?: (items: unknown[]) => Promise<void>;
}

export function useBatchedUpdates<T>({
  maxSize = 100,
  maxWait = 50,
  onFlush
}: BatchConfig = {}) {
  const [queue, setQueue] = useState<T[]>([]);
  const [processing, setProcessing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queueRef = useRef<T[]>([]);

  const flush = useCallback(async () => {
    if (queueRef.current.length === 0) return;
    
    setProcessing(true);
    const items = [...queueRef.current];
    queueRef.current = [];
    setQueue([]);

    try {
      await onFlush?.(items);
    } finally {
      setProcessing(false);
    }
  }, [onFlush]);

  const add = useCallback((item: T) => {
    queueRef.current.push(item);
    setQueue([...queueRef.current]);

    if (queueRef.current.length >= maxSize) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      flush();
    } else if (!timerRef.current) {
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        flush();
      }, maxWait);
    }
  }, [maxSize, maxWait, flush]);

  const addBatch = useCallback((items: T[]) => {
    items.forEach(item => add(item));
  }, [add]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    add,
    addBatch,
    flush,
    queue,
    processing,
    queueLength: queue.length
  };
}

// Debounced state for high-frequency updates
export function useDebouncedState<T>(initialValue: T, delay = 100) {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(newValue);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setDebouncedValue(typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(value) 
        : newValue
      );
    }, delay);
  }, [delay, value]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return [value, debouncedValue, updateValue] as const;
}

// Throttled callback for rate-limiting
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
) {
  const lastCall = useRef(0);
  const lastArgs = useRef<Parameters<T> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall.current;

    if (timeSinceLastCall >= delay) {
      lastCall.current = now;
      callback(...args);
    } else {
      lastArgs.current = args;
      
      if (!timerRef.current) {
        timerRef.current = setTimeout(() => {
          lastCall.current = Date.now();
          if (lastArgs.current) {
            callback(...lastArgs.current);
          }
          timerRef.current = null;
        }, delay - timeSinceLastCall);
      }
    }
  }, [callback, delay]);
}
