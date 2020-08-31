import {useParams} from "react-router";
import React from 'react';
import useSWR from "swr";
import {Game, toEmoji} from "../data";
import {
    Badge,
    Container,
    Table
} from "reactstrap";

import './SeasonPage.css';
import {DayTable} from "./DayTable";

export function SeasonPage() {
    let {season} = useParams();
    season = parseInt(season);
    
    const {data, error} = useSWR<Game[]>(`/api/seasons/${season-1}/games`);
    
    if (!data) {
        return (<div>Loading...</div>);
    }

    const days: Game[][] = [];
    for (const game of data) {
        if (!days[game.day])
            days[game.day] = [];
        days[game.day].push(game)
    }
    
    const elements = days.map((games, i) => {
        return <DayTable key={i} season={season} day={i + 1} games={games}/>;
    }).reverse();

    return (
        <Container>
            {elements}
        </Container>
    )
}