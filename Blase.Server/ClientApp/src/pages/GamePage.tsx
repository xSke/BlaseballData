import React, { ReactNode } from 'react';
import useSWR from 'swr';
import { useParams } from 'react-router';
import moment from 'moment';

import { toEmoji, GameUpdatesResponse, GameUpdate, GamePayload } from "../data";
import { Loading } from '../components/Loading';
import { Container } from '../components/Container';
import { FixedEmoji } from "../components/FixedEmoji";
import { Heading, Box, Stack, StackDivider, Text, Tag, Grid, forwardRef, TextProps, BoxProps, TagProps, StackProps, Flex, Tooltip } from '@chakra-ui/core';

function Circles(props: {amount: number, total: number, label: string} & TextProps) {
    let out = "";
    for (let i = 0; i < props.total; i++) {
        out += i < props.amount ? "\u25c9" : "\u25cb";
        // out += i < props.amount ? "\u{26AB}" : "\u{26AA}";
    }
    return <Tooltip label={props.label}>
        <Text as="span" fontSize="xl" lineHeight="1.5rem" {...props}>{out.trimEnd()}</Text>
    </Tooltip>;
}

interface UpdateProps {
    evt: GamePayload
}

function Timestamp (props: { update: GameUpdate } & TextProps) {
    const time = moment(props.update.timestamp);
    return <Text color="gray.600" {...props}>
        <Text display={{base: "none", lg: "inline"}} as="span">{time.format("l")}</Text> {time.format("HH:mm:ss")}
    </Text>;
}
    

function Score(props: UpdateProps & TagProps) {
    return <Tag fontWeight="semibold" {...props}>{props.evt.awayScore} - {props.evt.homeScore}</Tag>;
}


function GameLog(props: UpdateProps & TextProps) {
    const highlightRegexes = [
        /hits a (Single|Double|Triple)/g,
        /hits a (solo|2-run|3-run) home run/g,
        /steals home/g,
        /tags up and scores/g,
        /1 scores/g,
        /(2s|3s) score/g
    ];

    let fontWeight = "normal";
    for (const regex of highlightRegexes) {
        if (regex.exec(props.evt.lastUpdate))
            fontWeight = "semibold";
    }

    return <Text fontWeight={fontWeight} {...props}>{props.evt.lastUpdate}</Text>;
}

function Batter(props: UpdateProps & TagProps & TextProps) {
    const { topOfInning, awayBatterName, awayTeamEmoji, homeBatterName, homeTeamEmoji } = props.evt;
    const batterEmoji = toEmoji(topOfInning ? awayTeamEmoji : homeTeamEmoji);
    const batterName = topOfInning ? awayBatterName : homeBatterName;

    if (batterName == "")
        return <Text as="span" {...props} />;

    return <Tag size="sm" pr={2} {...props}>
        <FixedEmoji fontSize="lg" w={4} mr={4}>{batterEmoji}</FixedEmoji>
        <Text {...props}>{batterName}</Text>
    </Tag> 
}

function Pitcher(props: UpdateProps & TextProps) {
    const { topOfInning, awayPitcherName, awayTeamEmoji, awayTeamNickname, homePitcherName, homeTeamEmoji, homeTeamNickname } = props.evt;
    const pitcherEmoji = toEmoji(topOfInning ? homeTeamEmoji : awayTeamEmoji);
    const pitcherName = topOfInning ? homePitcherName : awayPitcherName;
    const teamName = topOfInning ? homeTeamNickname : awayTeamNickname;

    if (pitcherName == "")
        return <Text as="span" {...props} />;

    return <Text {...props} fontSize="sm">
        <Text as="span" fontWeight="semibold">{pitcherName}</Text> pitching for the {teamName}
    </Text> 
}

const Balls = (props: UpdateProps & TextProps) => <Circles label="Balls" amount={props.evt.atBatBalls} total={3} {...props} />;
const Strikes = (props: UpdateProps & TextProps) => <Circles label="Strikes" amount={props.evt.atBatStrikes} total={2} {...props} />;
const Outs = (props: UpdateProps & TextProps) => <Circles label="Strikes" amount={props.evt.halfInningOuts} total={2} {...props} />;

function AtBatInfo(props: UpdateProps & BoxProps) {
    return <Stack direction="row" spacing={2} {...props}>
        <Balls evt={props.evt} />
        <Strikes evt={props.evt} />
        <Outs evt={props.evt} />
    </Stack> 
}

function Base(props: { base: number } & UpdateProps & TextProps) {
    const {basesOccupied, baseRunnerNames} = props.evt;

    const myIndex = basesOccupied.indexOf(props.base);
    if (myIndex > -1)
        return <Tooltip label={baseRunnerNames[myIndex]}>
            <Text as="span" {...props}>{"\u{25C6}"}</Text>
        </Tooltip>;
    else
        return <Text as="span" {...props}>{"\u{25C7}"}</Text>;
}

function BlaseRunners(props: UpdateProps & BoxProps) {
    return <Text as="span" fontSize="2xl" lineHeight="1.5rem" letterSpacing="-10px" mr={2}>
        <Base evt={props.evt} base={2} />
        <Base evt={props.evt} base={1} position="relative" top="-10px" />
        <Base evt={props.evt} base={0} />
    </Text>
}

