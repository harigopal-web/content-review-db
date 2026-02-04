/** Tags that are derived from score — never stored, always computed */
export const SCORE_TAGS = ['must-watch', 'recommended', 'entertaining'];

export function getScoreTag(score: number): string | null {
  if (score === 5) return 'must-watch';
  if (score === 4 || score === 4.5) return 'recommended';
  if (score === 3 || score === 3.5) return 'entertaining';
  return null;
}

/** Strip score-derived tags from a DB tags array */
export function filterScoreTags(tags: string[] | null | undefined): string[] {
  return (tags || []).filter((t) => !SCORE_TAGS.includes(t));
}

/** Display tags: computed score tag first, then the rest of the user tags */
export function getDisplayTags(tags: string[] | null, score: number): string[] {
  const filtered = filterScoreTags(tags);
  const scoreTag = getScoreTag(score);
  return scoreTag ? [scoreTag, ...filtered] : filtered;
}
