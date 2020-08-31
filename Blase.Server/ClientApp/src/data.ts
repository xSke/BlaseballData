export interface GameUpdate {
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

    homeTeamName: string;
    homeTeamNickname: string;
    awayTeamName: string;
    awayTeamNickname: string;
}

export interface GameUpdateWrapper {
    timestamp: string,
    payload: GameUpdate
}

export interface Game {
    id: string;
    season: number;
    day: number;
    lastUpdate: GameUpdate;
    start: string;
    end: string;
}

export function toEmoji(input: string) {
    return String.fromCodePoint(Number(input));
}