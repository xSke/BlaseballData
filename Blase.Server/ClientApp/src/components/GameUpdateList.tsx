import {GamePayload, GameUpdate, isImportant} from "../blaseball/update";
import {Box, BoxProps, Heading, Flex, StackProps, Text, TextProps} from "@chakra-ui/core";
import React, {ReactNode} from "react";
import {UpdateRow} from "./UpdateRow";
import {getPitchingTeam} from "../blaseball/team";

interface UpdateProps {
    evt: GamePayload
}

function Pitcher({evt, ...props}: UpdateProps & TextProps) {
    const team = getPitchingTeam(evt);

    if (!team.pitcherName)
        return <Text as="span" {...props} />;

    return <Text {...props} fontSize="sm">
        <Text as="span" fontWeight="semibold">{team.pitcherName}</Text> pitching for the {team.name}
    </Text>
}

export const InningHeader = React.memo(function InningHeader({evt, ...props}: UpdateProps & BoxProps) {
    const arrow = evt.topOfInning ? "\u25B2" : "\u25BC";
    const halfString = evt.topOfInning ? "Top" : "Bottom";
    return <Box {...props}>
        <Heading size="md">{arrow} {halfString} of {evt.inning+1}</Heading>
        <Pitcher evt={evt} />
    </Box>;
});

interface GameUpdateListProps extends StackProps {
    updates: GameUpdate[];
    updateOrder: "asc" | "desc";
    filterImportant: boolean;
}

// Need these wrappers due to UpdateRow memoization, setting display on there breaks & just excluding is bad for perf
const HideWrapper = (props: {hide?: boolean, children: ReactNode}) => {
    return <div style={{display: props.hide ? "none" : "block"}}>{props.children}</div>;
};

type Element = { type: "row", update: GameUpdate, hide: boolean } | { type: "heading", update: GameUpdate, inning: number, top: boolean, hide: boolean };

export function GameUpdateList({updates, updateOrder, filterImportant, ...props}: GameUpdateListProps) {
    if (updateOrder == "desc")
        updates.reverse();

    const elements: Element[] = [];

    let lastPayload = null, lastHeader = null, anyVisibleRowsThisInning = false;
    for (const update of updates) {
        const payload = update.payload;
        
        const shouldHide = filterImportant && !isImportant(payload);
        const row: Element = {type: "row", update, hide: shouldHide};
        
        if (!lastPayload || lastPayload.inning != payload.inning || lastPayload.topOfInning != payload.topOfInning) {
            // Hide the previous header if the entire inning had no visible rows
            if (lastHeader != null && !anyVisibleRowsThisInning) {
                lastHeader.hide = true;
            }
            
            // New inning, add header
            const header: Element = { type: "heading", inning: payload.inning, top: payload.topOfInning, hide: false, update };
            if (updateOrder == "desc") {
                // Inning properly started *before* this row, so put the header before the *previous* entry
                const last = elements.pop();
                
                elements.push(header);
                if (last) elements.push(last);
                elements.push(row);
            } else if (lastPayload != null) {
                // Inning properly starts *after* this row (but only if this isn't the *actual first* entry
                elements.push(row, header);
            } else {
                // Very first item, header at the top
                elements.push(header, row);
            }
            
            anyVisibleRowsThisInning = false;
            lastHeader = header;
        } else {
            elements.push(row);
        }
        
        if (!shouldHide)
            anyVisibleRowsThisInning = true;

        lastPayload = payload;
    }

    return <Flex direction="column" {...props}>
        {elements.map(e => {
            if (e.type === "row")
                return <HideWrapper key={e.update.id} hide={e.hide}><UpdateRow update={e.update} /></HideWrapper>;
            else
                return <HideWrapper key={e.update.id + "_header"} hide={e.hide}><InningHeader evt={e.update.payload} pt={4}/></HideWrapper>
        })}
    </Flex>;
}