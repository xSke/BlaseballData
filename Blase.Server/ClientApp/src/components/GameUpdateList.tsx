import {GamePayload, GameUpdate, isImportant} from "../blaseball/update";
import {Box, BoxProps, Heading, Flex, StackProps, Text, TextProps} from "@chakra-ui/core";
import React, {ReactNode, useEffect, useMemo} from "react";
import {UpdateRow} from "./UpdateRow";
import {getPitchingTeam} from "../blaseball/team";
import {List, WindowScroller, AutoSizer, CellMeasurerCache, CellMeasurer, ListRowRenderer} from "react-virtualized";
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
    return <Box {...props} pt={6}>
        <Heading size="md">{arrow} {halfString} of {evt.inning+1}</Heading>
        <Pitcher evt={evt} />
    </Box>;
});

interface GameUpdateListProps extends StackProps {
    updates: GameUpdate[];
    updateOrder: "asc" | "desc";
    filterImportant: boolean;
}

type Element = { type: "row", update: GameUpdate } | { type: "heading", update: GameUpdate, inning: number, top: boolean };

function groupByInning(updates: GameUpdate[], direction: "asc" | "desc", filterImportant: boolean): Element[] {
    const elements: Element[] = [];

    let lastPayload = null;
    for (const update of updates) {
        const payload = update.payload;
        const row: Element = {type: "row", update};
        
        if (filterImportant && !isImportant(payload))
            continue;

        if (!lastPayload || lastPayload.inning != payload.inning || lastPayload.topOfInning != payload.topOfInning) {
            // New inning, add header
            const header: Element = { type: "heading", inning: payload.inning, top: payload.topOfInning, update };
            elements.push(header);
        }
        
        // Reorder accounting for the early pitching updates we get
        if (direction == "asc") {
            if (payload.lastUpdate.endsWith("batting.") && elements.length > 2) {
                const [heading, prevUpdate] = elements.splice(-2);
                elements.push(prevUpdate, heading);
            }
        } else {
            if (elements.length > 3) {
                const [prevPrevUpdate, prevUpdate, heading] = elements.splice(-3);
                if (heading.type === "heading" && prevPrevUpdate.update.payload.lastUpdate.endsWith("batting.")) {
                    elements.push(prevPrevUpdate, heading, prevUpdate);
                } else {
                    elements.push(prevPrevUpdate, prevUpdate, heading);
                }
            }
        }
        
        // Add the row
        elements.push(row);

        lastPayload = payload;
    }

    return elements;
}

export function GameUpdateList({updates, updateOrder, filterImportant, ...props}: GameUpdateListProps) {
    if (updateOrder == "desc")
        updates.reverse();
    
    const elements = useMemo(() => groupByInning(updates, updateOrder, filterImportant), [updates, updateOrder, filterImportant]);
    
    const cache = useMemo(() => new CellMeasurerCache({
        defaultHeight: 40,
        minHeight: 40,
        fixedWidth: true
    }), [updateOrder, filterImportant, updates.length])
    
    const rowRenderer: ListRowRenderer = ({key, parent, index, isScrolling, isVisible, style}) => {
        const elem = elements[index];
        
        let content;
        if (elem.type === "row")
            content = <div key={key} style={style}><UpdateRow update={elem.update} /></div>;
        else
            content = <div key={key} style={style}><InningHeader evt={elem.update.payload} pt={4}/></div>;
        
        return (
            <CellMeasurer
                cache={cache}
                key={key}
                parent={parent}
                rowIndex={index}
            >
                {content}
            </CellMeasurer>
        );
    };

    return (
            <WindowScroller>
                {({height, isScrolling, scrollTop}) => (
                    <AutoSizer disableHeight>
                        {({width}) => (
                            <List
                                autoHeight
                                width={width}
                                height={height}
                                isScrolling={isScrolling}
                                rowCount={elements.length}
                                estimatedRowSize={40}
                                overscanRowCount={25}
                                rowHeight={cache.rowHeight}
                                rowRenderer={rowRenderer}
                                deferredMeasurementCache={cache}
                                scrollTop={scrollTop}
                            />
                        )}
                    </AutoSizer>
                )}
            </WindowScroller>
    );
}