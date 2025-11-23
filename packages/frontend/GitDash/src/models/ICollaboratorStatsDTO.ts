// src/models/ICollaboratorStatsDTO.ts
export type CollaboratorRole = 'admin' | 'write' | 'read';

export interface ICollaboratorStatsDTO {
  login: string;          // GitHub username
  avatarUrl: string;
  role: CollaboratorRole;
  commits: number;
  pullRequests: number;
  issues: number;
}
