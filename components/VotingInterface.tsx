'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { VoteSummary } from '@/lib/types';

interface VotingInterfaceProps {
  entryId: string;
}

export default function VotingInterface({ entryId }: VotingInterfaceProps) {
  const [voteSummary, setVoteSummary] = useState<VoteSummary>({
    agree: 0,
    disagree_higher: 0,
    disagree_lower: 0,
    total: 0,
  });
  const [userVote, setUserVote] = useState<string | null>(null);
  const [showDisagreeOptions, setShowDisagreeOptions] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVoteSummary();
    loadUserVote();
  }, [entryId]);

  const loadVoteSummary = async () => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('entry_id', entryId);

      if (error) throw error;

      const summary: VoteSummary = {
        agree: 0,
        disagree_higher: 0,
        disagree_lower: 0,
        total: 0,
      };

      (data as any)?.forEach((vote: any) => {
        summary.total++;
        if (vote.vote_type === 'agree') summary.agree++;
        if (vote.vote_type === 'disagree-higher') summary.disagree_higher++;
        if (vote.vote_type === 'disagree-lower') summary.disagree_lower++;
      });

      setVoteSummary(summary);
    } catch (error) {
      console.error('Error loading vote summary:', error);
    }
  };

  const loadUserVote = () => {
    const storedVote = localStorage.getItem(`vote_${entryId}`);
    setUserVote(storedVote);
  };

  const handleVote = async (voteType: 'agree' | 'disagree-higher' | 'disagree-lower') => {
    if (userVote) return; // Already voted

    setLoading(true);

    try {
      const { error } = await (supabase
        .from('votes') as any)
        .insert({ entry_id: entryId, vote_type: voteType });

      if (error) throw error;

      localStorage.setItem(`vote_${entryId}`, voteType);
      setUserVote(voteType);
      await loadVoteSummary();
      setShowDisagreeOptions(false);
    } catch (error) {
      console.error('Error submitting vote:', error);
    } finally {
      setLoading(false);
    }
  };

  const agreePercentage = voteSummary.total > 0
    ? Math.round((voteSummary.agree / voteSummary.total) * 100)
    : 0;

  const disagreeTotal = voteSummary.disagree_higher + voteSummary.disagree_lower;

  return (
    <div className="border-t pt-4">
      {!userVote ? (
        <div>
          <p className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Do you agree with this rating?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleVote('agree')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Yes</span>
            </button>
            <button
              onClick={() => setShowDisagreeOptions(!showDisagreeOptions)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <ThumbsDown className="w-4 h-4" />
              <span>No</span>
            </button>
          </div>

          {showDisagreeOptions && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Should it be higher or lower?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleVote('disagree-higher')}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <ChevronUp className="w-4 h-4" />
                  <span>Higher</span>
                </button>
                <button
                  onClick={() => handleVote('disagree-lower')}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <ChevronDown className="w-4 h-4" />
                  <span>Lower</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p className="font-medium mb-2">Thanks for voting!</p>
          <div className="space-y-1">
            <p>{agreePercentage}% agree ({voteSummary.agree} votes)</p>
            {disagreeTotal > 0 && (
              <p className="text-xs">
                Of {disagreeTotal} who disagree: {voteSummary.disagree_higher} think higher,{' '}
                {voteSummary.disagree_lower} think lower
              </p>
            )}
            <p className="text-xs font-medium">Total votes: {voteSummary.total}</p>
          </div>
        </div>
      )}

      {userVote && voteSummary.total === 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>Be the first to vote!</p>
        </div>
      )}
    </div>
  );
}
