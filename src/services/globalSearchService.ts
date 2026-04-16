// Global Search Service
// Fuzzy search + typo tolerance + recent/trending search cache

export interface SearchIndex {
  id: string;
  entityId: string;
  type: 'product' | 'doc' | 'page' | 'user' | 'order';
  keywords: string[];
  weight: number;
  title: string;
  description: string;
  url: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  url: string;
  score: number;
  metadata?: any;
}

export interface SearchQuery {
  query: string;
  type?: string;
  limit?: number;
  offset?: number;
}

// In-memory search index
const searchIndex: Map<string, SearchIndex> = new Map();
const recentSearches: Set<string> = new Set();
const trendingSearches: Map<string, number> = new Map();

/**
 * Add entity to search index
 */
export function addToSearchIndex(index: Omit<SearchIndex, 'id' | 'createdAt' | 'updatedAt'>): SearchIndex {
  const searchIndexItem: SearchIndex = {
    ...index,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  searchIndex.set(searchIndexItem.id, searchIndexItem);

  // Update trending
  index.keywords.forEach(keyword => {
    const count = trendingSearches.get(keyword) || 0;
    trendingSearches.set(keyword, count + 1);
  });

  return searchIndexItem;
}

/**
 * Fuzzy search with typo tolerance
 */
export function search(query: SearchQuery): SearchResult[] {
  const searchQuery = query.query.toLowerCase().trim();
  const limit = query.limit || 20;
  const offset = query.offset || 0;

  if (!searchQuery) {
    return [];
  }

  // Add to recent searches
  recentSearches.add(searchQuery);

  const results: SearchResult[] = [];

  for (const [id, index] of searchIndex.entries()) {
    if (query.type && index.type !== query.type) continue;

    const score = calculateScore(searchQuery, index);
    
    if (score > 0) {
      results.push({
        id,
        type: index.type,
        title: index.title,
        description: index.description,
        url: index.url,
        score,
        metadata: index.metadata,
      });
    }
  }

  // Sort by score (descending)
  results.sort((a, b) => b.score - a.score);

  // Apply pagination
  return results.slice(offset, offset + limit);
}

/**
 * Calculate search score with fuzzy matching
 */
function calculateScore(query: string, index: SearchIndex): number {
  let score = 0;

  // Exact match in title
  if (index.title.toLowerCase().includes(query)) {
    score += 10;
  }

  // Exact match in description
  if (index.description.toLowerCase().includes(query)) {
    score += 5;
  }

  // Keyword matching
  for (const keyword of index.keywords) {
    if (keyword.toLowerCase().includes(query)) {
      score += 3;
    }

    // Fuzzy match (Levenshtein distance)
    if (fuzzyMatch(query, keyword)) {
      score += 2;
    }
  }

  // Weight boost
  score += index.weight * 0.1;

  return score;
}

/**
 * Fuzzy match (simple typo tolerance)
 */
function fuzzyMatch(query: string, keyword: string): boolean {
  const queryLower = query.toLowerCase();
  const keywordLower = keyword.toLowerCase();

  // If query is part of keyword
  if (keywordLower.includes(queryLower)) {
    return true;
  }

  // If keyword is part of query
  if (queryLower.includes(keywordLower)) {
    return true;
  }

  // Simple typo tolerance (1 character difference)
  if (Math.abs(queryLower.length - keywordLower.length) <= 1) {
    const commonChars = queryLower.split('').filter(c => keywordLower.includes(c)).length;
    if (commonChars >= Math.min(queryLower.length, keywordLower.length) - 1) {
      return true;
    }
  }

  return false;
}

/**
 * Get recent searches
 */
export function getRecentSearches(limit: number = 10): string[] {
  return Array.from(recentSearches).slice(0, limit);
}

/**
 * Get trending searches
 */
export function getTrendingSearches(limit: number = 10): Array<{ query: string; count: number }> {
  return Array.from(trendingSearches.entries())
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Clear search history
 */
export function clearSearchHistory(): void {
  recentSearches.clear();
}

/**
 * Remove entity from search index
 */
export function removeFromSearchIndex(entityId: string): void {
  for (const [id, index] of searchIndex.entries()) {
    if (index.entityId === entityId) {
      searchIndex.delete(id);
      break;
    }
  }
}

/**
 * Update search index
 */
export function updateSearchIndex(entityId: string, updates: Partial<SearchIndex>): void {
  for (const [id, index] of searchIndex.entries()) {
    if (index.entityId === entityId) {
      const updated = { ...index, ...updates, updatedAt: new Date() };
      searchIndex.set(id, updated);
      break;
    }
  }
}

/**
 * Rebuild search index (for bulk operations)
 */
export function rebuildSearchIndex(items: Omit<SearchIndex, 'id' | 'createdAt' | 'updatedAt'>[]): void {
  searchIndex.clear();
  items.forEach(item => addToSearchIndex(item));
}
