import { useState, useCallback, useRef, useEffect } from 'react';

interface VirtualizedListOptions<T> {
  items: T[];
  itemHeight: number;
  overscan?: number;
  getItemKey?: (item: T, index: number) => string | number;
}

interface VirtualizedListResult<T> {
  virtualItems: Array<{ item: T; index: number; style: React.CSSProperties }>;
  totalHeight: number;
  containerProps: {
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
    style: React.CSSProperties;
  };
  innerProps: {
    style: React.CSSProperties;
  };
}

export function useVirtualizedList<T>({
  items,
  itemHeight,
  overscan = 5,
  getItemKey = (_, index) => index
}: VirtualizedListOptions<T>): VirtualizedListResult<T> {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const totalHeight = items.length * itemHeight;

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const virtualItems = [];
  for (let i = startIndex; i < endIndex; i++) {
    virtualItems.push({
      item: items[i],
      index: i,
      style: {
        position: 'absolute' as const,
        top: i * itemHeight,
        left: 0,
        right: 0,
        height: itemHeight,
      }
    });
  }

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return {
    virtualItems,
    totalHeight,
    containerProps: {
      onScroll: handleScroll,
      style: {
        overflow: 'auto',
        position: 'relative' as const,
      }
    },
    innerProps: {
      style: {
        height: totalHeight,
        position: 'relative' as const,
      }
    }
  };
}

// Ultra-fast infinite scroll hook
export function useInfiniteScroll(
  loadMore: () => Promise<void>,
  options: { threshold?: number; hasMore?: boolean } = {}
) {
  const { threshold = 200, hasMore = true } = options;
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleIntersection = useCallback(
    async (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        setLoading(true);
        try {
          await loadMore();
        } finally {
          setLoading(false);
        }
      }
    },
    [loadMore, hasMore, loading]
  );

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin: `${threshold}px`,
    });

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [handleIntersection, threshold]);

  return { sentinelRef, loading };
}
