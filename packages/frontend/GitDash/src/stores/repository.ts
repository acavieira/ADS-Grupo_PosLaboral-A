// src/stores/repository.ts
import { defineStore } from 'pinia'
import type { IRepository } from '@/models/IRepository.ts'

/**
 * Interface defining the shape of the Repository store state.
 */
interface RepositoryState {
  /** * The currently selected repository object.
   * Is `null` if no repository has been selected by the user yet.
   */
  currentRepository: IRepository | null
}

/**
 * Global Pinia store for managing the currently selected repository context.
 * * Acts as the central source of truth for determining which repository data
 * is currently being visualized across the application.
 */
export const useRepositoryStore = defineStore('repository', {
  state: (): RepositoryState => ({
    currentRepository: null,
  }),

  getters: {
    /**
     * Retrieves the full current repository object.
     * @returns The repository object or null.
     */
    getCurrentRepository(state): IRepository | null {
      return state.currentRepository
    },

    /**
     * Checks if a repository is currently active.
     * Useful for conditional rendering (e.g., hiding charts when no repo is selected).
     * @returns True if a repository is selected, false otherwise.
     */
    isRepositorySelected(state): boolean {
      return state.currentRepository !== null
    },

    /**
     * Safe accessor for the repository's full name (e.g., "owner/repo").
     * @returns The full name string or null if no repository is selected.
     */
    getCurrentRepositoryFullName(state): string | null {
      return state.currentRepository?.fullName ?? null
    },
  },

  actions: {
    /**
     * Updates the global state with a new repository.
     * This will trigger reactive updates in all components listening to this store.
     * @param repository - The new repository object to select.
     */
    setCurrentRepository(repository: IRepository) {
      this.currentRepository = repository
    },

    /**
     * Resets the current repository selection to null.
     * Effectively clears the current dashboard view.
     */
    clearRepository() {
      this.currentRepository = null
    },
  },
})
