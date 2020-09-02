import React, {Component} from 'react';
import {Route, Switch} from 'react-router';
import {PageLayout} from './PageLayout';
import {SWRConfig} from 'swr'
import {GamePage} from "./pages/GamePage";
// import {DayPage} from "./pages/DayPage";
import {SeasonPage} from "./pages/SeasonPage";

export default function App() {
    return (
        <SWRConfig value={{fetcher: (...args) => fetch(...args).then(res => res.json())}}>
            <PageLayout>
                <Switch>
                    <Route path='/game/:gameId' component={GamePage}/>
                    {/* <Route path='/season/:season/day/:day' component={DayPage}/> */}
                    <Route path='/season/:season' component={SeasonPage}/>
                </Switch>
            </PageLayout>
        </SWRConfig>
    );
}