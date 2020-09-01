import './GameDisplay.css';
import React from 'react';

import { GameUpdate } from "../data";

export function GameDisplay(props: { update: GameUpdate }) {
    const evt = props.update;

    return (
        <div>Hi</div> 
    )
}