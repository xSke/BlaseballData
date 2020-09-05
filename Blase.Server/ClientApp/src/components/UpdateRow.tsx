import {GamePayload, GameUpdate, isImportant} from "../blaseball/update";
import {BoxProps, Grid, GridProps, Stack, Tag, TagProps, Text, TextProps, Tooltip} from "@chakra-ui/core";
import {getBattingTeam} from "../blaseball/team";
import {FixedEmoji} from "./FixedEmoji";
import {toEmoji} from "../blaseball/util";
import {Circles} from "./Circles";
import React from "react";
import dayjs from "dayjs";

interface WrappedUpdateProps {
    update: GameUpdate
}

interface UpdateProps {
    evt: GamePayload
}

function Timestamp({update, ...props}: WrappedUpdateProps & TextProps) {
    const updateTime = dayjs(update.timestamp);
    const time = updateTime.format("mm:ss");

    return <Text as="span" color="gray.600" {...props}>{time}</Text>
}

function Score({evt, ...props}: UpdateProps & TagProps) {
    const color = evt.shame ? "purple" : "gray";
    return <Tag fontWeight="semibold" colorScheme={color} {...props}>
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

    if (!team.batterName)
        // "hide" when there's no batter
        return <Text as="span" {...props} />;

    return <Tag size="sm" pr={2} {...props}>
        <FixedEmoji w={4} mx={1}>{toEmoji(team.emoji)}</FixedEmoji>
        <Text {...props}>{team.batterName}</Text>
    </Tag>
}

const Balls = ({evt, ...props}: UpdateProps & TextProps) =>
    <Circles label="Balls" amount={evt.atBatBalls} total={3} {...props} />;

const Strikes = ({evt, ...props}: UpdateProps & TextProps) =>
    <Circles label="Strikes" amount={evt.atBatStrikes} total={2} {...props} />;

const Outs = ({evt, ...props}: UpdateProps & TextProps) =>
    <Circles label="Outs" amount={evt.halfInningOuts} total={2} {...props} />;

function AtBatInfo({evt, ...props}: UpdateProps & BoxProps) {
    return <Stack direction="row" spacing={2} {...props}>
        <Balls evt={evt}/>
        <Strikes evt={evt}/>
        <Outs evt={evt}/>
    </Stack>;
}

function Base({base, evt, ...props}: { base: number } & UpdateProps & TextProps) {
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
    return <Text as="span" fontSize="2xl" lineHeight="1.5rem" letterSpacing="-10px" mr={2} {...props}>
        <Base evt={evt} base={2} position="relative" top="3px"/>
        <Base evt={evt} base={1} position="relative" top="-7px"/>
        <Base evt={evt} base={0} position="relative" top="3px"/>
    </Text>
}

export const UpdateRow = React.memo(function UpdateRow({update, ...props}: WrappedUpdateProps & GridProps) {
    const evt = update.payload;

    return <Grid
        autoFlow="row dense"
        columnGap={2} rowGap={2}
        templateColumns={{base: "auto auto 1fr auto", lg: "auto auto 1fr auto auto"}}
        py={2}
        borderBottom="1px solid"
        borderBottomColor="gray.200"
        {...props}
    >
        <GameLog evt={evt} gridColumn={{base: "1/span 3", lg: 3}}/>
        <Timestamp update={update} gridColumn={{base: 4, lg: 1}}/>
        <Score evt={evt} gridColumn={{base: 1, lg: 2}}/>
        <Batter evt={evt} gridColumn={{base: 2, lg: 4}}/>

        <Stack spacing={2} direction="row" justifySelf="end" gridColumn={{base: "3/span 2", lg: 6}}>
            <BlaseRunners evt={evt}/>
            <AtBatInfo evt={evt}/>
        </Stack>
    </Grid>;
}, (oldProps, newProps) => {
    return oldProps.update.id == newProps.update.id
});
