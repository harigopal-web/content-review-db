'use client';

import { useState, useEffect } from 'react';
import { Trash2, MessageSquare, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Recommendation } from '@/lib/types';

export default function AdminRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this recommendation?')) return;

    try {
      const { error } = await supabase
        .from('recommendations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadRecommendations();
    } catch (error) {
      console.error('Error deleting recommendation:', error);
      alert('Failed to delete recommendation');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Recommendations</h1>
          <p className="text-gray-400">View suggestions from visitors</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-blue-500"></div>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-xl text-gray-400">No recommendations yet</p>
          <p className="text-gray-500 mt-2">When visitors submit recommendations, they'll appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{rec.title}</h3>
                    <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full">
                      {rec.medium}
                    </span>
                  </div>

                  {rec.reason && (
                    <p className="text-gray-300 mb-3">{rec.reason}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>From: {rec.submitter_name || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(rec.created_at)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(rec.id)}
                  className="ml-4 p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-gray-400 text-sm">
        Total recommendations: {recommendations.length}
      </div>
    </div>
  );
}
