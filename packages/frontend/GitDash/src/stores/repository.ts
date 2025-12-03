// src/stores/repository.ts
import { defineStore } from 'pinia'
import type { IRepository } from '@/models/IRepository.ts'

// 2. Define the State Interface
interface RepositoryState {
  currentRepository: IRepository | null // The state can be an IRepository object or null
}

export const useRepositoryStore = defineStore('repository', {
  state: (): RepositoryState => ({
    currentRepository: null,
  }),

  getters: {
    getCurrentRepository(state): IRepository | null {
      return state.currentRepository
    },

    isRepositorySelected(state): boolean {
      return state.currentRepository !== null
    },

    getCurrentRepositoryFullName(state): string | null {
      return state.currentRepository?.fullName ?? null
    },
  },

  // Actions are the methods where we ensure correct arguments are passed
  actions: {
    /**
     * Setter: Sets the new current repository object.
     * @param repository The new repository object (must be IRepository type).
     */
    setCurrentRepository(repository: IRepository) {
      this.currentRepository = repository
    },

    /**
     * Clears the current repository (sets it to null).
     */
    clearRepository() {
      this.currentRepository = null
    },
  },
})
