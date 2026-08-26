export interface RecordActivityArgs {
  actorId: string;
  targetUserId: string;
  kind: string;
  entity?: {
    type: string;
    id: string;
    title?: string;
  };
  metadata?: Record<string, unknown>;
  ip?: string;
}

export interface ActivityItemDTO {
  _id: string;
  actorId: string;
  targetUserId: string;
  kind: string;
  entity?: {
    type?: string;
    id?: string;
    title?: string;
  };
  metadata?: Record<string, any>;
  ip?: string;
  createdAt: string;
}
