export enum TournamentStatus {
  DRAFT = 'DRAFT',
  REGISTRATION_OPEN = 'REGISTRATION_OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  GROUPS_IN_PROGRESS = 'GROUPS_IN_PROGRESS',
  PLAYOFFS_IN_PROGRESS = 'PLAYOFFS_IN_PROGRESS',
  FINISHED = 'FINISHED',
  ARCHIVED = 'ARCHIVED',
  CANCELLED = 'CANCELLED',
}

export enum TransferWindowStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export type Tournament = import('./database').Database['public']['Tables']['tournaments']['Row'];
