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
const hideWrap = (hide: boolean, elem: ReactNode) => <div style={{display: hide ? "none" : "block"}}>{elem}</div>

export function GameUpdateList({updates, updateOrder, filterImportant, ...props}: GameUpdateListProps) {
    if (updateOrder == "desc")
        updates.reverse();

    const elements: ReactNode[] = [];

    let lastPayload = null, lastHeader = null, anyVisibleRowsThisInning = false;
    for (const update of updates) {
        const payload = update.payload;
        
        const shouldHide = filterImportant && !isImportant(payload);
        const row = hideWrap(shouldHide, <UpdateRow key={update.id} update={update} />);

        if (!lastPayload || lastPayload.inning != payload.inning || lastPayload.topOfInning != payload.topOfInning) {
            // Hide the previous header if the entire inning had no visible rows
            if (lastHeader != null && !anyVisibleRowsThisInning) {
                const idx = elements.indexOf(lastHeader);
                elements[idx] = hideWrap(true, lastHeader);
            }
            
            // New inning, add header
            const header = <InningHeader key={update.id + "_header"} evt={payload} pt={4}/>;
            if (updateOrder == "desc") {
                // Inning properly started *before* this row, so put the header before the *previous* entry
                const last = elements.pop();
                elements.push(header, last, row);
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
        {elements}
    </Flex>;
}