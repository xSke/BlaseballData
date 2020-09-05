import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router';

import {Loading} from '../components/Loading';
import {Container} from '../components/Container';
import {Alert, AlertIcon, Checkbox, Flex, Heading, Spinner, Stack, Text} from '@chakra-ui/core';
import {useGameUpdates} from "../blaseball/api";
import {GameUpdateList} from "../components/GameUpdateList";
import {GameUpdate} from "../blaseball/update";
import {cache} from "swr";

interface UpdatesListFetchingProps {
    isLoading: boolean,
    updates: GameUpdate[],
    order: "asc" | "desc";
    filterImportant: boolean;
    autoRefresh: boolean;
}

function UpdatesListFetching(props: UpdatesListFetchingProps) {
    return (
        <Flex mt={2} direction="column">
            {props.autoRefresh && <Text mt={2} as="em" textAlign="center" color="gray.600"><Spinner mr={2} size="xs" /> Live-updating...</Text>}
            <GameUpdateList updates={props.updates} updateOrder={props.order} filterImportant={props.filterImportant}/>
            {props.isLoading && <Loading />}
        </Flex>
    );
}

export function GamePage() {
    const {gameId} = useParams();

    // Never reuse caches across multiple games, then it feels slower because instant rerender...
    useEffect(() => cache.clear(), [gameId]);
    
    const [reverse, setReverse] = useState(false);
    const [autoUpdate, setAutoUpdate] = useState(false);
    const [onlyImportant, setOnlyImportant] = useState(false);
    
    if (autoUpdate && !reverse)
        setReverse(true);

    const {updates, error, isLoading} = useGameUpdates(gameId, autoUpdate);
    if (error) return <Alert><AlertIcon/>{error.toString()}</Alert>;

    const last = updates[updates.length - 1]?.payload;
    
    // Stop autoupdating once the game is over
    if (last?.gameComplete && autoUpdate)
        setAutoUpdate(false);

    return (
        <Container>
            {last && <>
                <Heading>Season {last.season + 1}, Day {last.day + 1}</Heading>
                <Heading size="sm">{last.awayTeamName} <small>vs.</small> {last.homeTeamName}</Heading>
            </>}

            <Stack direction="row" spacing={4} mt={2}>
                <Checkbox isChecked={reverse} onChange={e => setReverse(e.target.checked)}>
                    Latest first
                </Checkbox>

                <Checkbox isChecked={onlyImportant} onChange={e => setOnlyImportant(e.target.checked)}>
                    Only important
                </Checkbox>

                {last && !last.gameComplete && <Checkbox isChecked={autoUpdate} onChange={e => setAutoUpdate(e.target.checked)}>
                    Auto-update
                </Checkbox>}
            </Stack>

            <UpdatesListFetching
                updates={updates}
                isLoading={isLoading}
                order={reverse ? "desc" : "asc"}
                filterImportant={onlyImportant}
                autoRefresh={autoUpdate}
            />
        </Container>
    );
}
