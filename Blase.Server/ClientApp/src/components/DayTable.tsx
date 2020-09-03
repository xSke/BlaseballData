import { Game, toEmoji, weather } from "../data";
import moment from "moment";
import { Link as RouterLink } from "react-router-dom";
import React, { ReactNode } from "react";
import { useBreakpointValue, Divider, Link, Text, Heading, Stack, StackDivider, Flex, Tooltip, Box, Tag, Button, Spacer, Center, Grid, TooltipProps, ButtonProps, LinkProps, FlexProps } from "@chakra-ui/core";
import { FixedEmoji } from "./FixedEmoji";

function Weather({game, ...props}: {game: Game} & BoxProps) {
    const info = weather[game.lastUpdate.weather];
    if (info) {
        return (
            <Tooltip label={info.name}>
                <Box {...props}>
                    <FixedEmoji>{info.emoji}</FixedEmoji>
                </Box>
            </Tooltip>
        );
    }
    return <>{game.lastUpdate.weather}</>
}

function Score({game, fixed, ...props}: {game: Game, fixed: boolean} & LinkProps) {
    let color = "green";

    if (game.lastUpdate.gameComplete)
        color = "red";

    if (game.lastUpdate.shame)
        color = "purple";

    return (
        <Link as={RouterLink} to={`/game/${game.id}`} {...props}>
            <Tag fontWeight="semibold" justifyContent="center" w={fixed ? 16 : null}>
                {`${game.lastUpdate.awayScore} - ${game.lastUpdate.homeScore}`}
            </Tag>
        </Link>
    )
}

function Duration({game, ...props}: {game: Game} & ButtonProps) {
    let content = "LIVE";
    if (game.end) {
        const startMoment = moment(game.start);
        const endMoment = moment(game.end);
        const diff = endMoment.diff(startMoment);

        content = moment.utc(diff).format("H:mm:ss");
    }

    return <Button variant="ghost" w={16} size="xs" as={RouterLink} to={`/game/${game.id}`} {...props}>
        {content}
    </Button>;
}

function Team(type: string, other: string) {
    return (props: {game: Game} & FlexProps) => {
        const evt = props.game.lastUpdate as dynamic;

        const weight = (evt[`${type}Score`] as number) > (evt[`${other}Score`] as number) ? "semibold" : "normal";
        return (
            <Flex fontWeight={weight} {...props}>
                <FixedEmoji>{toEmoji(evt[`${type}TeamEmoji`] as string)}</FixedEmoji>
                <Box w={1} />
                <Text as="span">{evt[`${type}TeamNickname`] as string}</Text>
            </Flex>
        )
    }
}

const AwayTeam = Team("away", "home");
const HomeTeam = Team("home", "away");

interface GameOutcomeEvent {
    emoji: string;
    name: string;
}

function Events({game, ...props}: {game: Game} & TooltipProps & BoxProps) {
    let types: Record<string, GameOutcomeEvent> = {
        "reverb": { emoji: "\u{1F30A}", name: "Reverb" },
        "feedback": { emoji: "\u{1F3A4}", name: "Feedback" },
        "umpire": { emoji: "\u{1F525}", name: "Incineration" },
        "peanut": { emoji: "\u{1F95C}", name: "Peanut" },
    }

    const elems = [];
    for (const outcomeText of game.lastUpdate.outcomes) {
        for (const searchKey of Object.keys(types)) {
            const type = types[searchKey];

            if (outcomeText.toLowerCase().indexOf(searchKey) > -1) {
                const elem = <Tooltip label={outcomeText} {...props}>
                    <Tag size="md">{type.emoji} {type.name}</Tag>
                </Tooltip>;

                elems.push(elem);
            }
        }
    }

    if (elems)
        return <Box as="span" {...props}>{elems}</Box>;
    else
        return <></>;
}

function GameItem({game}: {game: Game}) {
    return <Grid
        autoFlow="row dense"
        columnGap={2}
        templateColumns={{base: "1fr auto auto", sm: "auto auto auto auto 1fr auto auto auto auto"}}
    >
        <AwayTeam game={game} gridColumn={{base: 1, sm: 2}} direction="row" />
        <Weather game={game} gridColumn={{base: 2, sm: 7}} justifySelf="end" />
        <Score game={game} fixed={true} gridColumn={{base: 3, sm: 1}} />

        <HomeTeam game={game} gridColumn={{base: 1, sm: 4}} direction={{base: "row", sm: "row-reverse"}} />
        <Events game={game} gridColumn={{base: 2, sm: 6}} />
        <Duration game={game} gridColumn={{base: 3, sm: 8}} />

        <Box display={{base: "none", sm: "inline"}} gridColumn={{sm: 3}}><small>vs.</small></Box>
    </Grid>
}

interface DayTableProps {
    games: Game[];
    season: number;
    day: number;
}

export function DayTable(props: DayTableProps) {
    return (
        <Box mt={4} mb={8}>
            <Heading size="md">Season <strong>{props.season}</strong>, Day <strong>{props.day}</strong></Heading>

            <Stack my={4} spacing={2} divider={<StackDivider borderColor="gray.200" />}>
                {props.games.map(game => <GameItem key={game.id} game={game} />)}
            </Stack>
        </Box>
    )
}