import React from "react";
import { Spin } from "antd";

export function Loading() {
    return <div style={{textAlign: "center", margin: "2rem"}}><Spin /></div>;
}
