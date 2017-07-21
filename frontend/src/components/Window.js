import React from 'react';
import Input from './Input';
import NewEntry from './NewEntry';
import Dragula from 'react-dragula';
// import autoScroll from 'dom-autoscroller';
import * as ChatAppActions from "../actions/ChatAppActions";
import $ from 'jquery';
import * as Utility from '../LibAssist';
import {TweenLite} from 'gsap';

export default class Window extends React.Component{
    constructor(props) {
        super(props);
        this.state={
            windowStart: 0,
            windowEnd: 16,
        };
        this.start = 0;
        this.end = 0;
        this.windowSize = 8;
        this.loadSize = 1;
        this.scrollDirection = null;
        this.scrollPosition = 0;
        this.scrollPrevention = 0; // used to deal with scroll event being triggered when adding/deleting entries at end

        this.debounce = this.debounce.bind(this);

        this.getIndexInParent = this.getIndexInParent.bind(this);
        this.dragulaDecorator = this.dragulaDecorator.bind(this);
        
        this.loadingHeightCallBack = this.loadingHeightCallBack.bind(this);
        this.handleScroll = this.handleScroll.bind(this);

        this.timelinePercents = [];
        this.timelinePercentDataIdMap = {};
        this.renderTimeline = this.renderTimeline.bind(this);
        this.handleScrollBarEvent = this.handleScrollBarEvent.bind(this);
        // this.handleScrollBarEvent = this.debounce(this.handleScrollBarEvent, 250);
        this.scrollToId = null;
        this.scrollWindowScrollToElement = this.scrollWindowScrollToElement.bind(this);
        this.holding = false;
        this.handleClickTouch = this.handleClickTouch.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
        this.handleClickTouchRelease = this.handleClickTouchRelease.bind(this);
        this.setScrollNull = this.setScrollNull.bind(this);

        this.searching = false;
        this.storedState = {start: 0, end: 16, scrollPosition: 0};
        this.restoring = false;

        this.expectedLoadedComponentCount = 16;
        this.loadedComponentCount = 0;
        this.loadedComponentCallback.bind(this);
    }

    debounce(fn, delay) {
        var timer = null;
        return function () {
          var context = this, args = arguments;
          clearTimeout(timer);
          timer = setTimeout(function () {
            fn.apply(context, args);
          }, delay);
        };
  }

    setScrollNull(){
        this.scrollDirection = null;
        this.scrollPrevention = 1;
    }

    handleClickTouch(e) {
        // if(e.stopPropagation) e.stopPropagation();
        //     if(e.preventDefault) e.preventDefault();
        //     e.cancelBubble=true;
        //     e.returnValue=false;
        // e.preventDefault()
        this.holding = true;
        this.handleScrollBarEvent(e);
    }

    handleDrag(evt) {
        if (this.holding === true) {
            this.handleScrollBarEvent(evt);
        }
    }

    handleClickTouchRelease(evt) {
        this.holding = false;
    }

    handleScrollBarEvent(evt) {
        // console.log(evt)
        var windowSize = this.windowSize;

        var scrollBarSelector = $('.scrollBar');
        var percentScoll = (evt.pageY - scrollBarSelector.offset().top) / scrollBarSelector.height();
        // console.log(percentScoll)

        var closestPercenttoClick =  Utility.closest(1 - percentScoll, this.timelinePercents);
        var closestDataId = this.timelinePercentDataIdMap[closestPercenttoClick];
        this.scrollToId = closestDataId;

        var dataOrder = this.props.dataOrder;
        var midIndexPoint = dataOrder.indexOf(parseInt(closestDataId, 10));

        var windowStart = midIndexPoint - windowSize;
        var windowEnd = midIndexPoint + windowSize;

        if (windowStart < 0 ) {
            windowStart = 0;
            windowEnd = windowSize*2;
        }
        if (windowEnd > dataOrder.length ) {
            windowStart = dataOrder.length - windowSize*2;
            windowEnd = dataOrder.length;
        }

        this.setState({ windowStart: windowStart, windowEnd: windowEnd});

        if (this.state.windowStart === windowStart) {
            this.scrollWindowScrollToElement(closestDataId);

        } else {
            var windowShiftDifference = Math.abs(this.state.windowStart - windowStart);
            if (windowShiftDifference > windowSize * 2) {
                this.expectedLoadedComponentCount = windowSize * 2;
                this.loadedComponentCount = 0;
            } else {
                this.expectedLoadedComponentCount = windowShiftDifference;
                this.loadedComponentCount = 0;
            }
        }

    }

    scrollWindowScrollToElement(element) {
        if (typeof element === 'undefined'){
            return null;
        }
        var scrollWindowSelector = $('.inner');
        var el = $("#"+element );
        var elementTop = el.position().top;
        var pos = scrollWindowSelector.scrollTop() + elementTop - scrollWindowSelector.offset().top;
        scrollWindowSelector.scrollTop( pos );
    }

