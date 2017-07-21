import React from 'react';
import * as Utility from '../LibAssist';
import ChatAppStore from "../stores/ChatAppStore";
import * as ChatAppActions from "../actions/ChatAppActions";

export default class ResponseBox extends React.Component{
    constructor(props){
        super(props)
        this.state={
            currentTime: Utility.currentTimeInMill(),
            lastTimeChange: Utility.currentTimeInMill(),
            response: ' ',
        };
        this.intervalHandler = null;
        this.checkTime = this.checkTime.bind(this);
        this.updateLastChange = this.updateLastChange.bind(this);
        this.responseApi = this.responseApi.bind(this);
    }

    componentWillMount() {
      var intervalHandler = setInterval( ()=> {
        this.checkTime();
      }, 1000);

      this.intervalHandler = intervalHandler;
      ChatAppStore.on("change", this.updateLastChange);
     }

    componentWillUnmount() {
      clearInterval(this.intervalHandler);
      ChatAppStore.removeListener("change", this.updateLastChange);
    }

    updateLastChange() {
      this.setState({lastTimeChange: Utility.currentTimeInMill() })
    }

    checkTime() {
      var responseAiSetting = (localStorage.getItem('aiToggle') === 'true');
        if (this.state.currentTime - this.state.lastTimeChange > 15000 && responseAiSetting === true) {
            this.setState({lastTimeChange: Utility.currentTimeInMill()});
            this.responseApi(this.props.entryContent);
          }

        this.setState({currentTime: Utility.currentTimeInMill() });
    }

    responseApi(entryContent) {
      fetch('https://murmuring-thicket-60925.herokuapp.com/api/v2/response', {
          method: 'POST',
          headers: {
            // Authorization: 'password',
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            {
                'entryValue':entryContent,
                'priorResponse':this.props.priorResponse,
                'uid': localStorage.getItem('uid'),
                'password': localStorage.getItem('responsePassword'),
                'quotaCheck': 'False',
            }),

        }).then( (response) => {
          return response.json();

        }).then( (data) => {
          // console.log(data)
          ChatAppActions.addAiResponse(this.props.dataId, data.response);
          this.setState({
            response: data.response,
          });

        })

    }

    render() {
        return (
            <span className='inputResponseStyle'>{this.state.response}&nbsp;</span>
        );
    }
};
