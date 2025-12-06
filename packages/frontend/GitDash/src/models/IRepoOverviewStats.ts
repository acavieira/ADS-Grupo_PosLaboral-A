export interface IRepoOverviewStats {
  commits: number
  commitsLabel: string

  prsMerged: number
  prsLabel: string

  issuesClosed: number
  issuesLabel: string

  openPrs: number
  openIssues: number
  peakDay: string
  peakHour: string
  teamSize: number
}
