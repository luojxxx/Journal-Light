import React, { Component } from 'react';
import { browserHistory } from 'react-router'

class LoginRedirect extends Component {
    constructor(props) {
        super(props);
        this.state={}
        this.replaceAt = this.replaceAt.bind(this);
        this.getURLParameter = this.getURLParameter.bind(this);
    }
    
    replaceAt(string, index, character) {
        return string.substr(0, index) + character + string.substr(index+character.length);
    }

    getURLParameter(name, url) {
      return decodeURIComponent((new RegExp('[?|&]' + name + '=([^&;]+?)(&|#|;|$)').exec(url) || [null, ''])[1].replace(/\+/g, '%20')) || null;
    }

    componentWillMount() {
        var url = this.replaceAt(this.props.location.hash, 0, '?');

        var csrf_token = this.getURLParameter('state', url);
        if (csrf_token !== localStorage.getItem('csrf_token')) {
            return 'bad CSRF token';
        } else {
            localStorage.removeItem('csrf_token');
        }

        var access_token = this.getURLParameter('access_token', url);
        var user_id = this.getURLParameter('uid', url);
        // console.log(access_token)
        // console.log(user_id)
        this.props.route.auth.setToken(access_token);
        // ChatAppActions.setUsesID(user_id); // doesn't persist if you're logged in and you refresh page
        localStorage.setItem('uid', user_id);
        browserHistory.replace('/journal');
    }

    render() {

      return (
        <div>
        <p> Redirecting </p>
        </div>
      );
    }
}

export default LoginRedirect;
