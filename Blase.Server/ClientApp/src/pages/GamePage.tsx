import React, { ReactNode } from 'react';
import useSWR from 'swr';
import { useParams } from 'react-router';
import moment from 'moment';

import './GamePage.css';

import { toEmoji, GameUpdatesResponse, GameUpdate } from "../data";
import { Loading } from '../components/Loading';
import { Container } from '../components/Container';
import { FixedEmoji } from "../components/FixedEmoji";
import { Heading, Box, Stack, StackDivider, Text, Tag, Grid } from '@chakra-ui/core';

// function makeDots(count: number, total: number) {
//     let out = "";
//     for (let i = 0; i < total; i++) {
//         out += i < count ? "●" : "○"
//     }
//     return out.trimEnd();
// }

// function GameUpdateRow({ update }: { update: GameUpdateWrapper }) {
//     const momentTimestamp = moment(update.timestamp);

//     const evt = update.payload;

//     const currentPitcher = evt.topOfInning ? evt.homePitcherName : evt.awayPitcherName;
//     let currentBatter = evt.topOfInning ? evt.awayBatterName : evt.homeBatterName;
//     if (currentBatter == "")
//         currentBatter = null;

//     const pitcherEmoji = evt.topOfInning ? evt.homeTeamEmoji : evt.awayTeamEmoji
//     const batterEmoji = evt.topOfInning ? evt.awayTeamEmoji : evt.homeTeamEmoji;

//     return (<tr>
//         <td className="gp-row-time">{momentTimestamp.format("ll LTS")}</td>
//         <td className="gp-row-score">{`${toEmoji(evt.awayTeamEmoji)} ${evt.awayScore} - ${evt.homeScore} ${toEmoji(evt.homeTeamEmoji)} `}</td>
//         <td className="gp-row-inning">{`${evt.inning + 1} ${evt.topOfInning ? "\u25B2" : "\u25BC"}`}</td>
//         <td className="gp-row-gamelog">{update.payload.lastUpdate}</td>
//         <td className="gp-row-pitcher">{`${toEmoji(pitcherEmoji)} ${currentPitcher}`}</td>
//         <td className="gp-row-batter">{`${currentBatter ? toEmoji(batterEmoji) : ""} ${currentBatter ?? ""}`}</td>
//         <td className="gp-row-balls gp-dots">{makeDots(evt.atBatBalls, 3)}</td>
//         <td className="gp-row-strikes gp-dots">{makeDots(evt.atBatStrikes, 2)}</td>
//         <td className="gp-row-outs gp-dots">{makeDots(evt.halfInningOuts, 2)}</td>
//     </tr>);
// }

function Circles(props: { amount: number, total: number }) {
    let out = "";
    for (let i = 0; i < props.total; i++) {
        out += i < props.amount ? "●" : "○"
    }
    return <Text px={3} as="span" fontSize="32px" lineHeight="1.5rem" fontFamily="monospace">{out.trimEnd()}</Text>;
}

