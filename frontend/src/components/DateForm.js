import React from 'react';
import * as Utility from '../LibAssist';
import * as ChatAppActions from "../actions/ChatAppActions";
import { TimelineMax} from 'gsap';
import $ from 'jquery';
import FontAwesome from 'react-fontawesome';

export default class DateForm extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            precision: this.props.precision,
            selections : {
                year: this.props.dateInArray[0],
                month: this.props.dateInArray[1],
                day: this.props.dateInArray[2],
                hour: this.props.dateInArray[3],
                minute: this.props.dateInArray[4],
                second: this.props.dateInArray[5]
            }
        }
        this.generateRange = this.generateRange.bind(this);
        this.optionsNumerical = this.optionsNumerical.bind(this);
        this.optionsMonths = this.optionsMonths.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.sizeDropDown = this.sizeDropDown.bind(this);
        this.dateSubmitHandler = this.dateSubmitHandler.bind(this);
        this.cancelSubmit = this.cancelSubmit.bind(this);
        this.animateDelete = this.animateDelete.bind(this);
    }

    componentWillMount() {
        const timeTypeArray = ['none','year','month','day','hour','minute','second'];
        const precisionIndex = timeTypeArray.indexOf(this.state.precision)+1;

        var selections = this.state.selections;
        for (let i=precisionIndex; i < timeTypeArray.length; i++) {
            selections[ timeTypeArray[i] ] = '-';
        }
        this.setState({selections: selections});
    }

    generateRange(start, stop, iter) {
        var numArray = [];
        for (let i = start; i < stop; i++) {
            numArray.push(i);
        }
        return numArray;
    }

    optionsNumerical(rangeStart, rangeEnd) {
        var numArray = this.generateRange(rangeStart, rangeEnd, 1);
        var result = numArray.map(function(val){
            return (
                <option key={val} value={val}>
                {val}
                </option>
                )
        });
        result.push(
            <option key='-' value='-'>
            -
            </option>
            )
        return result;
    }

    optionsMonths(){
        var numArray = this.generateRange(1, 13, 1);
        var result = numArray.map(function(val){
            return (
                <option key={val} value={val}>
                {Utility.monthDictionary(val)}
                </option>
                )
        });
        result.push(
            <option key='-' value='-'>
            -
            </option>
            )
        return result;
    }

    optionsDays(){
        var numArray = this.generateRange(1, 32, 1);
        var result = numArray.map(function(val){
            return (
                <option key={val} value={val}>
                {val.toString()+Utility.dayExtension(val)}
                </option>
                )
        });
        result.push(
            <option key='-' value='-'>
            -
            </option>
            )
        return result;
    }

    optionsHour() {
        var numArray = this.generateRange(0, 24, 1);
        var result = numArray.map(function(val){
            let hourAmPm = Utility.hoursMilitaryAMPM(val);
            let ampm = '';
            if (val < 12) {
                ampm = 'am'
            } else {
                ampm = 'pm'
            }
            return (
                <option key={val} value={val}>
                {hourAmPm[0].toString()+ampm}
                </option>
                )
        });
        result.push(
            <option key='-' value='-'>
            -
            </option>
            )
        return result;
    }

    optionsMinSec(){
        var numArray = this.generateRange(0, 60, 1);
        var result = numArray.map(function(val){
            return (
                <option key={val} value={val}>
                {Utility.fillZero(val)}
                </option>
                )
        });
        result.push(
            <option key='-' value='-'>
            -
            </option>
            )
        return result;
    }    

    handleChange(evt, timeType) {
        let selections = this.state.selections;
        const selectedValue = evt.target.value;
        const timeTypeArray = ['none','year','month','day','hour','minute','second'];
        const precisionIndex = timeTypeArray.indexOf(timeType);

        var precision = 0;
        if (selectedValue === '-' ) {
            for (let i=precisionIndex; i < timeTypeArray.length; i++) {
                selections[ timeTypeArray[i] ] = '-';
                precision = timeTypeArray[precisionIndex-1];
            }

        } else if (precisionIndex < timeTypeArray.indexOf(this.state.precision)) {
            selections[timeType] = parseInt(selectedValue, 10);
            precision = this.state.precision;
        } else {
            selections[timeType] = parseInt(selectedValue, 10);
            precision = timeType;
        }

        this.setState({
            precision: precision,
            selections : selections
        });

    }

    dateSubmitHandler(evt) {
        evt.preventDefault();
        const timeTypeArray = ['year','month','day','hour','minute','second'];
        const formData = this.state.selections;

        for (let idx=0; idx<timeTypeArray.indexOf(this.state.precision); idx++){
            if (typeof formData[timeTypeArray[idx]] !== 'number') {
                var dropDownSelect = $('select');
                var t1 = new TimelineMax();
                t1.to(dropDownSelect, 1, {color:'red'} )
                .to(dropDownSelect, 1, {color:'black'});
                return null;
            }
        }
        
        var formDataArray = timeTypeArray.map(function(type){
            if (typeof formData[type] !== 'number') {
                if (type === 'year' || type === 'month' || type === 'day') {
                        return 1;
                    } else {
                        return 0;
                    }
            } else {
                return formData[type];
            }
        });

        const dataId = this.props.data_id;
        ChatAppActions.changeEntryDateTime( dataId, formDataArray, this.state.precision );
        this.props.handleDateTimeBlur();
    }

    cancelSubmit(evt) {
        evt.preventDefault();
        this.props.handleDateTimeBlur();
    }

    animateDelete(evt, dataId) {
        evt.preventDefault();

        ChatAppActions.moveFileBatchToRecycleBin(this.props.media);

        var entrySelect = $('#'+dataId.toString());
        var t1 = new TimelineMax();
        t1.to(entrySelect, 0.25, {opacity:"0"} )
        .to(entrySelect, 0.25, { 
            height: "0",
            overflow: 'hidden',
            onComplete:ChatAppActions.deleteEntry,
            onCompleteParams:[dataId], 
        });

    }

    sizeDropDown(value, type) {
        var text = value;
        if (type==='month') {
            // console.log(value)
            text = Utility.monthDictionary(value);
            // This is to make the month string a bit longer so it's not clipped. Sizing seems to be an issue here
            // if ([1,2,3,5,6,7,8,10].indexOf(value) !== -1) {
            //     text += 's';
            // }
            if ([9,11,12].indexOf(value) !== -1) {
                text += 's';
            }
        }
        if (type==='day') {
            text = value.toString() + Utility.dayExtension(value);
        }
        if (type==='hour'){
            text += 'am';
        }
        if (value==='-') {
            text='-';
        }

        // This is to make the text a bit longer so it's not clipped. Sizing seems to be an issue here
        text += 's';

        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext("2d");
        ctx.font = "18px san serif";  
        var length = ctx.measureText(text).width;

        var style = {width: length.toString()+'px'};
        return style;
    }

    render() {

        return (
            <div className='formDivStyle' id={this.props.data_id.toString()+'DateForm'}>
            <form className='styleSelect' onSubmit={ (evt) => this.dateSubmitHandler(evt) }>

            <div className='dateFormBlockIfCramped'>
                <select 
                value={this.state.selections['year']} 
                onChange={ (evt) => this.handleChange(evt, 'year')} >
                {this.optionsNumerical(1920, 2020)}
                </select>
                &nbsp;
                <select 
                style={ this.sizeDropDown(this.state.selections['month'], 'month') }
                value={this.state.selections['month']} 
                onChange={ (evt) => this.handleChange(evt, 'month')} >
                {this.optionsMonths()}
                </select>
                <span className='formSpanStyle'>&nbsp;the&nbsp;</span>
                <select 
                style={ this.sizeDropDown(this.state.selections['day'], 'day') }
                value={this.state.selections['day']} 
                onChange={ (evt) => this.handleChange(evt, 'day')} >
                {this.optionsDays()}
                </select>
                <span className='formSpanStyle'>&nbsp;at&nbsp;</span>
            </div>

            <div className='dateFormBlockIfCramped'>
                <select 
                style={ this.sizeDropDown(this.state.selections['hour'], 'hour') }
                value={this.state.selections['hour']} 
                onChange={ (evt) => this.handleChange(evt, 'hour')} >
                {this.optionsHour()}
                </select>
                <span className='formSpanStyle'>:</span>
                <select 
                style={ this.sizeDropDown(this.state.selections['minute'], 'minute') }
                value={this.state.selections['minute']} 
                onChange={ (evt) => this.handleChange(evt, 'minute')} >
                {this.optionsMinSec()}
                </select>
                <span className='formSpanStyle'>:</span>
                <select 
                style={ this.sizeDropDown(this.state.selections['second'], 'second') }
                value={this.state.selections['second']} 
                onChange={ (evt) => this.handleChange(evt, 'second')} >
                {this.optionsMinSec()}
                </select>
                {/*<span className='formSpanStyle'>{Utility.hoursMilitaryAMPM( this.state.selections['hour'] )[1] }&nbsp;</span>*/}

            </div>

            <div className='dateFormBlockIfCramped' id='dateformButtonBlock'>
                <button 
                type='submit' >
                &nbsp;<FontAwesome name="check" />&nbsp;
                </button>
                &nbsp;
                <button onClick={this.cancelSubmit}>
                &nbsp;<FontAwesome name="ban" />&nbsp;
                </button>
                &nbsp;
                <button
                onClick={this.props.onClick}>
                &nbsp;<FontAwesome name="upload" />&nbsp;
                </button>
                &nbsp;
                <button 
                onClick={(evt) => this.animateDelete(evt,this.props.data_id)}>
                &nbsp;<FontAwesome name="trash" />&nbsp;
                </button>
            </div>

            </form>
            </div>
            );
    }
};

