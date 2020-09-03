import {useParams} from "react-router";
import React from 'react';
import useSWR from "swr";
import {Game, GamesResponse} from "../data";

import {DayTable} from "../components/DayTable";
import {Container} from "../components/Container";

export function DayPage() {
    let {season, day} = useParams();
    season = parseInt(season);

    const {data, error} = useSWR<GamesResponse>(`/api/games?season=${season-1}&day=${day-1}&dayCount=1`);

    if (!data) {
        return (<div>Loading...</div>);
    }

    const games = (data && data.days.length > 0) ? data.days[0].games : [];
    
    return (
        <Container>
            <DayTable season={season} day={day} games={games}/>
        </Container>
    );
}