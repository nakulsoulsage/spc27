export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const APPLICATION_STATUS_TRANSITIONS: Record<string, string[]> = {
  APPLIED: ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: ['SELECTED', 'REJECTED'],
  SELECTED: ['OFFERED', 'REJECTED'],
  OFFERED: [],
  REJECTED: [],
};

export const ROUND_ORDER = [
  'APTITUDE',
  'CODING',
  'TECHNICAL',
  'GROUP_DISCUSSION',
  'HR',
];
