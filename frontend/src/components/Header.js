import React from 'react';
import * as Utility from '../LibAssist';

export default class Header extends React.Component{
    constructor(props) {
        super(props);
        this.state={
            currentTime: Utility.currentTimeInArray(),
        }
        this.intervalHandler = null;
        this.updateTime = this.updateTime.bind(this);
    }
    componentWillMount() {
      var intervalHandler = setInterval( ()=> {
        this.updateTime();
      }, 1000);

      this.intervalHandler = intervalHandler;
     }

    componentWillUnmount() {
      clearInterval(this.intervalHandler);
    }

    updateTime() {
        this.setState({currentTime: Utility.currentTimeInArray() });
    }

    render() {
        return (
            <div>
            <h3 className='text-muted'>{ Utility.prettyDateTime( this.state.currentTime, 'second') }</h3>
             </div>
            );
    }
};
