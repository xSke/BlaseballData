import React from "react";

import {Text} from "@chakra-ui/core";
import {Container} from "../components/Container";

export function Home() {
    return (
        <Container>
            <Text>
                Hi! {"\u{1F44B}"} Select a season up top to view the games list.
            </Text>
        </Container>
    )
}