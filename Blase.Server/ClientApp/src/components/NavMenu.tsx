import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Text, Spacer, Stack, Button, Box } from '@chakra-ui/core';
import { Container } from './Container';

export function NavMenu() {
  return (
    <Box py={4} bg="gray.100">
      <Container>
        <Stack direction="row" spacing={4}>
          <Text fontSize="lg" fontWeight="semibold">Blaseball Viewer</Text>

          <Spacer />

          <Button variant="link" as={Link} to="/season/3">Season 3</Button>
          <Button variant="link" as={Link} to="/season/4">Season 4</Button>
          <Button variant="link" as={Link} to="/season/5">Season 5</Button>
          <Button variant="link" as={Link} to="/season/6">Season 6</Button>
        </Stack>
      </Container>
    </Box>
  )
}