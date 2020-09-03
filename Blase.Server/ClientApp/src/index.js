import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from "react-router-dom";
import App from "./App";

import { ChakraProvider, theme } from "@chakra-ui/core"
import { merge } from "@chakra-ui/utils"

const customTheme = merge(theme, {
    components: {
        Heading: {
            baseStyle: { fontWeight: "semibold" },
            defaultProps: { size: "lg" }
        }
    }
});

const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');
const rootElement = document.getElementById('root');


ReactDOM.render(
    <BrowserRouter basename={baseUrl}>
        <ChakraProvider resetCSS theme={customTheme}>
            <App />
        </ChakraProvider>
    </BrowserRouter>,
    rootElement
);