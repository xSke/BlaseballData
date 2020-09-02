import { ReactNode } from "react";
import React from 'react';
import { Card } from "antd";

export function BareContainer(props: { children: ReactNode }) {
    return <div style={{ maxWidth: "1160px", margin: "auto", padding: "0 1rem" }}>
        {props.children}
    </div>
}

export function Container(props: { children: ReactNode }) {
    return <div style={{ maxWidth: "1160px", margin: "1rem auto", padding: "0 1rem" }}>
        <Card>
            {props.children}
        </Card>
    </div>
}