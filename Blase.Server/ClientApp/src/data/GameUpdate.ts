export interface GameUpdate {
    lastUpdate: string;
    inning: number;
    topOfInning: boolean;

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

    homeTeamName: string;
    homeTeamNickname: string;
    awayTeamName: string;
    awayTeamNickname: string;
}

export interface GameUpdateWrapper {
    timestamp: string,
    payload: GameUpdate
}