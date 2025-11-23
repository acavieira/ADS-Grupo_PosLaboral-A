// src/models/RepoOverviewStatsDTO.ts
export interface IRepoOverviewStatsDTO {
  kpis: {
    commits: number;
    prsMerged: number;
    issuesClosed: number;
  };
  openWork: {
    openPrs: number;
    openIssues: number;
    needsReview: number;
  };
  peakActivity: {
    mostActiveDay:
      | 'Sunday'
      | 'Monday'
      | 'Tuesday'
      | 'Wednesday'
      | 'Thursday'
      | 'Friday'
      | 'Saturday';
    peakHourUtc?: string | null;  // "14:00 - 15:00"
    teamSize: number;             // nº de colaboradores
  };
}
