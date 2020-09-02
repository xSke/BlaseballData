import React from "react";
import { Text, Spinner, VStack } from "@chakra-ui/core";

export function Loading() {
    return (
        <VStack my={8}>
            <Spinner />
            <Text>Loading...</Text>
        </VStack>
    );
}
