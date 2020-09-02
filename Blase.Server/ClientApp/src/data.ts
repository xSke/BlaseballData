export interface GamePayload {
    lastUpdate: string;
    inning: number;
    topOfInning: boolean;
    gameComplete: boolean;

    awayTeamEmoji: string;
    homeTeamEmoji: string;

    awayPitcherName: string;
    awayBatterName: string | null;
    homePitcherName: string;
    homeBatterName: string | null;

    awayScore: number;
    homeScore: number;

    atBatStrikes: number;
    atBatBalls: number;
    halfInningOuts: number;

    season: number;
    day: number;
    weather: number;
    outcomes: string[];

    homeTeamName: string;
    homeTeamNickname: string;
    awayTeamName: string;
    awayTeamNickname: string;
}

export interface GameUpdate {
    id: string;
    timestamp: string,
    payload: GamePayload
}

export interface Game {
    id: string;
    start: string | null;
    end: string | null;
    lastUpdate: GamePayload;
    lastUpdateTime: string;
}

export interface Day {
    season: number;
    day: number;
    start: string | null;
    games: Game[];
}

export interface GamesResponse {
    days: Day[]
}

export interface GameUpdatesResponse {
    updates: GameUpdate[]
}

export function toEmoji(input: string) {
    return String.fromCodePoint(Number(input));
}

export const weather: Record<number, {name: string, emoji: string}> = {
    7: {name: "Solar Eclipse", emoji: "\u{1F311}"},
    10: {name: "Peanuts", emoji: "\u{1F95C}"},
    11: {name: "Lots of Birds", emoji: "\u{1F426}"},
    12: {name: "Feedback", emoji: "\u{1F3A4}"},
    13: {name: "Reverb", emoji: "\u{1F30A}"}
}