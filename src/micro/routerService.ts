// Router Micro Service
// Route trie + checksum + param DFA validator + canonical URL normalizer

interface RouteNode {
  segment: string;
  isParam: boolean;
  isWildcard: boolean;
  children: Map<string, RouteNode>;
  handler?: string;
  checksum?: string;
}

interface DFAState {
  isFinal: boolean;
  transitions: Map<string, DFAState>;
  expectedType?: string;
}

interface RouteMatch {
  handler: string;
  params: Record<string, string>;
  checksum: string;
}

class RouterService {
  private root: RouteNode;
  private routeChecksums: Map<string, string>;
  private dfaValidators: Map<string, DFAState>;
  private redirectMap: Map<string, string>; // 301 redirects

  constructor() {
    this.root = this.createNode('');
    this.routeChecksums = new Map();
    this.dfaValidators = new Map();
    this.redirectMap = new Map();
  }

  /**
   * Create route node
   */
  private createNode(segment: string): RouteNode {
    return {
      segment,
      isParam: segment.startsWith(':'),
      isWildcard: segment === '*',
      children: new Map(),
    };
  }

  /**
   * Add route to trie
   */
  addRoute(path: string, handler: string): void {
    const canonicalPath = this.normalizeURL(path);
    const checksum = this.calculateChecksum(canonicalPath);
    
    this.insertIntoTrie(canonicalPath, handler, checksum);
    this.routeChecksums.set(canonicalPath, checksum);
    
    // Build DFA validator for params
    this.buildDFAValidator(canonicalPath);
  }

  /**
   * Insert route into trie
   */
  private insertIntoTrie(path: string, handler: string, checksum: string): void {
    const segments = path.split('/').filter(Boolean);
    let current = this.root;

    for (const segment of segments) {
      const nodeKey = segment.startsWith(':') ? ':' : segment;
      
      if (!current.children.has(nodeKey)) {
        current.children.set(nodeKey, this.createNode(segment));
      }
      
      current = current.children.get(nodeKey)!;
    }

    current.handler = handler;
    current.checksum = checksum;
  }

  /**
   * Match route
   */
  matchRoute(path: string): RouteMatch | null {
    const canonicalPath = this.normalizeURL(path);
    const segments = canonicalPath.split('/').filter(Boolean);
    let current = this.root;
    const params: Record<string, string> = {};

    for (const segment of segments) {
      // Try exact match first
      if (current.children.has(segment)) {
        current = current.children.get(segment)!;
        continue;
      }

      // Try param match
      if (current.children.has(':')) {
        const paramNode = current.children.get(':')!;
        params[paramNode.segment.substring(1)] = segment;
        current = paramNode;
        continue;
      }

      // Try wildcard
      if (current.children.has('*')) {
        current = current.children.get('*')!;
        continue;
      }

      // No match
      return null;
    }

    if (!current.handler) {
      return null;
    }

    // Validate params with DFA
    if (this.dfaValidators.has(canonicalPath)) {
      const dfa = this.dfaValidators.get(canonicalPath)!;
      if (!this.validateParamsWithDFA(params, dfa)) {
        return null;
      }
    }

    // Verify checksum
    const expectedChecksum = this.routeChecksums.get(canonicalPath);
    if (current.checksum !== expectedChecksum) {
      console.error(`[Router] Checksum mismatch for ${canonicalPath}`);
      return null;
    }

    return {
      handler: current.handler,
      params,
      checksum: current.checksum!,
    };
  }

  /**
   * Build DFA validator for route params
   */
  private buildDFAValidator(path: string): void {
    const segments = path.split('/').filter(Boolean);
    const initialState: DFAState = {
      isFinal: false,
      transitions: new Map(),
    };

    let currentState = initialState;

    for (const segment of segments) {
      if (segment.startsWith(':')) {
        const paramName = segment.substring(1);
        const expectedType = this.extractTypeFromParam(paramName);
        
        currentState = {
          isFinal: false,
          transitions: new Map(),
          expectedType,
        };
      }
    }

    currentState.isFinal = true;
    this.dfaValidators.set(path, initialState);
  }

  /**
   * Extract type from param (e.g., :id<int>)
   */
  private extractTypeFromParam(paramName: string): string | undefined {
    const match = paramName.match(/<(.+)>$/);
    return match ? match[1] : undefined;
  }

