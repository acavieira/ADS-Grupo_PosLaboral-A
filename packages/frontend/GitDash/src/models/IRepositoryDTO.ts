import type { IRepository } from '@/models/IRepository.ts'

export interface IRepositoryDTO {
  count: number;
  repositories: IRepository[];
}
