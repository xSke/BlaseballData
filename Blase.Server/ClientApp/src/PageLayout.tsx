import React from 'react';
import {Layout, Menu} from "antd";
import { Container, BareContainer } from './components/Container';
import { Link } from 'react-router-dom';

export function PageLayout(props: {children: React.ReactNode}) {
    return (
        <>
            <BareContainer>
                <Menu mode="horizontal" theme="light">
                    <Menu.Item><strong>Blase.Server</strong></Menu.Item>
                    <Menu.Item><Link to="/season/3">Season 3</Link></Menu.Item>
                    <Menu.Item><Link to="/season/4">Season 4</Link></Menu.Item>
                    <Menu.Item><Link to="/season/5">Season 5</Link></Menu.Item>
                </Menu>
            </BareContainer>

            <Layout>
                <Layout.Content>
                    {props.children}
                </Layout.Content>
                <Layout.Footer style={{ textAlign: 'center' }}>
                    Brought to you by the {"\u{1f36c}"} Kansas City Breath Mints: <em>"Fresh Breath, Here We Come."</em>
                </Layout.Footer>
            </Layout>
        </>
    )
}
