import React, { Component } from 'react';
import fullpage from '../icons/partialpage.gif';

class Home extends Component {
  render() {
    return (
      <div className='homeContainer'>
        <h3>Journal Light</h3> <br/>
        
      <div className='homeContent'>
        <hr id='homeRuler' />
        <div className='loginTextArea'>
          <h2 className='noTopMargin'>Making it easier to view and archive your memories</h2>
        </div>

        <div className='loginArea'>
        <div id='featureList'>
          <ul>
            <li style={{fontWeight: 'bold', color:'tomato'}}>Giant Timeline View of your Life</li>
            <li style={{fontWeight: 'bold', color:'#FFB347'}}>Photos, Gifs, Videos, and Video previews</li>
            <li style={{fontWeight: 'bold', color:'#FFCB06'}}>Add new entries instantly anywhere</li>
            <li style={{fontWeight: 'bold', color:'#52B280'}}>Entries don't require full date</li>
            <li style={{fontWeight: 'bold', color:'#668DAA'}}>Dropbox backup</li>
            <li style={{fontWeight: 'bold', color:'#CFA3D8'}}>Companion AI</li>
          </ul>
        </div>
          <div id='buttonArea'>
            <h3 className='loginButtonWrap'><a className='loginButton' onClick={this.props.route.auth.login}>Login via Dropbox</a></h3> 
            <h3 className='loginButtonWrap'><a className='loginButton' onClick={this.props.route.auth.guestLogin}>Login via Guest</a></h3>
          </div>
        </div>

        <img className='homeImage' src={fullpage} /> <br/>
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