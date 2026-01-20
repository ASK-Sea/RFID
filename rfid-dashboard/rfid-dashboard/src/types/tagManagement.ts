// Tag Management types

export type Stat = {
  epc: string;
  scan_count: number;
  last_seen: string | null;
};

export type Tag = {
  epc: string;
  tag_name: string;
  position: string;
  purpose: string;
};

export type RegisteredTagStat = {
  epc: string;
  tag_name: string;
  position: string;
  purpose: string;
  scan_count: number;
  last_seen: string | null;
};

export type ResetBaselines = Record<string, number>;
