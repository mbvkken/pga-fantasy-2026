import teamsData from "@/data/teams.json";
import aliases from "@/data/name-aliases.json";
import type { Participant, TeamsData } from "./types";

const data = teamsData as TeamsData;
const aliasMap = aliases as Record<string, string>;

export function getTeamsData(): TeamsData {
  return data;
}

export function getParticipants(): Participant[] {
  return data.participants;
}

export function getParticipantById(id: string): Participant | undefined {
  return data.participants.find((participant) => participant.id === id);
}

export function resolveGolferName(name: string): string {
  return aliasMap[name] ?? name;
}

export function normalizeNameKey(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function allPickedGolferNames(): string[] {
  const names = new Set<string>();
  for (const participant of data.participants) {
    for (const pick of participant.picks) {
      names.add(pick.golfer);
      names.add(resolveGolferName(pick.golfer));
    }
  }
  return [...names];
}
