import { Game, toEmoji, weather } from "../data";
import moment from "moment";
import { Link as RouterLink } from "react-router-dom";
import React, { ReactNode } from "react";
import { useBreakpointValue, Divider, Link, Text, Heading, Stack, StackDivider, Flex, Tooltip, Box, Tag, Button, Spacer, Center } from "@chakra-ui/core";
import { FixedEmoji } from "./FixedEmoji";

interface DayTableProps {
    games: Game[];
    season: number;
    day: number;
}

function Weather({game}: {game: Game}) {
    const info = weather[game.lastUpdate.weather];
    if (info) {
        return (
            <Tooltip label={info.name}>
                <Box>
                    <FixedEmoji>{info.emoji}</FixedEmoji>
                </Box>
            </Tooltip>
        );
    }
    return <>{game.lastUpdate.weather}</>
}

function Score({game, fixed}: {game: Game, fixed: boolean}) {
    let color = "green";

    if (game.lastUpdate.gameComplete)
        color = "red";

    if (game.lastUpdate.shame)
        color = "purple";

    return (
        <Link as={RouterLink} to={`/game/${game.id}`}>
            <Tag justifyContent="center" w={fixed ? 16 : null}>
                {`${game.lastUpdate.awayScore} - ${game.lastUpdate.homeScore}`}
            </Tag>
        </Link>
    )
}

function Duration({game}: {game: Game}) {
    let content = "LIVE";
    if (game.end) {
        const startMoment = moment(game.start);
        const endMoment = moment(game.end);
        const diff = endMoment.diff(startMoment);

        content = moment.utc(diff).format("H:mm:ss");
    }

    return <Button variant="ghost" w={16} size="xs" as={RouterLink} to={`/game/${game.id}`}>
        {content}
    </Button>;
}

function Team(type: string, other: string) {
    return ({game, align}: {game: Game, align: "left" | "right"}) => {
        const evt = game.lastUpdate as dynamic;

        const weight = (evt[`${type}Score`] as number) > (evt[`${other}Score`] as number) ? "semibold" : "normal";
        return (
            <Text as="span" fontWeight={weight}>
                {align == "left" ? <FixedEmoji>{toEmoji(evt[`${type}TeamEmoji`] as string)}</FixedEmoji> : null}{" "}
                {evt[`${type}TeamNickname`] as string}
                {" "}{align == "right" ? <FixedEmoji>{toEmoji(evt[`${type}TeamEmoji`] as string)}</FixedEmoji> : null}
            </Text>
        )
    }
}

const AwayTeam = Team("away", "home");
const HomeTeam = Team("home", "away");

interface GameOutcomeEvent {
    emoji: string;
    name: string;
}

function Events({game}: {game: Game}) {
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
                const elem = <Tooltip label={outcomeText}>
                    <Tag>{type.emoji} {type.name}</Tag>
                </Tooltip>;

                elems.push(elem);
            }
        }
    }

    if (elems)
        return <Box as="span">{elems}</Box>;
    else
        return <></>;
}

function ViewLink({game}: {game: Game}) {
    return <Button variant="outline" size="xs" as={RouterLink} to={`/game/${game.id}`}>View</Button>;
}

function GameItemDualLine({game}: {game: Game}) {
    return (
        <Stack flex={1} spacing={1}>
            <Stack direction="row" spacing={2}>
                <AwayTeam game={game} align="left" />
                <Spacer />
                <Weather game={game} />
                <Score game={game} fixed={true} />
            </Stack>

            <Stack direction="row" spacing={2}>
                <HomeTeam game={game} align="left" />
                <Spacer />
                <Events game={game} />
                <Duration game={game} />
            </Stack>
        </Stack>
    )
}

function GameItemInline({game}: {game: Game}) {
    return (
        <Flex>
            <Stack direction="row" spacing={2} >
                <AwayTeam game={game} align="left" />
                <Box><small>vs.</small></Box>
                <HomeTeam game={game} align="right" />
            </Stack>

            <Spacer />

            <Stack direction="row" spacing={2}>
                <Events game={game} />
                <Divider orientation="vertical" />
                <Weather game={game} />
                <Divider orientation="vertical" />
                <Duration game={game} />
                <Divider orientation="vertical" />
                <Score game={game} fixed={true} />
            </Stack>
        </Flex>
    )
}

function GameItem({game}: {game: Game}) {
    const renderInline = useBreakpointValue({base: false, sm: true});
    return renderInline ? <GameItemInline game={game} /> : <GameItemDualLine game={game} />;
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