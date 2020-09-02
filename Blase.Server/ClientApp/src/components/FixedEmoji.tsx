import React, { ReactNode } from "react";
import { Box } from "@chakra-ui/core";

export function FixedEmoji(props: {children: ReactNode}) {
    return <Box textAlign="center" d="inline-block" w={6}>{props.children}</Box>;
}