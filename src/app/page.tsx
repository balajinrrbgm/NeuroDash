'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MessageSquare, TrendingUp, AlertCircle, Search, ChevronRight, Activity, Database, Server } from 'lucide-react';

const mockData = [
  { name: 'Mon', sentiment: 40, volume: 240 },
  { name: 'Tue', sentiment: 30, volume: 139 },
  { name: 'Wed', sentiment: 20, volume: 980 },
  { name: 'Thu', sentiment: 27, volume: 390 },
  { name: 'Fri', sentiment: 18, volume: 480 },
  { name: 'Sat', sentiment: 23, volume: 380 },
  { name: 'Sun', sentiment: 34, volume: 430 },
];

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setIsSearching(true);
    setError(null);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, limit: 4 }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to search');
      }
      setSearchResults(data.data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during search.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/50 backdrop-blur-xl">
        <div className="flex h-16 items-center px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-lg tracking-tight">
            <Activity className="h-5 w-5" />
            NeuroDash
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
              <Database className="h-3 w-3" />
              Aurora Connected
            </span>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Search Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/20 to-purple-900/10 border border-neutral-800 p-8 sm:p-12">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300 text-transparent bg-clip-text">
              Ask Your Data
            </h1>
            <p className="text-neutral-400 text-lg">
              Perform semantic search across millions of customer feedback records instantly using pgvector.
            </p>
            
            <form onSubmit={handleSearch} className="relative group max-w-2xl mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="relative flex items-center bg-neutral-900 border border-neutral-700 rounded-2xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                <Search className="h-5 w-5 ml-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., 'Are users complaining about the new checkout flow?'"
                  className="w-full bg-transparent px-4 py-4 text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="mr-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSearching ? 'Searching...' : 'Analyze'}
                  {!isSearching && <ChevronRight className="h-4 w-4" />}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Metrics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-neutral-400 mb-4">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              <h3 className="font-medium">Global Sentiment</h3>
            </div>
            <p className="text-4xl font-bold text-neutral-100">68.4%</p>
            <p className="text-sm text-emerald-400 mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +2.4% from last week
            </p>
          </div>
          
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-neutral-400 mb-4">
              <MessageSquare className="h-5 w-5 text-purple-400" />
              <h3 className="font-medium">Total Feedback</h3>
            </div>
            <p className="text-4xl font-bold text-neutral-100">1.2M</p>
            <p className="text-sm text-neutral-500 mt-2">Processed by Aurora DSQL</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-neutral-400 mb-4">
              <AlertCircle className="h-5 w-5 text-rose-400" />
              <h3 className="font-medium">Emerging Issues</h3>
            </div>
            <p className="text-4xl font-bold text-neutral-100">3</p>
            <p className="text-sm text-rose-400 mt-2 text-wrap">Requires attention</p>
          </div>
        </section>

        {/* Charts and Details */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm">
            <h3 className="font-medium text-neutral-100 mb-6 flex items-center gap-2">
              <Server className="h-4 w-4 text-indigo-400" />
              Ingestion Volume (Real-time)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis dataKey="name" stroke="#525252" tick={{ fill: '#737373' }} tickLine={false} axisLine={false} />
                  <YAxis stroke="#525252" tick={{ fill: '#737373' }} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '12px' }}
                    itemStyle={{ color: '#e5e5e5' }}
                  />
                  <Line type="monotone" dataKey="volume" stroke="#818cf8" strokeWidth={3} dot={{ fill: '#818cf8', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#4f46e5' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm">
            <h3 className="font-medium text-neutral-100 mb-6">Search Results</h3>
            {error && (
              <div className="p-4 mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-sm">
                <AlertCircle className="inline-block w-4 h-4 mr-2" />
                {error}
              </div>
            )}
            <div className="space-y-4">
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <div key={item.id} className="group p-4 rounded-xl border border-neutral-800 bg-neutral-950/50 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all">
                    <p className="text-sm text-neutral-300 line-clamp-2">
                      "{item.content}"
                    </p>
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <span className={`font-medium px-2 py-0.5 rounded-full ${item.sentiment === 'positive' ? 'text-emerald-400 bg-emerald-400/10' : item.sentiment === 'negative' ? 'text-rose-400 bg-rose-400/10' : 'text-neutral-400 bg-neutral-400/10'}`}>
                        {item.sentiment || 'neutral'}
                      </span>
                      <span className="text-neutral-500 font-mono">sim: {(item.similarity * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))
              ) : (
                !error && (
                  <div className="text-center p-6 border border-dashed border-neutral-800 rounded-xl text-neutral-500 text-sm">
                    No results found. Try asking a question.
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