    handleScroll(evt) {
        if (this.scrollPrevention === 1) {
            this.scrollPrevention = 0;
            return null;
        } 
        var windowSize = this.windowSize;
        var loadSize = this.loadSize;
        var dataOrder = this.props.dataOrder;

        var windowScrollBarContainerSelector = $('.windowScrollBarContainer');
        var scrollWindowSelector = $('.inner');

        var scrollPosition = scrollWindowSelector.scrollTop();
        this.scrollPosition = scrollPosition;
        var scrolledPercent = scrollPosition / 
        ( scrollWindowSelector[0].scrollHeight - windowScrollBarContainerSelector.height() );

        // console.log(scrollPosition)
        // console.log(scrolledPercent)

         // console.log(scrollWindowSelector.offset() ) // Not useful, it shows the corner of the topleft position in page
        // console.log(scrollWindowSelector.scrollTop()) // The y position of the top of the window relative to the whole scrollable element
        // console.log(scrollWindowSelector[0].scrollHeight) // The total height of the scrollable element if all visible
        // console.log(windowScrollBarContainerSelector.height() ) // The height of the window to the scrollable element

        var nextStart = 0;
        var nextEnd = 0;
        if (scrolledPercent === 0) {
            nextStart = this.state.windowStart - loadSize;
            nextEnd = this.state.windowEnd - loadSize;

            if (nextStart < 0 ) {
                nextStart = 0;
                nextEnd = windowSize*2;

                if (nextEnd > dataOrder.length) {
                    nextEnd = dataOrder.length;
                }
            }
            this.scrollDirection = 'up';
            this.setState({ windowStart : nextStart, windowEnd: nextEnd });
        }

        if (scrolledPercent >= 0.98) {
            nextStart = this.state.windowStart + loadSize;
            nextEnd = this.state.windowEnd + loadSize;

            if (nextEnd > dataOrder.length ) {
                nextStart = dataOrder.length - windowSize*2;
                nextEnd = dataOrder.length;

                if (nextStart < 0 ) {
                    nextStart = 0;
                }
            }
            this.scrollDirection = 'down';
            this.setState({ windowStart : nextStart, windowEnd: nextEnd });
        }

        // console.log(this.state, this.scrollDirection)

    }

    loadingHeightCallBack(val) {
        // console.log('loading scroll comp: ' + val)
        // console.log(this.scrollDirection)

        var scrollWindowSelector = $('.inner');
        var windowScrollBarContainerSelector = $('.windowScrollBarContainer');

        // console.log('-------')
        // console.log(scrollWindowSelector.scrollTop()) // The y position of the top of the window relative to the whole scrollable element
        // console.log(scrollWindowSelector[0].scrollHeight) // The total height of the scrollable element if all visible
        // console.log(windowScrollBarContainerSelector.height())
        // console.log(val)
        // console.log('-------')
        
        if (this.scrollDirection === 'up') {
            scrollWindowSelector.scrollTop( val  );
        }
        if (this.scrollDirection === 'down') {
            scrollWindowSelector.scrollTop( 
                scrollWindowSelector[0].scrollHeight 
                - windowScrollBarContainerSelector.height() 
                - val );
        }
    }

    loadedComponentCallback() {
        this.loadedComponentCount += 1;
    }

    renderTimeline() {
        var initialTimeline = this.props.timelineMapping;
        var timelineMapping = []
        for (let i = 0; i<initialTimeline.length; i++) {
            if (isNaN(initialTimeline[i].time) === false) {
                timelineMapping.push(initialTimeline[i]);
            }
        }
        if (timelineMapping.length === 0) {
            return null;
        }

        var height = $('.windowScrollBarContainer').outerHeight() ;
        // this.refs.canvas.style.height = '100%';
        this.refs.canvas.height = height;
        var canvasWidth = $('.scrollBar').width();
        this.refs.canvas.width = canvasWidth;

        // console.log(timelineMapping)
        var timelineLength = timelineMapping[timelineMapping.length-1].time - timelineMapping[0].time;
        var markOpacity = (10 / (10+timelineMapping.length));

        var ctx = this.refs.canvas.getContext('2d');
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(0,0,0,' + markOpacity.toString() + ')';

        var minTime = timelineMapping[0].time;

        this.timelinePercents = [];
        this.timelinePercentDataIdMap = {};
        for (let i = 0; i<timelineMapping.length; i++) {
            // take the difference of the time by the minimum timelength, then divide by total timelength to get a fraction
            // then multiply by the total height
            let scrollBarMarkDataId = timelineMapping[i].dataId;
            let scrollBarMarkPercent = ( (timelineMapping[i].time - minTime ) / timelineLength);
            
            this.timelinePercents.push(scrollBarMarkPercent);
            this.timelinePercentDataIdMap[scrollBarMarkPercent] = scrollBarMarkDataId;

            let scrollbarMarkHeight = (height - 1 ) * scrollBarMarkPercent;
            ctx.moveTo(0, height - scrollbarMarkHeight);
            ctx.lineTo(canvasWidth, height - scrollbarMarkHeight);
            ctx.stroke();
        }
        
    }

    getIndexInParent(el) {
      return Array.from(el.parentNode.children).indexOf(el);
    }

