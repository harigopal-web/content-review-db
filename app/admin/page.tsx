'use client';

import { useState, useEffect, Fragment } from 'react';
import { Plus, Edit, Trash2, Award, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Entry, Medium, ContentType } from '@/lib/types';
import { filterScoreTags, getDisplayTags } from '@/lib/tags';

const TV_TYPES: ContentType[] = [
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

const MOVIE_TYPES: ContentType[] = [
  'Comic Book Stuff',
  'Documentary/True Crime',
  'Drama',
  'Horror',
  'Comedy',
  'Thriller',
  'Romance',
  'Action',
  'Family',
];

const ALL_TYPES = [...new Set([...TV_TYPES, ...MOVIE_TYPES])].sort();

function validateType(type: ContentType | null, medium: Medium | null): ContentType {
  const validTypes = medium === 'TV' ? TV_TYPES : medium === 'Movie' ? MOVIE_TYPES : ALL_TYPES;
  if (type && validTypes.includes(type)) return type;
  return validTypes[0];
}

export default function AdminPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingRowData, setEditingRowData] = useState<Partial<Entry>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMedium, setFilterMedium] = useState<'All' | Medium>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [sortField, setSortField] = useState<'created_at' | 'title' | 'score' | 'year'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear(),
    score: 3.0,
    medium: 'Movie' as Medium,
    type: 'Drama' as ContentType,
    tags: [] as string[],
    hall_of_fame: false,
    poster_url: '',
    series_name: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [inlineTagInput, setInlineTagInput] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    let result = [...entries];

    // Search
    if (searchQuery.trim()) {
      result = result.filter((e) =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Medium filter
    if (filterMedium !== 'All') {
      result = result.filter((e) => e.medium === filterMedium);
    }

    // Type filter
    if (filterType !== 'All') {
      result = result.filter((e) => e.type === filterType);
    }

    // Sort
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredEntries(result);
  }, [searchQuery, filterMedium, filterType, sortField, sortDir, entries]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir(field === 'title' ? 'asc' : 'desc');
    }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 inline ml-1" />
      : <ChevronDown className="w-3 h-3 inline ml-1" />;
  };

  const availableTypes = filterMedium === 'TV' ? TV_TYPES : filterMedium === 'Movie' ? MOVIE_TYPES : ALL_TYPES;

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
      const submitData = { ...formData, tags: filterScoreTags(formData.tags) };
      if (editingEntry) {
        // Update existing entry
        const { error } = await (supabase
          .from('entries') as any)
          .update(submitData)
          .eq('id', editingEntry.id);

        if (error) throw error;
      } else {
        // Create new entry
        const { error } = await (supabase.from('entries') as any).insert([submitData]);

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
      type: validateType(entry.type, entry.medium),
      tags: filterScoreTags(entry.tags),
      hall_of_fame: entry.hall_of_fame || false,
      poster_url: entry.poster_url || '',
      series_name: entry.series_name || '',
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

  const startInlineEdit = (entry: Entry) => {
    setEditingRowId(entry.id);
    setEditingRowData({
      title: entry.title,
      year: entry.year,
      score: entry.score,
      medium: entry.medium || 'Movie',
      type: validateType(entry.type, entry.medium),
      tags: filterScoreTags(entry.tags),
      series_name: entry.series_name || '',
      poster_url: entry.poster_url || '',
    });
  };

  const cancelInlineEdit = () => {
    setEditingRowId(null);
    setEditingRowData({});
    setInlineTagInput('');
  };

  const saveInlineEdit = async (id: string) => {
    try {
      const dataToSave = { ...editingRowData, tags: filterScoreTags(editingRowData.tags) };
      const { error } = await (supabase
        .from('entries') as any)
        .update(dataToSave)
        .eq('id', id);

      if (error) throw error;
      setEditingRowId(null);
      setEditingRowData({});
      setInlineTagInput('');
      await loadEntries();
    } catch (error) {
      console.error('Error updating entry:', error);
      alert('Failed to update entry');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      year: new Date().getFullYear(),
      score: 3.0,
      medium: 'Movie',
      type: 'Drama',
      tags: [],
      hall_of_fame: false,
      poster_url: '',
      series_name: '',
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
                  onChange={(e) => {
                    const newMedium = e.target.value as Medium;
                    setFormData({ ...formData, medium: newMedium, type: validateType(formData.type, newMedium) });
                  }}
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
                  {(formData.medium === 'TV' ? TV_TYPES : formData.medium === 'Movie' ? MOVIE_TYPES : ALL_TYPES).map((type) => (
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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Series Name (optional)
                </label>
                <input
                  type="text"
                  value={formData.series_name}
                  onChange={(e) => setFormData({ ...formData, series_name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. The Bear"
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

      {/* Filters */}
      <div className="mb-6 space-y-3">
        {/* Search */}
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

        {/* Filter + Sort Row */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Medium filter */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Medium:</span>
            {(['All', 'Movie', 'TV'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setFilterMedium(m); setFilterType('All'); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterMedium === m
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
            >
              <option value="All">All Types</option>
              {availableTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-gray-400 text-sm">Sort:</span>
            {([
              { field: 'created_at', label: 'Date Added' },
              { field: 'title', label: 'Name' },
              { field: 'score', label: 'Score' },
              { field: 'year', label: 'Year' },
            ] as const).map(({ field, label }) => (
              <button
                key={field}
                onClick={() => toggleSort(field)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center ${
                  sortField === field
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {label}
                <SortIcon field={field} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 cursor-pointer hover:text-white select-none" onClick={() => toggleSort('title')}>Title <SortIcon field="title" /></th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 cursor-pointer hover:text-white select-none" onClick={() => toggleSort('year')}>Year <SortIcon field="year" /></th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 cursor-pointer hover:text-white select-none" onClick={() => toggleSort('score')}>Score <SortIcon field="score" /></th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Medium</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Tags</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Poster</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    No entries found
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const isEditing = editingRowId === entry.id;
                  const displayTags = getDisplayTags(entry.tags, entry.score);
                  const relatedEntries = isEditing && editingRowData.series_name
                    ? entries.filter(e => e.series_name && e.series_name === editingRowData.series_name && e.id !== entry.id)
                    : [];

                  return (
                    <Fragment key={entry.id}>
                    <tr className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3 text-white">
                        {isEditing ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={editingRowData.title || ''}
                              onChange={(e) => setEditingRowData({ ...editingRowData, title: e.target.value })}
                              className="w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                            />
                            <input
                              type="text"
                              value={editingRowData.series_name || ''}
                              onChange={(e) => setEditingRowData({ ...editingRowData, series_name: e.target.value })}
                              className="w-full px-2 py-1 bg-gray-700 text-gray-300 rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-xs"
                              placeholder="Series name"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2">
                              {entry.hall_of_fame && (
                                <Award className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                              )}
                              <span className="line-clamp-1">{entry.title}</span>
                            </div>
                            {entry.series_name && (
                              <span className="text-xs text-blue-400">Series: {entry.series_name}</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {isEditing ? (
                          <input
                            type="number"
                            min="2020"
                            max="2026"
                            value={editingRowData.year || 2024}
                            onChange={(e) => setEditingRowData({ ...editingRowData, year: parseInt(e.target.value) })}
                            className="w-20 px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                          />
                        ) : (
                          entry.year
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max="5"
                            step="0.5"
                            value={editingRowData.score || 3}
                            onChange={(e) => setEditingRowData({ ...editingRowData, score: parseFloat(e.target.value) })}
                            className="w-16 px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                          />
                        ) : (
                          entry.score
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {isEditing ? (
                          <select
                            value={editingRowData.medium || 'Movie'}
                            onChange={(e) => {
                            const newMedium = e.target.value as Medium;
                            setEditingRowData({ ...editingRowData, medium: newMedium, type: validateType(editingRowData.type || null, newMedium) });
                          }}
                            className="w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                          >
                            <option value="Movie">Movie</option>
                            <option value="TV">TV</option>
                          </select>
                        ) : (
                          entry.medium
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">
                        {isEditing ? (
                          <select
                            value={editingRowData.type || (editingRowData.medium === 'TV' ? TV_TYPES[0] : MOVIE_TYPES[0])}
                            onChange={(e) => setEditingRowData({ ...editingRowData, type: e.target.value as ContentType })}
                            className="w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-xs"
                          >
                            {(editingRowData.medium === 'TV' ? TV_TYPES : editingRowData.medium === 'Movie' ? MOVIE_TYPES : ALL_TYPES).map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        ) : (
                          entry.type
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap gap-1">
                              {filterScoreTags(editingRowData.tags).map((tag, i) => (
                                <span key={i} className="inline-flex items-center gap-1 text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded">
                                  {tag}
                                  <button
                                    type="button"
                                    onClick={() => setEditingRowData({ ...editingRowData, tags: (editingRowData.tags || []).filter(t => t !== tag) })}
                                    className="hover:text-red-400 ml-0.5"
                                  >×</button>
                                </span>
                              ))}
                            </div>
                            <input
                              type="text"
                              value={inlineTagInput}
                              onChange={(e) => setInlineTagInput(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (inlineTagInput.trim() && !(editingRowData.tags || []).includes(inlineTagInput.trim())) {
                                    setEditingRowData({ ...editingRowData, tags: [...(editingRowData.tags || []), inlineTagInput.trim()] });
                                    setInlineTagInput('');
                                  }
                                }
                              }}
                              className="w-full px-2 py-0.5 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-xs"
                              placeholder="Add tag..."
                            />
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {displayTags.slice(0, 3).map((tag, i) => (
                              <span
                                key={i}
                                className={`text-xs px-2 py-1 rounded ${
                                  ['must-watch', 'recommended', 'entertaining'].includes(tag)
                                    ? 'bg-blue-600/30 text-blue-300'
                                    : 'bg-gray-600 text-gray-300'
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                            {displayTags.length > 3 && (
                              <span className="text-xs text-gray-400">
                                +{displayTags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {(isEditing ? editingRowData.poster_url : entry.poster_url) ? (
                          <span className="text-green-400 text-sm">✓ Yes</span>
                        ) : (
                          <span className="text-gray-500 text-sm">No poster</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => saveInlineEdit(entry.id)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelInlineEdit}
                              className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
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
                              onClick={() => startInlineEdit(entry)}
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
                        )}
                      </td>
                    </tr>
                    {isEditing && (
                      <tr className="bg-gray-700/30">
                        <td colSpan={8} className="px-4 py-2">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 w-14 flex-shrink-0">Poster:</span>
                              <input
                                type="text"
                                value={editingRowData.poster_url || ''}
                                onChange={(e) => setEditingRowData({ ...editingRowData, poster_url: e.target.value })}
                                className="flex-1 px-2 py-0.5 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-xs"
                                placeholder="https://image.tmdb.org/t/p/w500..."
                              />
                            </div>
                            {editingRowData.series_name && (
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-blue-400 font-medium">
                                  {`Related in "${editingRowData.series_name}":`}
                                </span>
                                {relatedEntries.length > 0 ? (
                                  relatedEntries.map(e => (
                                    <span key={e.id} className="text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded">
                                      {e.title} — {e.score}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-gray-500">No other entries in this series yet</span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                    </Fragment>
                  );
                })
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