function Row(props: { update: GameUpdate }) {
    const evt = props.update.payload;

    const pitcherTeam = evt.topOfInning ? "home" : "away";
    const batterTeam = evt.topOfInning ? "away" : "home";

    const pitcherEmoji = toEmoji(evt[pitcherTeam + "TeamEmoji"]);
    const pitcherName = evt[`${pitcherTeam}PitcherName`];
    const batterEmoji = toEmoji(evt[batterTeam + "TeamEmoji"]);
    const batterName = evt[batterTeam + "BatterName"];

    const timestamp = moment(props.update.timestamp).format("l HH:mm:ss");
    const inning = `${evt.inning + 1} ${evt.topOfInning ? "\u25B2" : "\u25BC"}`;

    // return (
    //     <Stack direction="row" spacing={4}>
    //         <Text>{timestamp}</Text>
    //         <Tag>{evt.awayScore} - {evt.homeScore}</Tag>
    //         <Text>{inning}</Text>
    //         <Text flex="1">{evt.lastUpdate}</Text>
    //         <Tag>{pitcherEmoji} {pitcherName}</Tag>
    //         <Tag>{batterEmoji} {batterName}</Tag>

    //         <Circles amount={evt.atBatBalls} total={3} />
    //         <Circles amount={evt.atBatStrikes} total={2} />
    //         <Circles amount={evt.halfInningOuts} total={2} />
    //     </Stack>
    // )
    return <>
        <Text color="gray.600" px={3}>{timestamp}</Text>
        <Text color="gray.600" px={3}>{inning}</Text>
        <Box px={3}><Tag>{evt.awayScore} - {evt.homeScore}</Tag></Box>
        <Text px={3} flex="1">{evt.lastUpdate}</Text>
        <Box px={3} textAlign="right">
            {batterName != "" && <Tag><FixedEmoji>{batterEmoji}</FixedEmoji>  {batterName}</Tag>}
        </Box>

        <Circles amount={evt.atBatBalls} total={3} />
        <Circles amount={evt.atBatStrikes} total={2} />
        <Circles amount={evt.halfInningOuts} total={2} />
    </>;
}

function TableHeader(props: {children: ReactNode}) {
    return <Text px={3} pb={2} borderBottomColor="gray.600" borderBottomWidth="2px">{props.children}</Text>
}

export function GamePage() {
    const { gameId } = useParams();

    const { data, error } = useSWR<GameUpdatesResponse>(`/api/games/${gameId}/updates`);

    if (!data) {
        return <Loading />;
    }

    const first = data.updates[0].payload;
    return (
        <Container>
            <Heading>Season <strong>{first.season}</strong>, Day <strong>{first.day + 1}</strong></Heading>
            <Heading mt={2} size="sm">{first.awayTeamName} <small>vs.</small> {first.homeTeamName}</Heading>


            <Grid my={4} templateColumns="auto auto auto 1fr auto auto auto auto" rowGap={4}>
                <Box fontWeight="semibold" d="contents">
                    <TableHeader>Time</TableHeader>
                    <TableHeader>Inn.</TableHeader>
                    <TableHeader>Score</TableHeader>
                    <TableHeader>Game Log</TableHeader>
                    <TableHeader>Batter</TableHeader>
                    <TableHeader>Balls</TableHeader>
                    <TableHeader>Strk.</TableHeader>
                    <TableHeader>Outs</TableHeader>
                </Box>


                {data.updates.map(row => <Row key={row.id} update={row} />)}
            </Grid>
            {/* <Stack mt={4} spacing={2} divider={<StackDivider borderColor="gray.200" />}>
                {data.updates.map(row => <Row key={row.id} update={row} />)}
            </Stack> */}
            {/* <h3>Season <strong>{first.season+1}</strong>, Day <strong>{first.day+1}</strong></h3>
            <h4>{toEmoji(first.awayTeamEmoji)} {first.awayTeamName.replace(first.awayTeamNickname, "")} <strong>{first.awayTeamNickname}</strong> vs. {toEmoji(first.homeTeamEmoji)} {first.homeTeamName.replace(first.homeTeamNickname, "")} <strong>{first.homeTeamNickname}</strong></h4>
            <br></br>
            <Table striped hover className="events-table">
                <thead>
                    <tr>
                        <th className="gp-row-time">Time</th>
                        <th className="gp-row-score">Score</th>
                        <th className="gp-row-inning">Inn.</th>
                        <th className="gp-row-gamelog">Game Log</th>
                        <th className="gp-row-pitcher">Pitcher</th>
                        <th className="gp-row-batter">Batter</th>
                        <th className="gp-row-balls">Balls</th>
                        <th className="gp-row-strikes">Strk.</th>
                        <th className="gp-row-outs">Outs</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((u, i) => (<GameUpdateRow key={i} update={u} />))}
                </tbody>
            </Table> */}
        </Container>
    );
}
