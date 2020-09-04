import {useParams} from "react-router";
import React from 'react';
import {useSWRInfinite} from "swr";

import {DayTable} from "../components/DayTable";
import {Loading} from "../components/Loading";
import {Container} from "../components/Container";
import {Alert, AlertIcon, Heading} from "@chakra-ui/core";
import {GamesResponse} from "../blaseball/api";
import InfiniteScroll from "react-infinite-scroll-component";

export function SeasonPage() {
    const pageSize = 10;
    
    let {season} = useParams();
    season = parseInt(season);
    
    function getNextPage(pageIndex: number, previousPageData: GamesResponse | null) {
        let startDay = 999;
        if (previousPageData) {
            const {days} = previousPageData;
            const lastDay = days[days.length-1];
            startDay = lastDay.day - 1;
        }
        
        if (startDay < 0)
            // at the end! :)
            return null;

        return `/api/games?season=${season-1}&day=${startDay}&dayCount=${pageSize}&reverse=true`
    }
    
    const { data, size, setSize, error } = useSWRInfinite<GamesResponse>(getNextPage);
    if (error) return <Alert status="error"><AlertIcon/>{error}</Alert>;
    if (!data) return <Loading />;
    
    const days = [];
    for (const page of data)
        days.push(...page.days);
    
    const lastDay = days[days.length-1].day;
    
    return (
        <Container my={4}>
            <Heading>Games in Season {season}</Heading>

            <InfiniteScroll
                next={() => setSize(size+1)} 
                hasMore={lastDay > 0}
                loader={<Loading />} 
                dataLength={days.length}
                scrollThreshold="500px"
            >
                {days.map(({games, season, day}) => {
                    return <DayTable key={day} season={season} day={day + 1} games={games}/>;
                })}
            </InfiniteScroll>
        </Container>
    )
}