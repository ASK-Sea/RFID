export interface Scan {
  id: number
  epc: string
  display_name?: string | null
  read_time: string
}

export interface Stat {
  epc: string
  display_name?: string | null
  scan_count: number
  last_seen: string | null
}

export interface Tag {
  epc: string
  tag_name: string
}

export interface RegisteredTagStat {
  epc: string
  tag_name: string
  scan_count: number
  last_seen: string | null
}

export type ResetBaselines = Record<string, number>
