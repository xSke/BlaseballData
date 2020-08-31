import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { GamePage } from './components/GamePage';
import { SWRConfig } from 'swr'
import './custom.css'

export default class App extends Component {
  static displayName = App.name;

  render () {
    return (
      <SWRConfig value={{fetcher: (...args) => fetch(...args).then(res => res.json())}}>
        <Layout>
          <Route exact path='/' component={Home} />
          <Route path='/games/:gameId' component={GamePage} />
        </Layout>
      </SWRConfig>
    );
  }
}
