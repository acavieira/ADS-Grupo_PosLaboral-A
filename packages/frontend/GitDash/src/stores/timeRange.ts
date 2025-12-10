import { defineStore } from 'pinia'

/**
 * Defines the supported time ranges for filtering data.
 * Possible values: '1 week', '1 month', '3 months'.
 */
export type TimeRange = '1 week' | '1 month' | '3 months'

/**
 * Interface representing the state of the TimeRange store.
 */
interface TimeRangeState {
  /**
   * The currently selected time range value.
   */
  timeRange: TimeRange
}

/**
 * Store for managing the global time range selection.
 * Used to filter data views across the application based on a specific period.
 */
export const useTimeRangeStore = defineStore('timerange', {
  /**
   * Initial state of the store.
   * @returns {TimeRangeState} The initial state object.
   */
  state: (): TimeRangeState => ({
    timeRange: '1 week', // Default value
  }),

  getters: {
    /**
     * Retrieves the currently selected time range.
     *
     * @param state - The current state of the store.
     * @returns {TimeRange} The active time range string.
     */
    getTimeRange(state): TimeRange {
      return state.timeRange
    },

    /**
     * Returns a user-friendly label for the current time range, suitable for UI display.
     *
     * @example
     * // If timeRange is '1 week', returns 'Last week'
     * useTimeRangeStore().getHumanReadableTimeRange // 'Last week'
     *
     * @param state - The current state of the store.
     * @returns {string} The human-readable string representation of the time range.
     */
    getHumanReadableTimeRange(state): string {
      const labels: Record<TimeRange, string> = {
        '1 week': 'Last week',
        '1 month': 'Last month',
        '3 months': 'Last 3 months',
      }

      return labels[state.timeRange]
    },
  },

  actions: {
    /**
     * Updates the current time range in the state.
     *
     * @param newRange - The new time range to set (must be of type TimeRange).
     */
    setTimeRange(newRange: TimeRange) {
      this.timeRange = newRange
    },
  },
})
