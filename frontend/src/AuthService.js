import { browserHistory } from 'react-router'

export default class AuthService {
  constructor() {
    // binds login functions to keep this context
    this.randomString = this.randomString.bind(this);
    this.login = this.login.bind(this);
    this.guestLogin = this.guestLogin.bind(this);
  }

  randomString(length) {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    localStorage.setItem('csrf_token', result);
    return result;
  }

  login() {
    // Call the show method to display the widget.
    // var redirect_url = 'http://localhost:3000/loginredirect/'
    var redirect_url = 'https://dqwxe6cgpr1t5.cloudfront.net/loginredirect/'
    // Make sure to set AWS host routing to always redirect back to index.html

    var authUrl = 'https://www.dropbox.com/1/oauth2/authorize'+
    '?response_type=token'+
    '&client_id=9y0i3tf0m33n48r'+
    '&redirect_uri='+redirect_url+
    '&state='+this.randomString(10);

    window.location = authUrl;
  }

  guestLogin(){
    localStorage.setItem('id_token', 'guest');
    localStorage.setItem('uid', '123');
    browserHistory.replace('/journal');
  }

  loggedIn() {
    // Checks if there is a saved token and it's still valid
    return !!this.getToken();
  }

  setToken(idToken) {
    // Saves user token to local storage
    localStorage.setItem('id_token', idToken)
  }

  getToken() {
    // Retrieves the user token from local storage
    return localStorage.getItem('id_token')
  }

  logout() {
    // Clear user token and profile data from local storage
    localStorage.removeItem('id_token');
    browserHistory.replace('/')
  }
}