import {Link as RouterLink} from "react-router-dom";
import React from "react";
import {
    Box,
    BoxProps,
    Button,
    ButtonProps,
    Flex,
    FlexProps,
    Grid,
    Heading,
    Link,
    LinkProps,
    Stack,
    StackDivider,
    Tag,
    Text,
    Tooltip,
    TextProps
} from "@chakra-ui/core";
import {FixedEmoji} from "./FixedEmoji";
import {Game} from "../blaseball/game";
import {getWeather} from "../blaseball/weather";
import {getTeam, TeamInfo} from "../blaseball/team";
import {toEmoji} from "../blaseball/util";
import {getOutcomes} from "../blaseball/outcome";
import dayjs from "dayjs";

interface GameProps {
    game: Game;
}

function Weather({game, ...props}: GameProps & BoxProps) {
    const weather = getWeather(game.lastUpdate);
    if (!weather)
        return <>{game.lastUpdate.weather}</>;
    
    return (
        <Tooltip label={weather.name}>
            <Box {...props}>
                <FixedEmoji>{weather.emoji}</FixedEmoji>
            </Box>
        </Tooltip>
    );
}

function Score({game, fixed, ...props}: { fixed: boolean } & GameProps & LinkProps) {
    const evt = game.lastUpdate;
    
    let color = "green";
    if (game.lastUpdate.gameComplete)
        color = "gray";
    if (game.lastUpdate.shame)
        color = "purple";

    return (
        <Link as={RouterLink} to={`/game/${game.id}`} {...props}>
            <Tag colorScheme={color} fontWeight="semibold" justifyContent="center" w={fixed ? 16 : undefined}>
                {`${evt.awayScore} - ${evt.homeScore}`}
            </Tag>
        </Link>
    )
}

function Inning({game, ...props}: GameProps & TextProps) {
    const arrow = game.lastUpdate.topOfInning ? "\u25B2" : "\u25BC";
    return <Text as="span" fontSize={{base: "xs", md: "sm"}} fontWeight="semibold" width={8} textAlign="right" lineHeight="1.5rem" mr={1} {...props}>
        {game.lastUpdate.inning+1} {arrow}
    </Text>
}

function Duration({game, ...props}: GameProps & ButtonProps) {
    let content = "LIVE";
    if (game.start && game.end) {
        const startMoment = dayjs(game.start);
        const endMoment = dayjs(game.end);
        const diff = endMoment.diff(startMoment);

        content = dayjs()
            .hour(0).minute(0).second(0)
            .millisecond(diff).format("H:mm:ss");
    }

    return <Button variant="ghost" w={16} size="xs" as={RouterLink} to={`/game/${game.id}`} {...props}>
        {content}
    </Button>;
}

function Team({team, otherTeam, ...props}: {team: TeamInfo, otherTeam: TeamInfo} & FlexProps) {
    const weight = team.score > otherTeam.score ? "semibold" : "normal";
    return (
        <Flex fontWeight={weight} {...props}>
            <FixedEmoji>{toEmoji(team.emoji)}</FixedEmoji>
            <Box w={1}/>
            <Text as="span">{team.nickname}</Text>
        </Flex>
    );
}

const AwayTeam = ({game, ...props}: GameProps & FlexProps) => 
    <Team team={getTeam(game.lastUpdate, "away")} otherTeam={getTeam(game.lastUpdate, "home")} {...props} />

const HomeTeam = ({game, ...props}: GameProps & FlexProps) =>
    <Team team={getTeam(game.lastUpdate, "home")} otherTeam={getTeam(game.lastUpdate, "away")} {...props} />

function Events({game, ...props}: GameProps & BoxProps) {
    const outcomes = getOutcomes(game.lastUpdate);
    if (!outcomes)
        return <></>;
    
    return <Stack direction="row" spacing={2} as="span" {...props}>
        {outcomes.map((outcome, idx) => (
            <Tooltip label={outcome.text} key={idx}>
                <Tag size="md">{outcome.emoji} {outcome.name}</Tag>
            </Tooltip>
        ))}
    </Stack>
}

const GameItem = React.memo(function GameItem({game}: { game: Game }) {
    return <Grid
        autoFlow="row dense"
        columnGap={2}
        templateColumns={{base: "1fr auto auto auto", md: "auto auto auto auto auto 1fr auto auto auto auto"}}
    >
        <AwayTeam game={game} gridColumn={{base: 1, md: 3}} direction="row"/>
        <Score game={game} fixed={true} gridColumn={{base: 4, md: 2}}/>
        <Weather game={game} gridColumn={{base: 3, md: 8}} justifySelf="end"/>

        <HomeTeam game={game} gridColumn={{base: 1, md: 5}} direction={{base: "row", md: "row-reverse"}}/>
        <Events game={game} gridColumn={{base: 2, md: 7}}/>
        <Duration game={game} gridColumn={{base: 4, md: 9}}/>
        <Inning game={game} gridColumn={{base: 3, md: 1}} justifySelf="end"/>

        <Box display={{base: "none", md: "inline"}} gridColumn={{md: 4}}><small>vs.</small></Box>
    </Grid>
}, (oldProps, newProps) => {
    return oldProps.game.id == newProps.game.id && oldProps.game.lastUpdateTime == newProps.game.lastUpdateTime;
});

interface DayTableProps {
    games: Game[];
    season: number;
    day: number;
}

export const DayTable = function DayTable(props: DayTableProps) {
    return (
        <Box mt={4} mb={8}>
            <Heading size="md">Season <strong>{props.season}</strong>, Day <strong>{props.day}</strong></Heading>

            <Stack my={4} spacing={2} divider={<StackDivider borderColor="gray.200"/>}>
                {props.games.map(game => <GameItem key={game.id} game={game}/>)}
            </Stack>
        </Box>
    )
};