import React from 'react';
import { Link } from 'react-router';
// import logo from '../icons/favicon.ico';
import Header from './Header';
import Window from './Window';
import Settings from './Settings';

import * as ChatAppActions from "../actions/ChatAppActions";
import ChatAppStore from "../stores/ChatAppStore";

import {TweenLite} from 'gsap';
import $ from 'jquery';

class MainApp extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
          dataById: {},
          dataOrder: [],
          modifiedDataList: {}, 
          newDataList: [],
          deleteDataList: [],
          timelineMapping: [],
          foundDataById: {},
          foundDataOrder: [],
          modalState: false,
          saveerror: '',
          browsing: true,
          currentlyViewing: 20160921214501,
          newEntryDividerLength:0,
        };
        this.searchTerms = '';
        this.settingEmailVal = '';
        this.settingPasswordVal = '';
        this.updateSizing = this.updateSizing.bind(this);
        this.getEntries = this.getEntries.bind(this);
        this.userSave = this.userSave.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
    }

    componentDidMount() {
      var eleSelector = $('#appDiv');
      TweenLite.from(eleSelector, 3, {opacity: "0"} );

      this.updateSizing();
      window.addEventListener("resize", this.updateSizing );

      // window.onbeforeunload = (e) => {
      //   ChatAppActions.userSave(this.state);
      // }

     }

    componentWillMount() {
      ChatAppStore.on("change", this.getEntries);
      ChatAppActions.initializeLoadData();
     }

    componentWillUnmount() {
      ChatAppStore.removeListener("change", this.getEntries );
      window.removeEventListener("resize", this.updateSizing );
    }

    updateSizing() {
      var windowWidth = $('.windowStyle').width();

      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext("2d");
      ctx.font = "18px san serif";
      let length = ctx.measureText('-').width;

      let dashLength = windowWidth/length;
      let newEntryDividerLength = parseInt( dashLength * 0.3, 10);

      // console.log(newEntryDividerLength)
      this.setState({newEntryDividerLength: newEntryDividerLength});

    }

    getEntries() {
      var chatAppData = ChatAppStore.getAll();

      this.setState({
        dataById: chatAppData.dataById,
        dataOrder: chatAppData.dataOrder,
        modifiedDataList: chatAppData.modifiedDataList,
        newDataList: chatAppData.newDataList,
        deleteDataList: chatAppData.deleteDataList,
        timelineMapping: chatAppData.timelineMapping,
        focusing: chatAppData.focusing,
        focusedDataId: chatAppData.focusedDataId,
        focusedContent: chatAppData.focusedContent,
        foundDataById: chatAppData.dataById,
        foundDataOrder: chatAppData.dataOrder,
        saveerror: chatAppData.saveerror
      });
    }

    userSave() {
      ChatAppActions.userSave(this.state);
    }

    handleSearchChange(evt) {
      var searchTerms = evt.target.value;
      this.searchTerms = searchTerms;
      if (searchTerms === '') {
        this.setState({foundDataById: this.state.dataById, foundDataOrder: this.state.dataOrder});
        return null;
      }
      var keywords = [];

      const re = /"(.*?)"/;
      while (searchTerms.search(re) !== -1) {
        keywords.push(re.exec(searchTerms)[1]);
        searchTerms = searchTerms.replace(re, '');
      }
      var remainingSearchTerms = searchTerms.split(' ');
      var singleSearchTerms = remainingSearchTerms.filter( (val) => {return val !== ''} )

      keywords = keywords.concat(singleSearchTerms);

      var dataById = this.state.dataById;
      var dataOrder = this.state.dataOrder;

      var foundDataById = {};
      var foundDataOrder = [];

      for (let i=0; i<dataOrder.length; i++) {
        let dataId = dataOrder[i];
        let data=dataById[dataId];
        let dataContent = data.content.toLowerCase();

        let keywordBools = keywords.map( (keyword) => {
          if (dataContent.includes(keyword.toLowerCase()) === true ) {
            return true;
          } else {
            return false;
          }
        });

        var allTrue = keywordBools.every(val => {return val === true});

        if (allTrue === true) {
          foundDataById[dataId] = data;
          foundDataOrder.push(dataId);
        }

      }

      this.setState({foundDataById: foundDataById, foundDataOrder: foundDataOrder});
    }

    handleOpenModal() {
      this.setState({ modalState: true });
    }

    handleCloseModal() {
      this.setState({ modalState: false });
    }

    render() {
        return (
          <div className='appContainer' id='appDiv'>

          <Settings show={this.state.modalState} handleCloseModal={this.handleCloseModal} />

          <div className="header">
            <ul className="nav nav-pills pull-right">
              {/*<li><Link to='about'>About</Link></li>*/}
              <li><Link to='journal' onClick={this.userSave}>Save</Link></li>
              <li><Link to='journal' onClick={this.props.route.auth.logout}>Logout</Link></li>
              <li className="active"><Link to='journal'>Journal Light</Link></li>
            </ul>
            <Header />
            {/*<h3 className='text-muted' style={{paddingTop: '15px'}}> Journal Light </h3>*/}
            {/*<img className='logo' src={logo} width='50em' height='auto' alt='logo' />*/}
            <p className='clearFloat'></p>
          </div>

            <p style={{textAlign: 'center'}}>{this.state.saveerror}</p>

            <input 
            className='searchBar' 
            placeholder='Search' 
            onChange={ (evt) => this.handleSearchChange(evt)}></input>

            <Window dataById={this.state.foundDataById} 
            dataOrder={this.state.foundDataOrder}
            timelineMapping={this.state.timelineMapping}
            searching={ this.searchTerms !== '' }
            newEntryDividerLength={this.state.newEntryDividerLength} />

          <div className="footer">
            <p>&copy; Journal Light 2017</p>
          </div>

          </div>
            )
    }
}

export default MainApp;

// import { Link, IndexLink } from 'react-router';
// <li><IndexLink to='/'>Home</IndexLink></li>