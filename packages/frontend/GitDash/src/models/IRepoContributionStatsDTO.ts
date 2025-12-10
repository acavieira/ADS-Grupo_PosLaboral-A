export interface IRepoContributionStatsDTO {
  commits: {
    totalCount: number
  }
  pullRequests: {
    totalCount: number
    mergedCount: number
  }
  issues: {
    totalCount: number
    closedCount: number
  }
  reviews: {
    givenCount: number
  }
}