    dragulaDecorator(componentBackingInstance) {
        if (componentBackingInstance) {
          let options = {
            moves: function (el, container, handle, sibling) {
                return handle.classList.contains('handle');
            }
        };

          var drake = Dragula([componentBackingInstance], options);

          drake.on('drag', (el,source) => {
            let pickedLocation = this.getIndexInParent(el);
            this.start = pickedLocation + this.state.windowStart;

            let dataId = this.props.dataOrder[this.start];
            var eleSelector = $('.fullEntryDiv').not( $('#'+dataId.toString()) );
            TweenLite.to(eleSelector, 0.25, {opacity: "0.5"} );
            TweenLite.to($('.addButton'), 0.25, {opacity: "0.5"});
          })

          drake.on('drop', (el, target, source, sibling) => {
            let droppedLocation = this.getIndexInParent(el);

            var end = (droppedLocation+this.state.windowStart);

            if ( end - this.start >= this.windowSize *2 ) {
                this.end = droppedLocation + this.state.windowStart -1;
                ChatAppActions.handleReorder(this.start, this.end, true);
            } else if ( end - this.start <= this.windowSize *-2) {
                this.end = end;
                ChatAppActions.handleReorder(this.start, this.end, true);
            } else {
                this.end = end;
                ChatAppActions.handleReorder(this.start, this.end, false);
            }
          });

          drake.on('dragend', (el) => {
            TweenLite.to($('.fullEntryDiv'), 0.25, {opacity: "1"} );
          });

        }

        // var scroll = autoScroll([
        //             document.querySelector('.inner')
        //         ],{
        //         margin: 20,
        //         pixels: 5,
        //         scrollWhenOutside: false,
        //         autoScroll: function(){
        //             return this.down && drake.dragging;
        //         }
        //     });

    }

    componentDidMount() {
        this.renderTimeline();
        window.addEventListener("resize", this.renderTimeline );
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.renderTimeline );
    }

    componentWillUpdate() {
        // if (this.props.searching === false && this.restoring === false ) {
        //     this.storedState.scrollPosition = $('.inner').scrollTop();
        // }

    }

    componentDidUpdate() {
        // if (this.restoring === true) {
        //     $('.inner').scrollTop(this.storedState.scrollPosition);
        //     this.restoring = false;
        // }

        if (this.props.searching === true && this.searching === false) {
            this.storedState.start = this.state.windowStart;
            this.storedState.end = this.state.windowEnd;
            this.setState({windowStart:0, windowEnd: this.windowSize * 2 });
        }

        if (this.props.searching === false && this.searching === true) {
            this.setState({ windowStart: 0, windowEnd: this.windowSize * 2 });
            // this.setState({ windowStart: this.storedState.start, windowEnd: this.storedState.end });
            // this.restoring = true;
        }

        if (this.props.searching === true) {
            this.scrollDirection = null;
            this.searching = true;
        } else {
            this.searching = false;
        }

        if (this.scrollToId !== null && this.holding === true) {
            this.scrollWindowScrollToElement(this.scrollToId);
        }

        this.renderTimeline( this.props.timelineMapping );
    }

    render() {
        var dataById = this.props.dataById;
        var windowStart = this.state.windowStart;
        var windowEnd = this.state.windowEnd;
        if (windowStart < 0) {
            windowStart = 0;
            windowEnd = this.windowSize* 2;
        }
        var dataSelection = this.props.dataOrder.slice(windowStart, windowEnd);

        return (
            <div className='windowScrollBarContainer'
            onMouseUp={this.handleClickTouchRelease} 
            onMouseLeave={this.handleClickTouchRelease}>

                <div className='windowStyle' >
                <div 
                className='inner' 
                onScroll={ (evt) => {this.handleScroll(evt)} }>

                    <div ref={this.dragulaDecorator}>
                        {dataSelection.map(function(dataId, idx ){
                            var rowval = dataById[dataId];
                            return (<Input 
                                key={dataId} 
                                id={dataId} 
                                idx={idx + windowStart} 
                                entrydata={rowval} 
                                loadingHeightCallBack={ (val) => this.loadingHeightCallBack(val) } 
                                loadedComponentCallback={ () => this.loadedComponentCallback() } 
                                setScrollNull={this.setScrollNull} 
                                scrollDirection={this.scrollDirection} 
                                searching={this.props.searching}
                                newEntryDividerLength={this.props.newEntryDividerLength} />) 
                        }.bind(this))}
                    </div>
                    <NewEntry 
                    addEntry={ChatAppActions.addEntry} 
                    idx={999999999} 
                    setScrollNull={this.setScrollNull} 
                    searching={this.props.searching} 
                    newEntryDividerLength={this.props.newEntryDividerLength}/>
                </div>
                </div>

            <div className='scrollBar'>
            <canvas 
            ref="canvas" 
            className='item' 
            id='mycanvas' 
            onMouseDown={this.handleClickTouch} 
            onMouseMove={this.handleDrag} ></canvas>
            </div>

            </div>
            );
    }
};
// onTouchEnd={this.handleClickTouchRelease}
// onTouchStart={this.handleClickTouch} 
// onTouchMove={this.handleDrag} 