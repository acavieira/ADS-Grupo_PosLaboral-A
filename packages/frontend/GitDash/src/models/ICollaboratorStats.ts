export type CollaboratorRole = 'admin' | 'write' | 'read';

export interface ICollaboratorStats {
  login: string;
  avatarUrl: string;
  /** Only when pseudonymized: what the individual views request instead of the login. */
  reference?: string;
  role: CollaboratorRole;
  commits: number;
  pullRequests: number;
  issues: number;
}
