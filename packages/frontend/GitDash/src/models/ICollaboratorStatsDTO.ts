import type { ICollaboratorStats } from '@/models/ICollaboratorStats.ts'
import type { IPseudonymizedCollaboratorStats } from '@/models/IPseudonymizedCollaboratorStats.ts'

export interface  ICollaboratorStatsDTO {
  repository: string;
  count: number;
  collaborators: ICollaboratorStats[];
  pseudonymized?: false;
}

export interface IPseudonymizedCollaboratorStatsDTO {
  repository: string;
  count: number;
  pseudonymized: true;
  collaborators: IPseudonymizedCollaboratorStats[];
}


