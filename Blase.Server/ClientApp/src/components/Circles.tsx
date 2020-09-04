import { Text, TextProps, Tooltip } from "@chakra-ui/core";
import React from "react";

interface CirclesProps extends TextProps {
    amount: number;
    total: number;
    label: string;
}

export function Circles({amount, total, label, ...props}: CirclesProps) {
    let circlesStr = "";
    for (let i = 0; i < total; i++) {
        circlesStr += i < amount ? "\u25c9" : "\u25cb";
    }
    return <Tooltip label={label}>
        <Text as="span" fontSize="xl" lineHeight="1.5rem" {...props}>{circlesStr}</Text>
    </Tooltip>;
}