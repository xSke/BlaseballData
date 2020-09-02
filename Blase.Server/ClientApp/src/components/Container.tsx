import React from 'react';
import { Box, useTheme } from '@chakra-ui/core';

export const Container = ({ children, ...props }: any) => {
    const theme = useTheme()
  
    return (
      <Box {...props} mx="auto" px={4} w="100%" maxW={['full', 'full', ...theme.breakpoints.slice(1)]}>
        {children}
      </Box>
    )
  }