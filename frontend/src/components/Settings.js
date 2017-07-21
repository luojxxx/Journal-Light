import React, { Component } from 'react';
import * as ChatAppActions from "../actions/ChatAppActions";
import { Modal, Button, Form, FormControl } from 'react-bootstrap';
import Toggle from 'react-toggle';
import Recaptcha from 'react-recaptcha';

class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
          emailEnteredMsg: '',
          quotaLimitReachedMsg: '',
          aiToggleState: false,
          settingEmailVal: '',
          settingPasswordVal: ''
        }

        this.settingRecaptchaKey = '';

        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleEmailSubmit = this.handleEmailSubmit.bind(this);
        this.handlePasswordSubmit = this.handlePasswordSubmit.bind(this);

        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.handleAiToggle = this.handleAiToggle.bind(this);

        this.checkAPI = this.checkAPI.bind(this);

        this.recaptchaCallback = this.recaptchaCallback.bind(this);
        this.recaptchaVerifyCallback = this.recaptchaVerifyCallback.bind(this);
    }

    componentDidMount() {
      this.setState({ 
        settingEmailVal: localStorage.getItem('email'),
        settingPasswordVal: localStorage.getItem('responsePassword')
      })

      if (localStorage.getItem('aiToggle') === null) {
        localStorage.setItem('aiToggle', false);
      }

      this.setState({aiToggleState: localStorage.getItem('aiToggle') === 'true' });

      if (localStorage.getItem('aiToggle') === 'true') {
        this.checkAPI();
      }

    }

    handleEmailChange(evt) {
      this.setState({settingEmailVal: evt.target.value});
    }

    handlePasswordChange(evt) {
      this.setState({settingPasswordVal: evt.target.value});
    }

    handleEmailSubmit(evt) {
      evt.preventDefault();
      // localStorage.setItem('email', this.settingEmailVal); // avoiding saving email on client side for now
      this.setState({
        emailEnteredMsg:'Thank you! Your password is on its way, it may take a minute.'});

      ChatAppActions.authenticateEmail(this.state.settingEmailVal, localStorage.getItem('uid'), this.settingRecaptchaKey);
    }

    handlePasswordSubmit(evt) {
      evt.preventDefault();
      localStorage.setItem('responsePassword', this.state.settingPasswordVal);
    }

    handleCloseModal(evt) {
      this.setState({emailEnteredMsg: ''});
      this.props.handleCloseModal();
    }

    handleAiToggle(evt) {
      if (this.state.aiToggleState) {
        this.setState({aiToggleState: false})
        localStorage.setItem('aiToggle', false);
      } else {
        this.setState({aiToggleState: true})
        localStorage.setItem('aiToggle', true);

        this.checkAPI();
      }
    }

    checkAPI(){
      return fetch('https://murmuring-thicket-60925.herokuapp.com/api/v2/response', {
          method: 'POST',
          headers: {
            // Authorization: 'password',
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            {
                'entryValue':'',
                'priorResponse':'',
                'uid': localStorage.getItem('uid'),
                'password': localStorage.getItem('responsePassword'),
                'quotaCheck': 'True',
            }),

        }).then( (response) => {
          return response.json();

        }).then( (data) => {
          return data.quota;

        }).then( (quota) => {
          if (quota <= 0) {
            localStorage.setItem('aiToggle', false);
            this.setState({quotaLimitReachedMsg: 'Limit to demo account has been reached'});
          }
        })

    }

    recaptchaCallback(){
      // console.log('done')
    }

    recaptchaVerifyCallback(response){
      this.settingRecaptchaKey = response;
    }

  render() {
    return (
      <div>
      <Modal show={this.props.show} onHide={this.handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Settings</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            In order to enable the journal AI, you need to be logged in and we need to send you an email with a password. We do not sell your email or
            use your email outside of sending this password, it is not stored either. 
            After you have received your password, copy and paste it below, hit submit, and then click the toggle. 
            Resubmitting your email just changes the password.
            <br /><br />
            For demo purposes, you get a quota of 10 queries. This quota is linked to your dropbox sign-in.
            And the journal AI does not store your journal entries, it's processed by a computer and a response is sent back.
            We are 100% dedicated to the privacy and ownership of your data.
            Note: The AI responds if you're typing in an entry and have 15 seconds of typing inactivity. English support only.
            <br /><br />

            <div className='flexboxGap'>
              <div>
              Step One verify humanity: 
              </div>
              <Recaptcha
                  sitekey="6LdIOCIUAAAAAGLq5u51-370giiWBXaE9AULCSfI"
                  render="explicit"
                  onloadCallback={this.recaptchaCallback}
                  verifyCallback={this.recaptchaVerifyCallback}
                />
            </div><br/>

            <div className='flexboxGap'>
              <div>
              Step Two enter email:        
              </div>
              <div>
                <Form inline>
                 <FormControl
                             type="text"
                             value={this.state.settingEmailVal}
                             onChange={this.handleEmailChange}
                           />
                 <Button type="submit" onClick={ (evt) => this.handleEmailSubmit(evt) }> Submit </Button>
                 </Form>
              </div>
            </div>
            <p>{this.state.emailEnteredMsg}</p><br/>

            <div className='flexboxGap'>
              <div>
              Step Three paste password from email: 
              </div>
              <div>
                <Form inline>
                <FormControl
                             type="password"
                             value={this.state.settingPasswordVal} 
                             onChange={this.handlePasswordChange}
                           />
                 <Button type="submit" onClick={ (evt) => this.handlePasswordSubmit(evt) }> Submit </Button>
                 </Form>
              </div>
            </div><br/><br/>

            <div className='flexboxGap'>
              <div>
              Step Four enable Journal AI: 
              </div>
              <div><label>
                <Toggle
                 checked={this.state.aiToggleState}
                  onChange={this.handleAiToggle} />
             </label></div>
            </div>
            <p>{this.state.quotaLimitReachedMsg}</p>

          </Modal.Body>

          <Modal.Footer>
            <Button onClick={ this.handleCloseModal }>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }

}

export default Settings;
