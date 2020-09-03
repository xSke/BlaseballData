import React from 'react';
import { Stack, VStack, Center, Text, Box } from '@chakra-ui/core';
import { NavMenu } from './components/NavMenu';
import { Container } from './components/Container';


export function PageLayout(props: {children: React.ReactNode}) {
    return (
        <Stack spacing={4}>
            <NavMenu />
            
            <Box>
                {props.children}
            </Box>

            <Text fontSize="sm" textAlign="center" mb={4} as="em" color="gray.700">
                Brought to you by the {"\u{1f36c}"} Kansas City Breath Mints: <em>"Fresh Breath, Here We Come."</em>
            </Text>
        </Stack>
    )
}