function UpdateRow(props: { update: GameUpdate }) {
    const evt = props.update.payload;

    return <Grid
        autoFlow="row dense"
        columnGap={2} rowGap={2}
        templateColumns={{base: "auto auto 1fr auto", lg: "auto auto 1fr auto auto"}}
    >
        <GameLog evt={evt} gridColumn={{base: "1/span 3", lg: 3}} />
        <Timestamp update={props.update} gridColumn={{base: 4, lg: 1}} />
        <Score evt={evt} gridColumn={{base: 1, lg: 2}} />
        <Batter evt={evt} gridColumn={{base: 2, lg: 4}} />

        <Stack spacing={2} direction="row" justifySelf="end" gridColumn={{base: "3/span 2", lg: 6}}>
            <BlaseRunners evt={evt} />
            <AtBatInfo evt={evt} />
        </Stack>
    </Grid>;
}

function UpdatesTable(props: { updates: GameUpdate[] } & StackProps) {
    return <Stack spacing={2} {...props} divider={<StackDivider borderColor="gray.200" />}>
        {props.updates.map(update => <UpdateRow key={update.id} update={update} />)}
    </Stack>;
};

function HalfInningGroup(props: {updates: GameUpdate[]}) {
    const first = props.updates[0].payload;
    
    const halfString = first.topOfInning ? "Top" : "Bottom";
    return <Box>
        <Heading size="md">{halfString} of {first.inning+1}</Heading>
        <Pitcher evt={first} />
        
        <UpdatesTable mt={3} updates={props.updates} />
    </Box>;
}

interface UpdateGroup {
    topOfInning: boolean;
    inning: number;
    updates: GameUpdate[];
}

function GroupedByHalfInning(props: {updates: GameUpdate[] }) {
    const groups: UpdateGroup[] = [];

    let lastTop = false, lastInning = -1, lastGroup: UpdateGroup | null = null;
    for (const update of props.updates) {
        const { topOfInning, inning } = update.payload;

        if (lastTop != topOfInning || lastInning != inning) {
            const newGroup: UpdateGroup = { topOfInning, inning, updates: [] };

            // Last update of a group gets sent with the next's inning data, so put it on the *previous* instead
            if (groups.length > 0) {
                lastGroup!.updates.push(update);
            } else {
                newGroup.updates.push(update);
            }

            lastGroup = newGroup;
            groups.push(newGroup);
        } else {
            lastGroup?.updates.push(update);
        }

        lastTop = topOfInning;
        lastInning = inning;
    }

    return <Stack spacing={4}>
        {groups.map(({updates}) => <HalfInningGroup updates={updates} key={updates[0].id} />)}
    </Stack>
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
            <Heading>Season <strong>{first.season+1}</strong>, Day <strong>{first.day+1}</strong></Heading>
            <Heading mb={4} size="sm">{first.awayTeamName} <small>vs.</small> {first.homeTeamName}</Heading>

            <GroupedByHalfInning updates={data.updates} />
            {/* <UpdatesTable updates={data.updates} /> */}
        </Container>
    )

    // return (
    //     <Container>
    //         <Heading>Season <strong>{first.season}</strong>, Day <strong>{first.day + 1}</strong></Heading>
    //         <Heading mt={2} size="sm">{first.awayTeamName} <small>vs.</small> {first.homeTeamName}</Heading>


    //         <Grid my={4} templateColumns="auto auto auto 1fr auto auto auto auto" rowGap={4}>
    //             <Box fontWeight="semibold" d="contents">
    //                 <TableHeader>Time</TableHeader>
    //                 <TableHeader>Inn.</TableHeader>
    //                 <TableHeader>Score</TableHeader>
    //                 <TableHeader>Game Log</TableHeader>
    //                 <TableHeader>Batter</TableHeader>
    //                 <TableHeader>Balls</TableHeader>
    //                 <TableHeader>Strk.</TableHeader>
    //                 <TableHeader>Outs</TableHeader>
    //             </Box>


    //             {data.updates.map(row => <Row key={row.id} update={row} />)}
    //         </Grid>
    //         {/* <Stack mt={4} spacing={2} divider={<StackDivider borderColor="gray.200" />}>
    //             {data.updates.map(row => <Row key={row.id} update={row} />)}
    //         </Stack> */}
    //         {/* <h3>Season <strong>{first.season+1}</strong>, Day <strong>{first.day+1}</strong></h3>
    //         <h4>{toEmoji(first.awayTeamEmoji)} {first.awayTeamName.replace(first.awayTeamNickname, "")} <strong>{first.awayTeamNickname}</strong> vs. {toEmoji(first.homeTeamEmoji)} {first.homeTeamName.replace(first.homeTeamNickname, "")} <strong>{first.homeTeamNickname}</strong></h4>
    //         <br></br>
    //         <Table striped hover className="events-table">
    //             <thead>
    //                 <tr>
    //                     <th className="gp-row-time">Time</th>
    //                     <th className="gp-row-score">Score</th>
    //                     <th className="gp-row-inning">Inn.</th>
    //                     <th className="gp-row-gamelog">Game Log</th>
    //                     <th className="gp-row-pitcher">Pitcher</th>
    //                     <th className="gp-row-batter">Batter</th>
    //                     <th className="gp-row-balls">Balls</th>
    //                     <th className="gp-row-strikes">Strk.</th>
    //                     <th className="gp-row-outs">Outs</th>
    //                 </tr>
    //             </thead>
    //             <tbody>
    //                 {data.map((u, i) => (<GameUpdateRow key={i} update={u} />))}
    //             </tbody>
    //         </Table> */}
    //     </Container>
    // );
}
