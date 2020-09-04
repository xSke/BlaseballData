export interface GamePayload {
    lastUpdate: string;
    inning: number;
    topOfInning: boolean;
    gameComplete: boolean;
    shame: boolean;

    atBatStrikes: number;
    atBatBalls: number;
    halfInningOuts: number;

    season: number;
    day: number;
    weather: number;
    outcomes: string[];

    homeTeamName: string;
    homeTeamNickname: string;
    homeTeamEmoji: string;
    awayTeamName: string;
    awayTeamNickname: string;
    awayTeamEmoji: string;

    awayPitcherName: string;
    awayBatterName: string | null;
    homePitcherName: string;
    homeBatterName: string | null;

    awayScore: number;
    homeScore: number;

    basesOccupied: number[];
    baseRunnerNames: string[];
}

export type GameUpdate = {
    id: string;
    timestamp: string,
    payload: GamePayload
}

export function isImportant(evt: GamePayload): boolean {
    const importantMessages: RegExp[] = [
        /hits a (Single|Double|Triple)/g,
        /hits a (solo|2-run|3-run) home run/g,
        /steals (second) base/g,
        /steals home/g,
        /scores/g,
        /(2s|3s) score/g
    ];

    for (const regex of importantMessages)
        if (regex.test(evt.lastUpdate))
            return true;

    return false;
}