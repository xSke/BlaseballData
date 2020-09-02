import React from 'react';
import { Stack, VStack, Center, Text, Box } from '@chakra-ui/core';


export function PageLayout(props: {children: React.ReactNode}) {
    return (
        <Stack spacing={4}>
            <Box mt={4}>
                {props.children}
            </Box>

            <Text fontSize="sm" textAlign="center" mb={4} as="em" color="gray.700">
                Brought to you by the {"\u{1f36c}"} Kansas City Breath Mints: <em>"Fresh Breath, Here We Come."</em>
            </Text>
        </Stack>
    )
}