  /**
   * Validate params with DFA
   */
  private validateParamsWithDFA(params: Record<string, string>, dfa: DFAState): boolean {
    for (const [key, value] of Object.entries(params)) {
      if (dfa.expectedType) {
        if (!this.validateParamType(value, dfa.expectedType)) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Validate param type
   */
  private validateParamType(value: string, type: string): boolean {
    switch (type) {
      case 'int':
        return /^\d+$/.test(value);
      case 'uuid':
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
      case 'slug':
        return /^[a-z0-9-]+$/.test(value);
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      default:
        return true;
    }
  }

  /**
   * Normalize URL
   */
  normalizeURL(url: string): string {
    // Decode URL
    let normalized = decodeURIComponent(url);
    
    // Remove trailing slash
    normalized = normalized.replace(/\/$/, '');
    
    // Ensure leading slash
    if (!normalized.startsWith('/')) {
      normalized = '/' + normalized;
    }
    
    // Lowercase (except for params)
    normalized = normalized.replace(/([^:]*):/g, (match) => match.toLowerCase());
    
    // Remove multiple slashes
    normalized = normalized.replace(/\/+/g, '/');
    
    // Sort query parameters
    const [path, query] = normalized.split('?');
    if (query) {
      const params = new URLSearchParams(query);
      const sortedParams = Array.from(params.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
      normalized = `${path}?${sortedParams}`;
    }
    
    return normalized;
  }

  /**
   * Calculate checksum for route
   */
  private calculateChecksum(path: string): string {
    let hash = 0;
    for (let i = 0; i < path.length; i++) {
      const char = path.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Verify route checksum
   */
  verifyChecksum(path: string): boolean {
    const canonicalPath = this.normalizeURL(path);
    const expected = this.routeChecksums.get(canonicalPath);
    const actual = this.calculateChecksum(canonicalPath);
    return expected === actual;
  }

  /**
   * Add redirect (301)
   */
  addRedirect(from: string, to: string): void {
    const canonicalFrom = this.normalizeURL(from);
    const canonicalTo = this.normalizeURL(to);
    this.redirectMap.set(canonicalFrom, canonicalTo);
  }

  /**
   * Get redirect
   */
  getRedirect(path: string): string | null {
    const canonicalPath = this.normalizeURL(path);
    return this.redirectMap.get(canonicalPath) || null;
  }

  /**
   * Rebuild trie (after route changes)
   */
  rebuildTrie(routes: Array<{ path: string; handler: string }>): void {
    this.root = this.createNode('');
    this.routeChecksums.clear();
    this.dfaValidators.clear();

    for (const route of routes) {
      this.addRoute(route.path, route.handler);
    }
  }

  /**
   * Get all routes
   */
  getAllRoutes(): Array<{ path: string; handler: string; checksum: string }> {
    const routes: Array<{ path: string; handler: string; checksum: string }> = [];
    
    const traverse = (node: RouteNode, path: string) => {
      if (node.handler) {
        routes.push({
          path,
          handler: node.handler,
          checksum: node.checksum || '',
        });
      }
      
      for (const [key, child] of node.children.entries()) {
        const newPath = key === ':' || key === '*' 
          ? `${path}/${node.segment}`
          : `${path}/${key}`;
        traverse(child, newPath);
      }
    };
    
    traverse(this.root, '');
    
    return routes;
  }

  /**
   * Validate all route checksums
   */
  validateAllChecksums(): boolean {
    const routes = this.getAllRoutes();
    for (const route of routes) {
      if (!this.verifyChecksum(route.path)) {
        console.error(`[Router] Checksum validation failed for ${route.path}`);
        return false;
      }
    }
    return true;
  }

  /**
   * Get route stats
   */
  getStats(): {
    totalRoutes: number;
    totalRedirects: number;
    totalDfaValidators: number;
  } {
    return {
      totalRoutes: this.routeChecksums.size,
      totalRedirects: this.redirectMap.size,
      totalDfaValidators: this.dfaValidators.size,
    };
  }
}

// Singleton instance
const routerService = new RouterService();

export default routerService;
export { RouterService };
export type { RouteNode, DFAState, RouteMatch };
