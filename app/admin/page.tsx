'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Award, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Entry, Medium, ContentType } from '@/lib/types';

const CONTENT_TYPES: ContentType[] = [
  'Movies',
  'Documentary/True Crime',
  'Sports',
  'Drama TV',
  'Comedy TV',
  'Comedy Specials',
  'Reality Competition',
  'Reality Dating',
  'Comic Book Stuff',
  'Home Improvement',
];

export default function AdminPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear(),
    score: 3.0,
    medium: 'Movie' as Medium,
    type: 'Movies' as ContentType,
    tags: [] as string[],
    hall_of_fame: false,
    poster_url: '',
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = entries.filter((entry) =>
        entry.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEntries(filtered);
    } else {
      setFilteredEntries(entries);
    }
  }, [searchQuery, entries]);

  const loadEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
      setFilteredEntries(data || []);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingEntry) {
        // Update existing entry
        const { error } = await (supabase
          .from('entries') as any)
          .update(formData)
          .eq('id', editingEntry.id);

        if (error) throw error;
      } else {
        // Create new entry
        const { error } = await (supabase.from('entries') as any).insert([formData]);

        if (error) throw error;
      }

      resetForm();
      await loadEntries();
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry');
    }
  };

  const handleEdit = (entry: Entry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title,
      year: entry.year,
      score: entry.score,
      medium: entry.medium || 'Movie',
      type: entry.type || 'Movies',
      tags: entry.tags || [],
      hall_of_fame: entry.hall_of_fame || false,
      poster_url: entry.poster_url || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const { error } = await supabase.from('entries').delete().eq('id', id);

      if (error) throw error;
      await loadEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry');
    }
  };

  const toggleHallOfFame = async (entry: Entry) => {
    try {
      const { error } = await (supabase
        .from('entries') as any)
        .update({ hall_of_fame: !entry.hall_of_fame })
        .eq('id', entry.id);

      if (error) throw error;
      await loadEntries();
    } catch (error) {
      console.error('Error updating Hall of Fame status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      year: new Date().getFullYear(),
      score: 3.0,
      medium: 'Movie',
      type: 'Movies',
      tags: [],
      hall_of_fame: false,
      poster_url: '',
    });
    setTagInput('');
    setEditingEntry(null);
    setShowForm(false);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Manage Entries</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Entry</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            {editingEntry ? 'Edit Entry' : 'Add New Entry'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  min="2020"
                  max="2026"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Score * (0-5 in 0.5 increments)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.5"
                  value={formData.score}
                  onChange={(e) =>
                    setFormData({ ...formData, score: parseFloat(e.target.value) })
                  }
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Medium *
                </label>
                <select
                  value={formData.medium}
                  onChange={(e) => setFormData({ ...formData, medium: e.target.value as Medium })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  <option value="Movie">Movie</option>
                  <option value="TV">TV</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as ContentType })
                  }
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  {CONTENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Poster URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.poster_url}
                  onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Type a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Add Tag
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hall_of_fame}
                  onChange={(e) =>
                    setFormData({ ...formData, hall_of_fame: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-300">
                  Add to Hall of Fame
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                {editingEntry ? 'Update Entry' : 'Create Entry'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries..."
            className="w-full pl-12 pr-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Entries List */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Year</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Score</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Medium</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Tags</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No entries found
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 text-white">
                      <div className="flex items-center gap-2">
                        {entry.hall_of_fame && (
                          <Award className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        )}
                        <span className="line-clamp-1">{entry.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{entry.year}</td>
                    <td className="px-4 py-3 text-gray-300">{entry.score}</td>
                    <td className="px-4 py-3 text-gray-300">{entry.medium}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{entry.type}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {entry.tags?.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {entry.tags && entry.tags.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{entry.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => toggleHallOfFame(entry)}
                          className={`p-2 rounded transition-colors ${
                            entry.hall_of_fame
                              ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                              : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                          }`}
                          title="Toggle Hall of Fame"
                        >
                          <Award className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(entry)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-gray-400 text-sm">
        Total entries: {filteredEntries.length}
        {searchQuery && ` (filtered from ${entries.length})`}
      </div>
    </div>
  );
}
