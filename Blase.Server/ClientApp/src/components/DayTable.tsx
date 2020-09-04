import moment from "moment";
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
    Tooltip
} from "@chakra-ui/core";
import {FixedEmoji} from "./FixedEmoji";
import {Game} from "../blaseball/game";
import {getWeather} from "../blaseball/weather";
import {getTeam, TeamInfo} from "../blaseball/team";
import {toEmoji} from "../blaseball/util";
import {getOutcomes} from "../blaseball/outcome";

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

function Duration({game, ...props}: GameProps & ButtonProps) {
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
        {outcomes.map(outcome => (
            <Tooltip label={outcome.text}>
                <Tag size="md">{outcome.emoji} {outcome.name}</Tag>
            </Tooltip>
        ))}
    </Stack>
}

function GameItem({game}: { game: Game }) {
    return <Grid
        autoFlow="row dense"
        columnGap={2}
        templateColumns={{base: "1fr auto auto", sm: "auto auto auto auto 1fr auto auto auto auto"}}
    >
        <AwayTeam game={game} gridColumn={{base: 1, sm: 2}} direction="row"/>
        <Weather game={game} gridColumn={{base: 2, sm: 7}} justifySelf="end"/>
        <Score game={game} fixed={true} gridColumn={{base: 3, sm: 1}}/>

        <HomeTeam game={game} gridColumn={{base: 1, sm: 4}} direction={{base: "row", sm: "row-reverse"}}/>
        <Events game={game} gridColumn={{base: 2, sm: 6}}/>
        <Duration game={game} gridColumn={{base: 3, sm: 8}}/>

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

            <Stack my={4} spacing={2} divider={<StackDivider borderColor="gray.200"/>}>
                {props.games.map(game => <GameItem key={game.id} game={game}/>)}
            </Stack>
        </Box>
    )
}