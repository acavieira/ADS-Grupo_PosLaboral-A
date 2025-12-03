import type { ICollaboratorStats } from '@/models/ICollaboratorStats.ts'

export interface  ICollaboratorStatsDTO {
  repository: string;
  count: number;
  collaborators: ICollaboratorStats[];
}



