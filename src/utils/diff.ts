import { diffWords } from 'diff';

export interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export const computeDiff = (original: string, modified: string): DiffPart[] => {
  if (!original || !modified) return [{ value: modified || original || '' }];
  return diffWords(original, modified);
};
