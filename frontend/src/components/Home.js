import React, { Component } from 'react';
import fullpage from '../icons/fullpage.gif';

class Home extends Component {
  render() {
    return (
      <div className='homeContainer'>

      <div className='homeContent'>
        <h1>Journal Light</h1> <br/>
        <img className='homeImage' src={fullpage} /> <br/>
        <h4>Making it easier to catch up on your journal and fill in the blanks whether it was last week or the beginning of your life</h4>
      </div>

      <div className='loginArea'>
        <h3><a className='loginButton' onClick={this.props.route.auth.login}>Login via Dropbox</a></h3> 
        <h3><a className='loginButton' onClick={this.props.route.auth.guestLogin}>Login via Guest</a></h3> 
      </div>
      </div>
    );
  }
}

export default Home;


// <div className='homeContentContainer'>

//   <div className='leftHomeContent'>

//   <p> Benefits: <br />
//   - Catching up on journaling is easier than ever<br />
//   - Instantly record flashbacks of forgotten memories<br />
//   - Use the context and reminders to recover lost memories<br />
//   - Simple management, organization, and backup of your photos and videos <br />
//   - Beautiful timeline layout of all your memories: journal entries, photos, and videos <br />
//   - GIF support! Plus GIF previews for videos <br />
//   - Quick search and access to any point in your life <br />
//   - Companion AI to help you find what to say<br />
//   - Have a journal that you can pass down to your family and children <br />
//   </p>
//   </div>

//   <div className='rightHomeContent'>

    
//   </div>
  
// </div>

//      <h3><a href={this.props.route.auth.login()}>Login via Dropbox</a></h3> <br/>
// <Button type="button" class="btn btn-primary" onClick={this.props.route.auth.login()} >Login via Dropbox</Button>