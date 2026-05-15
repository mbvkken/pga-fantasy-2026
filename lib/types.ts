export type GolferStatus =
  | "not_started"
  | "active"
  | "cut"
  | "wd"
  | "dq"
  | "finished";

export interface TeamPick {
  group: number;
  golfer: string;
}

export interface Participant {
  id: string;
  name: string;
  picks: TeamPick[];
}

export interface TeamsData {
  tournament: string;
  importedAt: string;
  source?: string;
  participants: Participant[];
}

export interface LiveGolferRow {
  dgId: number | null;
  name: string;
  position: number | null;
  positionDisplay: string | null;
  status: GolferStatus;
  scoreToPar: number | null;
  today: number | null;
  thru: number | string | null;
  round: number | null;
}

export interface PickResult {
  group: number;
  golfer: string;
  dgId: number | null;
  position: number | null;
  positionDisplay: string | null;
  status: GolferStatus;
  points: number | null;
  countsTowardTotal: boolean;
  scoreToPar: number | null;
  today: number | null;
  thru: number | string | null;
}

export interface ParticipantStanding {
  id: string;
  name: string;
  rank: number;
  totalPoints: number | null;
  countingPicks: number;
  picks: PickResult[];
}

export interface LeaderboardResponse {
  tournament: string;
  eventName: string | null;
  lastUpdated: string | null;
  dataSource: "datagolf" | "cached" | "unavailable";
  dataSourceMessage: string | null;
  standings: ParticipantStanding[];
}
