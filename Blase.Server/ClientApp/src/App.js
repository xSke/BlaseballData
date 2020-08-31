import React, {Component} from 'react';
import {Route, Switch} from 'react-router';
import {Layout} from './components/Layout';
import {Home} from './components/Home';
import {GamePage} from './components/GamePage';
import {SWRConfig} from 'swr'
import './custom.css'
import {SeasonPage} from "./components/SeasonPage";
import {DayPage} from "./components/DayPage";

export default class App extends Component {
    static displayName = App.name;

    render() {
        return (
            <SWRConfig value={{fetcher: (...args) => fetch(...args).then(res => res.json())}}>
                <Layout>
                    <Switch>
                        <Route exact path='/' component={Home}/>
                        <Route path='/game/:gameId' component={GamePage}/>
                        <Route path='/season/:season/day/:day' component={DayPage}/>
                        <Route path='/season/:season' component={SeasonPage}/>
                    </Switch>
                </Layout>
            </SWRConfig>
        );
    }
}
