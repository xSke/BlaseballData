import React, { ReactNode } from 'react';
import useSWR from 'swr';
import { useParams } from 'react-router';
import moment from 'moment';

import { Circles } from '../components/Circles';
import { Loading } from '../components/Loading';
import { Container } from '../components/Container';
import { FixedEmoji } from "../components/FixedEmoji";
import { Heading, Box, Stack, StackDivider, Text, Tag, Grid, TextProps, BoxProps, TagProps, StackProps, Flex, Tooltip } from '@chakra-ui/core';
import { isImportant, GameUpdate, GamePayload } from '../blaseball/update';
import {getBattingTeam, getPitchingTeam} from '../blaseball/team';
import {GameUpdatesResponse} from "../blaseball/api";
import {toEmoji} from "../blaseball/util";

interface WrappedUpdateProps {
    update: GameUpdate
}

interface UpdateProps {
    evt: GamePayload
}

function Timestamp ({update, ...props}: WrappedUpdateProps & TextProps) {
    const updateTime = moment(update.timestamp);
    const time = updateTime.format("mm:ss");

    return <Text as="span" color="gray.600" {...props}>{time}</Text>
}

function Score({evt, ...props}: UpdateProps & TagProps) {
    return <Tag fontWeight="semibold" {...props}>
        {evt.awayScore} - {evt.homeScore}
    </Tag>;
}

function GameLog({evt, ...props}: UpdateProps & TextProps) {
    const fontWeight = isImportant(evt) ? "semibold" : "normal";

    return <Text fontWeight={fontWeight} {...props}>
        {evt.lastUpdate}
    </Text>;
}

function Batter({evt, ...props}: UpdateProps & TagProps & TextProps) {
    const team = getBattingTeam(evt);

    if (team.batterName == "")
        // "hide" when there's no batter
        return <Text as="span" {...props} />;
        
    return <Tag size="sm" pr={2} {...props}>
        <FixedEmoji w={4} mr={2}>{toEmoji(team.emoji)}</FixedEmoji>
        <Text {...props}>{team.batterName}</Text>
    </Tag> 
}

function Pitcher({evt, ...props}: UpdateProps & TextProps) {
    const team = getPitchingTeam(evt);

    if (team.pitcherName == "")
        return <Text as="span" {...props} />;

    return <Text {...props} fontSize="sm">
        <Text as="span" fontWeight="semibold">{team.pitcherName}</Text> pitching for the {team.name}
    </Text> 
}

const Balls = ({evt, ...props}: UpdateProps & TextProps) => 
    <Circles label="Balls" amount={evt.atBatBalls} total={3} {...props} />;

const Strikes = ({evt, ...props}: UpdateProps & TextProps) => 
    <Circles label="Strikes" amount={evt.atBatStrikes} total={2} {...props} />;

const Outs = ({evt, ...props}: UpdateProps & TextProps) =>
    <Circles label="Outs" amount={evt.halfInningOuts} total={2} {...props} />;

function AtBatInfo({evt, ...props}: UpdateProps & BoxProps) {
    return <Stack direction="row" spacing={2} {...props}>
        <Balls evt={evt} />
        <Strikes evt={evt} />
        <Outs evt={evt} />
    </Stack>;
}

function Base({ base, evt, ...props }: {base: number} & UpdateProps & TextProps) {
    const {basesOccupied, baseRunnerNames} = evt;

    const myIndex = basesOccupied.indexOf(base);
    if (myIndex > -1) {
        // Older logs (pre-S4) don't have defined blaserunner identities
        if (baseRunnerNames) {
            return (
                <Tooltip label={baseRunnerNames[myIndex]}>
                    <Text as="span" {...props}>{"\u{25C6}"}</Text>
                </Tooltip>
            );
        } else {
            return <Text as="span" {...props}>{"\u{25C6}"}</Text>;
        }
    } else {
        return <Text as="span" {...props}>{"\u{25C7}"}</Text>;
    }
}

function BlaseRunners({evt, ...props}: UpdateProps & BoxProps) {
    return <Text as="span" fontSize="2xl" lineHeight="1.5rem" letterSpacing="-10px" mr={2}>
        <Base evt={evt} base={2} />
        <Base evt={evt} base={1} position="relative" top="-10px" />
        <Base evt={evt} base={0} />
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

interface UpdatesProps {
    updates: GameUpdate[];
}

function UpdatesTable({ updates, ...props }: UpdatesProps & StackProps) {
    return <Stack spacing={2} {...props} divider={<StackDivider borderColor="gray.200" />}>
        {updates.map(update => <UpdateRow key={update.id} update={update} />)}
    </Stack>;
};

function HalfInningGroup({ updates, ...props }: UpdatesProps & BoxProps) {
    const first = updates[0].payload;
    
    const halfString = first.topOfInning ? "Top" : "Bottom";
    return <Box {...props}>
        <Heading size="md">{halfString} of {first.inning+1}</Heading>
        <Pitcher evt={first} />
        
        <UpdatesTable mt={3} updates={updates} />
    </Box>;
}

interface UpdateGroup {
    topOfInning: boolean;
    inning: number;
    updates: GameUpdate[];
}

function GroupedByHalfInning({updates, ...props}: UpdatesProps & StackProps) {
    const groups: UpdateGroup[] = [];

    let lastTop = false, lastInning = -1, lastGroup: UpdateGroup | null = null;
    for (const update of updates) {
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

    return <Stack spacing={4} {...props}>
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
        </Container>
    );
}
