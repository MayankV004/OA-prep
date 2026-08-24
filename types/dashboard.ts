export interface KindTotal {
  kind: string;
  total: number;
  completed: number;
}

export interface DifficultyMixData {
  Easy?: number;
  Medium?: number;
  Hard?: number;
}

export interface TrendPoint {
  date: string;
  completed: number;
}

export interface HeatmapPoint {
  date: string;
  count: number;
}

export interface ActivityEvent {
  _id: string;
  actorId: string;
  targetUserId: string;
  kind: string;
  entity?: {
    type: string;
    id: string;
    title?: string;
  };
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface DashboardStats {
  totalsByKind: KindTotal[];
  difficultyMix: DifficultyMixData;
  trend: TrendPoint[];
  heatmap: HeatmapPoint[];
  recent: ActivityEvent[];
}

export interface GlobalStats {
  patternCount: number;
  variationCount: string;
  problemCount: string;
  topicCount: number;
}
