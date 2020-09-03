import React, { ReactNode } from "react";
import { Box, BoxProps } from "@chakra-ui/core";

export function FixedEmoji(props: {children: ReactNode} & BoxProps) {
    return <Box textAlign="center" d="inline-block" w={6} {...props}>{props.children}</Box>;
}