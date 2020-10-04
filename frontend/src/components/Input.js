import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import NewEntry from './NewEntry';
import PrettyDate from './PrettyDate';
import DateForm from './DateForm';
import ResponseBox from './ResponseBox';
import MediaStore from "../stores/MediaStore";
import * as ChatAppActions from "../actions/ChatAppActions";
import dragHandle from '../icons/draghandle.svg';
import loading from '../icons/loadingblank.png';

import Gallery from './Gallery';
import Dropzone from 'react-dropzone';

import {TimelineMax} from 'gsap';
import $ from 'jquery';

export default class Input extends React.Component{
    constructor(props) {
        super(props);
        this.state={
            showPrettyDate: true,
            editing: false,
            focusing: false,
            photoSet: [],
        };
        this.handleDateTimeFocus = this.handleDateTimeFocus.bind(this);
        this.handleDateTimeBlur = this.handleDateTimeBlur.bind(this);
        this.renderDateOrForm = this.renderDateOrForm.bind(this);
        this.handleTextAreaEditing = this.handleTextAreaEditing.bind(this);
        this.handleTextAreaFocus = this.handleTextAreaFocus.bind(this);
        this.handleTextAreaBlur = this.handleTextAreaBlur.bind(this);

        this.onDZDrop = this.onDZDrop.bind(this);
        this.onDZClick = this.onDZClick.bind(this);
        this.returnDim = this.returnDim.bind(this);
        this.scaleDim = this.scaleDim.bind(this);
        this.loadMedia = this.loadMedia.bind(this);
        this.downloadFile = this.downloadFile.bind(this);
        this.mediaQueue = {};
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.state !== nextState) {
            return true
        }
        if (this.props === nextProps) {
            return false
        } else {
            return true
        }
    }

    componentDidMount() {
        const dataId = this.props.id;
        var entrySelect = $('#'+dataId.toString());

        this.props.loadingHeightCallBack( entrySelect.height() );

        var t1 = new TimelineMax();
        if (this.props.scrollDirection === null) {
            t1.from(entrySelect, 0.25, {height: "0"})
            .to(entrySelect, 0.0001, {height: "auto"})
            // t1.fromTo(entrySelect, 0.25, {height: "0"}, {height: "auto"} ) // doesn't animate for some reasons
            .from(entrySelect, 0.25, {opacity: "0"})
        } else {
            t1.from(entrySelect, 0.25, {opacity: "0"})
        }

        this.loadMedia();
        MediaStore.on("change", this.loadMedia );

        this.props.loadedComponentCallback();

        // document.getElementById('dragHandle'+dataId.toString()).addEventListener("touchmove", function(e){
        //             e.preventDefault();
        //         });        
    }

    componentWillUnmount(){
        MediaStore.removeListener("change", this.loadMedia );

        const dataId = this.props.id;
        // document.getElementById('dragHandle'+dataId.toString()).removeEventListener("touchmove", function(e){
        //             e.preventDefault();
        //         });
    }

    downloadFile(fileName, stream) {
        this.mediaQueue[fileName] = 'requested';
        ChatAppActions.downloadMedia(fileName, stream);
    }

    returnDim(url) {
        var img = new Image();
        img.src = url;
        return { width: img.width , height: img.height }
    }

    scaleDim(dimensions) {
        var dim = {};
        var restrictHeight = 100;
        
        dim['aspectRatio'] = ( dimensions.width / dimensions.height );
        dim['height'] = restrictHeight;
        dim['width'] = restrictHeight * dim.aspectRatio;

        return dim;
    }

    loadMedia() {
        var mediaFiles = this.props.entrydata.media;

        var PHOTO_SET = [];
        for (let i=0; i<mediaFiles.length; i++) {
            // Retrieving src from mediastore or downloading it
            let media = mediaFiles[i];
            let fileName = media.fileName;

            let src = MediaStore.getMedia(fileName, 'fullsize');
            var specialMediaSrc = 'none';
            if (media.fileType === 'video') {
                specialMediaSrc = MediaStore.getMedia(media.realFileName, 'fullsize');
            }

            if (src === loading && typeof this.mediaQueue[fileName] === 'undefined' ) {
                this.downloadFile(fileName, false);
                src = loading;
            }
            if (specialMediaSrc === loading && typeof this.mediaQueue[media.realFileName] === 'undefined') {
                this.downloadFile(media.realFileName, true);
            }
            if (src === 'pending') {
                src = loading;
            }

            // Prepping downloaded file for display
            let dim = {};
            if ( 'dimensions' in media) {
                dim = media.dimensions;
            } else {
                dim = this.returnDim(src);
            }
            
            dim = this.scaleDim(dim);
            if ( isNaN(dim.aspectRatio) === true) {
                dim.aspectRatio = 1;
                dim.width = 100;
            }

            let photo = {
                src: src,
                width: dim.width,
                height: dim.height,
                aspectRatio: dim.aspectRatio,
                lightboxImage: {src: src, 
                    file: {fileName: fileName, fileType: media.fileType, realFileName: media.realFileName, realFileNameSrc: specialMediaSrc}}
            }

            PHOTO_SET.push(photo);
        }

        this.setState({photoSet: PHOTO_SET});
    }

    onDZDrop(files) {
        ChatAppActions.uploadMedia(files, this.props.entrydata.data_id);
    }

    onDZClick(evt) {
        evt.preventDefault();
        this.dropzone.open();
    }

    handleDateTimeFocus(){
        this.setState( { showPrettyDate: false })
    }

    handleDateTimeBlur(){
        this.setState( { showPrettyDate: true })
    }

    handleTextAreaEditing() {
        this.setState({ editing: true });
    }

    handleTextAreaFocus() {
        this.setState({ focusing: true });
    }

    handleTextAreaBlur() {
        this.setState({ focusing: false, editing: false });
    }

    renderDateOrForm() {
        var dataId = this.props.entrydata.data_id;
        if (this.state.showPrettyDate === true) {
            return (
                <PrettyDate 
                dataId={dataId} 
                datetime_code={this.props.entrydata.datetime_code} 
                datetime_precision={this.props.entrydata.datetime_precision} 
                handleDateTimeFocus={this.handleDateTimeFocus} />)
        } else {
            return (
                <DateForm 
                handleDateTimeBlur={this.handleDateTimeBlur} 
                data_id={dataId} 
                media={this.props.entrydata.media}
                precision={this.props.entrydata.datetime_precision}
                dateInArray={this.props.entrydata.datetime_code}
                onClick={this.onDZClick} />)
        }
    }

    render() {
        var dataId = this.props.entrydata.data_id;
        var idx = this.props.idx;

        const PHOTO_SET = this.state.photoSet;

        var activeStyle = {
          borderStyle: 'solid',
          borderColor: '#367FC6',
        };
        var style = {
        width: '100%',
        borderWidth: 2,
        borderColor: '#f4f5f7',
        borderStyle: 'solid',
        borderRadius: 5,
      };

      var opacity = 1;
      var emptyMsg = '';
      if (this.props.entrydata.content.length === 0){
        emptyMsg = 'Write here...'
        opacity = 0.3;
      }

        return (
          <div className="fullEntryDiv" id={this.props.id}>
            <NewEntry
              addEntry={ChatAppActions.addEntry}
              idx={idx}
              setScrollNull={this.props.setScrollNull}
              searching={this.props.searching}
              newEntryDividerLength={this.props.newEntryDividerLength}
            />

            <div className="handleEntryDiv">
              {this.props.searching === false ? (
                <img
                  className="handle"
                  id={"dragHandle" + dataId.toString()}
                  src={dragHandle}
                  width="35em"
                  height="auto"
                  alt="dragHandle"
                />
              ) : (
                <img
                  src={dragHandle}
                  style={{ opacity: "0" }}
                  width="35em"
                  height="auto"
                  alt="dragHandle"
                />
              )}

              <div className="entryDateContent">
                <Dropzone
                  ref={(node) => {
                    this.dropzone = node;
                  }}
                  onDrop={this.onDZDrop}
                  disableClick={true}
                  style={style}
                  activeStyle={activeStyle}
                >
                  {this.renderDateOrForm()}

                  {this.state.editing === true ? (
                    <TextareaAutosize
                      value={this.props.entrydata.content}
                      className="inputTextareaStyle"
                      onChange={(evt) =>
                        ChatAppActions.handleUserInput(dataId, evt)
                      }
                      onFocus={(evt) => this.handleTextAreaFocus()}
                      onBlur={(evt) => this.handleTextAreaBlur()}
                    />
                  ) : (
                    <div
                      className="inputFillerTextareaStyle"
                      style={{ opacity: opacity }}
                      onClick={this.handleTextAreaEditing}
                    >
                      {this.props.entrydata.content}
                      {emptyMsg} &nbsp;
                    </div>
                  )}

                  {this.state.focusing === true ? (
                    <ResponseBox
                      className="inputResponseStyle"
                      dataId={dataId}
                      entryContent={this.props.entrydata.content}
                      priorResponse={this.props.entrydata.ai_response}
                    />
                  ) : (
                    <span className="inputResponseStyle">&nbsp;</span>
                  )}

                  <Gallery
                    photos={PHOTO_SET}
                    dataId={this.props.entrydata.data_id}
                  />
                </Dropzone>
              </div>
            </div>
          </div>
        );
    }
};

