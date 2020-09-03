import {useParams} from "react-router";
import React, { useState, ReactNode } from 'react';
import useSWR from "swr";
import {Game, GamesResponse, Day} from "../data";

import {DayTable} from "../components/DayTable";
import { Loading } from "../components/Loading";
import { Container } from "../components/Container";
import { Alert, AlertIcon, Heading } from "@chakra-ui/core";

export function SeasonPage() {
    let {season} = useParams();
    season = parseInt(season);
    
    const {data, error} = useSWR<GamesResponse>(`/api/games?season=${season-1}&dayCount=999`);
    if (error) {
        return <Alert status="error"><AlertIcon />{error}</Alert>
    }

    const days = data?.days ?? [];
    const elements = days.reverse().map(({games, day}) => {
        return <DayTable key={day} season={season} day={day + 1} games={games}/>;
    });;

    return (
        <Container my={4}>
            <Heading>Games in Season {season}</Heading>

            {data ? elements : <Loading />}
        </Container>
    )
}