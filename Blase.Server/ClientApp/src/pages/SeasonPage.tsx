import {useParams} from "react-router";
import React, { useState, ReactNode } from 'react';
import useSWR from "swr";
import {Game, GamesResponse, Day} from "../data";

import './SeasonPage.css';
import {DayTable} from "../components/DayTable";
import { Loading } from "../components/Loading";
import { Container } from "../components/Container";
import { Alert, AlertIcon, Heading } from "@chakra-ui/core";

export function SeasonPage() {
    let {season} = useParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageSize, setCurrentPageSize] = useState(10);

    season = parseInt(season);
    

    const {data, error} = useSWR<GamesResponse>(`/api/games?season=${season-1}`);
    if (error) {
        return <Alert status="error"><AlertIcon />{error}</Alert>
    }

    let days: Day[] = [];
    if (data) {
        days = data.days.slice((currentPage-1) * currentPageSize, (currentPage * currentPageSize));
    }

    const elements = days.map(({games, day}) => {
        return <DayTable key={day} season={season} day={day + 1} games={games}/>;
    });;


    const onChange = (page: number, pageSize?: number) => {
        setCurrentPage(page);
        if (pageSize)
            setCurrentPageSize(pageSize);
    }

    return (
        <Container my={4}>
            <Heading>Games in Season {season}</Heading>

            {data ? elements : <Loading />}

            {/* <Pagination onChange={onChange} pageSize={currentPageSize} current={currentPage} total={data?.days?.length ?? 0} hideOnSinglePage={true} /> */}
        </Container>
    )
}