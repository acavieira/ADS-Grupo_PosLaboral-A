import type { CollaboratorRole } from '@/models/ICollaboratorStats.ts'

export interface IPseudonymizedCollaboratorStats {
  alias: string;
  /** Opaque, short-lived reference that opens this person's individual view without revealing the login. */
  reference: string;
  role: CollaboratorRole;
  commits: number;
  pullRequests: number;
  issues: number;
}