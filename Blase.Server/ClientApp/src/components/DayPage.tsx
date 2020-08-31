import {useParams} from "react-router";
import React from 'react';
import useSWR from "swr";
import {Game} from "../data";
import {
    Container
} from "reactstrap";

import {DayTable} from "./DayTable";

export function DayPage() {
    let {season, day} = useParams();
    season = parseInt(season);

    const {data, error} = useSWR<Game[]>(`/api/seasons/${season-1}/games`);

    if (!data) {
        return (<div>Loading...</div>);
    }
    
    const games = data.filter(g => g.day == day-1);

    return (
        <Container>
            <DayTable season={season} day={day} games={games}/>
        </Container>
    );
}