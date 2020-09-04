import { GameUpdate } from "./update";
import { Day } from "./game";

export interface GamesResponse {
    days: Day[]
}

export interface GameUpdatesResponse {
    updates: GameUpdate[]
}