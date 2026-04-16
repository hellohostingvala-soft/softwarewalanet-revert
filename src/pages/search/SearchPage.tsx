// Global Search Page
// /search route with fuzzy search

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  FileText,
  Package,
  User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { search, getRecentSearches, getTrendingSearches, clearSearchHistory } from '@/services/globalSearchService';
import '../../../styles/premium-7d-theme.css';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<Array<{ query: string; count: number }>>([]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
    setTrendingSearches(getTrendingSearches());
  }, []);

  useEffect(() => {
    if (query.trim()) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const searchResults = search({
        query: searchQuery,
        limit: 20,
      });
      setResults(searchResults);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query);
    }
  };

  const handleRecentSearch = (searchTerm: string) => {
    setQuery(searchTerm);
  };

  const handleClearHistory = () => {
    clearSearchHistory();
    setRecentSearches([]);
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Global Search</h1>
          <p className="text-gray-400">Search across products, docs, pages, and users</p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#1A2236] border-indigo-500/20 text-white pl-12 pr-12 h-14 text-lg"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setQuery('')}
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Searching...</p>
          </div>
        )}

        {/* Search Results */}
        {!loading && query && results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">
              Results for "{query}" ({results.length})
            </h2>
            {results.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-[#1A2236] border border-indigo-500/20 hover:border-indigo-500/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full ${
                        result.type === 'product' ? 'bg-blue-500/10' :
                        result.type === 'doc' ? 'bg-green-500/10' :
                        result.type === 'page' ? 'bg-purple-500/10' :
                        result.type === 'user' ? 'bg-yellow-500/10' :
                        'bg-gray-500/10'
                      }`}>
                        {result.type === 'product' && <Package className="w-5 h-5 text-blue-500" />}
                        {result.type === 'doc' && <FileText className="w-5 h-5 text-green-500" />}
                        {result.type === 'page' && <FileText className="w-5 h-5 text-purple-500" />}
                        {result.type === 'user' && <User className="w-5 h-5 text-yellow-500" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{result.title}</h3>
                        <p className="text-gray-400 text-sm mb-2">{result.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-indigo-500/10 text-indigo-500 text-xs">
                            {result.type}
                          </Badge>
                          <span className="text-gray-500 text-xs">Score: {result.score.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No results found for "{query}"</p>
          </div>
        )}

        {/* Recent & Trending Searches */}
        {!query && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Searches */}
            <Card className="bg-[#1A2236] border border-indigo-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Searches
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                    onClick={handleClearHistory}
                  >
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentSearches.length > 0 ? (
                  <div className="space-y-2">
                    {recentSearches.map((searchTerm, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentSearch(searchTerm)}
                        className="w-full text-left p-2 rounded-lg hover:bg-indigo-500/10 text-gray-300 hover:text-white transition-colors"
                      >
                        {searchTerm}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No recent searches</p>
                )}
              </CardContent>
            </Card>

            {/* Trending Searches */}
            <Card className="bg-[#1A2236] border border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Trending Searches
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trendingSearches.length > 0 ? (
                  <div className="space-y-2">
                    {trendingSearches.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentSearch(item.query)}
                        className="w-full text-left p-2 rounded-lg hover:bg-indigo-500/10 text-gray-300 hover:text-white transition-colors flex items-center justify-between"
                      >
                        <span>{item.query}</span>
                        <Badge className="bg-indigo-500/10 text-indigo-500 text-xs">
                          {item.count}
                        </Badge>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No trending searches</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
