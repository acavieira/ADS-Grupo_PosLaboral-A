export type CollaboratorRole = 'admin' | 'write' | 'read';

export interface ICollaboratorStats {
  login: string;
  avatarUrl: string;
  role: CollaboratorRole;
  commits: number;
  pullRequests: number;
  issues: number;
}
