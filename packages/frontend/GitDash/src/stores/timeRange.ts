import { defineStore } from 'pinia'

export type TimeRange = '1 week' | '1 month' | '3 months'

interface TimeRangeState {
  timeRange: TimeRange
}

export const useTimeRangeStore = defineStore('timerange', {
  state: (): TimeRangeState => ({
    timeRange: '1 week', // Default value
  }),

  getters: {
    getTimeRange(state): TimeRange {
      return state.timeRange
    },

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
     * Setter: Sets the new time range.
     * @param newRange The new time range string (must be TimeRange type).
     */
    setTimeRange(newRange: TimeRange) {
      this.timeRange = newRange
    },
  },
})
