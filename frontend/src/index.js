import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import App from './components/App';
import Settings from './components/Settings';
import About from './components/About';
import Home from './components/Home';
import MainApp from './components/MainApp';
import LoginRedirect from './components/LoginRedirect';

import AuthService from './AuthService'
const auth = new AuthService();

const requireAuth = (nextState, replace) => {
  if (!auth.loggedIn()) {
    replace({ pathname: '/' })
  }
}

const htmlroot = document.getElementById('root')

ReactDOM.render(
    <Router history={browserHistory}>
        <Route path='/' component={App}>
        <IndexRoute component={Home} auth={auth}></IndexRoute>

        <Route path='loginredirect' name='loginredirect' component={LoginRedirect} auth={auth}></Route>
        <Route path='about' name='about' component={About}></Route>

        <Route path='journal' component={MainApp} onEnter={requireAuth} auth={auth}></Route>
        <Route path='settings' name='settings' component={Settings}></Route>
        </Route>
    </Router>,
  htmlroot
);
