import React from 'react';
import * as Utility from '../LibAssist';

export default class PrettyDate extends React.Component{
    render() {
      var prettyDate = Utility.prettyDateTime( this.props.datetime_code,  this.props.datetime_precision);
      var opacity=1;
      if (prettyDate === '') {
        prettyDate = 'Date';
        opacity=0.3;
      }

      return (
          <div 
          className='prettyDateStyle'
          type='text' 
          id={this.props.dataId.toString()+'PrettyDate'}
          style={{opacity:opacity}}
          onClick={this.props.handleDateTimeFocus} >
          {prettyDate} &nbsp;
          </div>)
        }
};
