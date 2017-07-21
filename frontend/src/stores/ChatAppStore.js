import { EventEmitter } from "events";
import dispatcher from "../Dispatcher";
import $ from 'jquery';
import * as Utility from '../LibAssist';

class ChatAppStore extends EventEmitter {
  constructor() {
    super()
    this.chatAppData = {
      userId: null,
      dataById : {},
      dataOrder : [],
      modifiedDataList : {},
      newDataList : [],
      deleteDataList : [],
      timelineMapping: [],
    }
  }

  getAll() {
    return this.chatAppData;
  }

  getUserId(){
    return this.chatAppData.userId;
  }

  getCommonDate(a,b) {
    const timeTypeArray = ['year','month','day','hour','minute','second'];
    const sharedPrecision = Math.min(
      timeTypeArray.indexOf(a.datetime_precision),
      timeTypeArray.indexOf(b.datetime_precision));
   
    var dateTimeArray = [1,1,1,1,1,1];
    var preloadPrecision = 'none';
    if (sharedPrecision === -1) {
      return {preloadDateTime: dateTimeArray, preloadPrecision: preloadPrecision}
    }

    const dateTimeArrayA = a.datetime_code;
    const dateTimeArrayB = b.datetime_code;
    for (let i=0; i<=sharedPrecision; i++) {
      if (dateTimeArrayA[i] === dateTimeArrayB[i]) {
        dateTimeArray[i] = dateTimeArrayA[i];
        preloadPrecision = timeTypeArray[i];
      } else {
        dateTimeArray[i] = parseInt( (dateTimeArrayA[i] + dateTimeArrayB[i]) / 2, 10);
        preloadPrecision = timeTypeArray[i];
        break
      }
    }

    return {preloadDateTime: dateTimeArray, preloadPrecision: preloadPrecision}
  }

  addEntry(idx) {
    var dataById = this.chatAppData.dataById;
    var dataOrder = this.chatAppData.dataOrder;

    var newEntryId = 1;
    while ( $.inArray(newEntryId, dataOrder) !== -1 ) {
      newEntryId = Math.floor(Math.random()*1000000);
    }

    var preloadDateTime = 0;
    var preloadPrecision = '';
    if (idx === 0) {
      preloadDateTime = Utility.currentTimeInArray();
      preloadPrecision = 'second';
    } else if (idx === 999999999) {
      preloadDateTime = Utility.currentTimeInArray();
      preloadPrecision = 'none';
    } else {
      const a = dataById[dataOrder[ idx - 1 ]];
      const b = dataById[dataOrder[ idx ]];
      const result = this.getCommonDate(a,b);
      preloadDateTime = result['preloadDateTime'];
      preloadPrecision = result['preloadPrecision'];
    }

    dataById[newEntryId] = { 
      'data_id': newEntryId,
      'datetime_code': preloadDateTime,
      'datetime_milli' : Utility.convertDateTimeToMilli(preloadDateTime),
      'datetime_precision': preloadPrecision,
      'content': '',
      'media': [ ],
      'ai_response' : [ ],
    }

    dataOrder.splice(idx, 0, newEntryId);
    dataOrder.join();

    this.chatAppData.dataById = dataById;
    this.chatAppData.dataOrder = dataOrder;
    this.chatAppData.modifiedDataList[newEntryId] = false;
    this.chatAppData.newDataList.push(newEntryId);
  }

  deleteEntry(dataId) {
    var dataById = this.chatAppData.dataById;
    var dataOrder = this.chatAppData.dataOrder;
    var modifiedDataList = this.chatAppData.modifiedDataList;
    var newDataList = this.chatAppData.newDataList;

    delete dataById[dataId];
    this.chatAppData.dataById = dataById;

    this.chatAppData.dataOrder = Utility.removeFromArrayByValue(
      dataOrder,
      dataId,
      );

    delete modifiedDataList[dataId];
    this.chatAppData.modifiedDataList = modifiedDataList;

    if (newDataList.indexOf(dataId) !== -1) {
      this.chatAppData.newDataList = Utility.removeFromArrayByValue(
        newDataList,
        dataId,
        );
    } else {
      this.chatAppData.deleteDataList.push(dataId);
    }
    
  }

  handleUserInput(dataId, entryContent) {
    this.chatAppData.dataById[dataId].content = entryContent;
    this.chatAppData.modifiedDataList[dataId] = true;
  }

  sortLayer(array) {
    var stableArray = Object.assign([], array);

    // var stableArrayDic = {};
    // for (let i=0; i<array.length; i++) {
    //   let dataEle = array[ i ];
    //   stableArrayDic[dataEle] = i;
    // }

    array.sort( (a,b) => {
      const dateTimeArrayA = a[0];
      const dateTimeArrayB = b[0];

      const sharedPrecision = Math.min(a[1], b[1]);
      // console.log('Sort')
      // console.log(dateTimeArrayA, dateTimeArrayB)
      // console.log(sharedPrecision)

      for (let i=0; i <= sharedPrecision; i++) {
        // console.log( i, dateTimeArrayA[i], dateTimeArrayB[i] )
        if (dateTimeArrayA[i] === dateTimeArrayB[i]) { //remember to revert returns to proper values
          // console.log('continue')
          continue;
        }
        if (dateTimeArrayA[i] < dateTimeArrayB[i]) {
          // console.log('return 1')
          return 1;
        } else {
          // console.log('return -1')
          return -1;
        }
      }
      // console.log('return 0')
      return stableArray.indexOf(a) - stableArray.indexOf(b);
      // return stableArrayDic[a] - stableArrayDic[b];
    });

    return array;
  }

  recursiveSort(unorderedArray, orderStack, depth) {
    // console.log('Recursion layer ' + depth.toString().repeat(50))
    // console.log(orderStack)
    // console.log(unorderedArray)

    if (unorderedArray.length === 0 ) { //remember to remove depth condition
      return orderStack;
    }

    var sortedLayer = this.sortLayer(unorderedArray);
    // console.log('sortedlayer')
    // console.log(sortedLayer)

    var filter = [];
    var layerStack = [];
    for (let i = 0; i<sortedLayer.length; i++) {
      if (sortedLayer[i][1] === depth) {
        layerStack.push( { dataEle: sortedLayer[ i ], idx: i } );
        filter.push( i );
      }
    }
    orderStack.push(layerStack);

    var clearedArray = Object.assign([], sortedLayer);
    filter.reverse();
    for (let i=0; i<filter.length; i++) {
      clearedArray.splice( filter[i], 1);
    }

    return this.recursiveSort(clearedArray, orderStack, depth+1);
  }

  sortEntryOrder() {
    var originalOrder = Object.assign([], this.chatAppData.dataOrder);
    var dataOrder = Object.assign([], this.chatAppData.dataOrder);
    // console.log('START PRODUCT')
    // console.log(originalOrder.map( key => {return key.toString() + ' ::: ' + this.chatAppData.dataById[key].content } ))

    const timeTypeArray = ['year','month','day','hour','minute','second'];

    var dataOrderWithIds = dataOrder.map( (dataId) => {
      let dateTimeArray = this.chatAppData.dataById[dataId].datetime_code;
      let precisionIndex = timeTypeArray.indexOf(this.chatAppData.dataById[dataId].datetime_precision);
      return [dateTimeArray, precisionIndex, dataId ];
    });

    // console.log(dataOrderWithIds);

    var temp = Object.assign([], dataOrderWithIds)

    var orderStack = this.recursiveSort(temp, [], -1);
    // console.log('ORDERSTACK')
    // console.log(orderStack);

    orderStack.reverse() // flip to start from the end

    var newDataOrderWithIds = [];

    for (let i = 0; i<orderStack.length; i++) {
      var layerStack = orderStack[ i ];
      if (layerStack.length ===0) {
        continue
      }
      for (let j=0; j<layerStack.length; j++) {
        var dataEle = layerStack[ j ];
        newDataOrderWithIds.splice(dataEle.idx, 0, dataEle.dataEle);
      }
    }

    // console.log('FINAL PRODUCT');
    // console.log(newDataOrderWithIds);

    var newDataOrder = newDataOrderWithIds.map( (val) => {
      return val[2];
    })

    // console.log(newDataOrder.map( key => {return key.toString() + ' ::: ' + this.chatAppData.dataById[key].content } ))
    var trueDiff = this.checkShiftedArray(originalOrder, newDataOrder);
    if (trueDiff > 3) {
      console.log('Potential sorting error')
      return null;
    }

    this.chatAppData.dataOrder = newDataOrder;
  }

  checkShiftedArray(originalArr, newArr) {
    var matchCounter = 0;
    for (let i=0; i<originalArr.length; i++ ) {
      try {
        if (originalArr[i] === newArr[i-1]) {
          matchCounter += 1;
        }
      } catch (err) {
        continue
      }
    }

    for (let i=0; i<originalArr.length; i++ ) {
      try {
        if (originalArr[i] === newArr[i]) {
          matchCounter += 1;
        }
      } catch (err) {
        continue
      }
    }

    for (let i=0; i<originalArr.length; i++ ) {
      try {
        if (originalArr[i] === newArr[i+1]) {
          matchCounter += 1;
        }
      } catch (err) {
        continue
      }
    }

    var trueDiff = originalArr.length - matchCounter
    // console.log('trueDiff counts: '+ trueDiff.toString());
    return trueDiff;
  }

  changeEntryDateTime(dataId, entryContent, precision) {
    this.chatAppData.dataById[dataId].datetime_code = entryContent;
    this.chatAppData.dataById[dataId].datetime_milli = Utility.convertDateTimeToMilli(entryContent);
    this.chatAppData.dataById[dataId].datetime_precision = precision;
    this.chatAppData.modifiedDataList[dataId] = true;
    this.sortEntryOrder();
  }

  handleReorder(start, end) {
    var dataOrder = this.chatAppData.dataOrder;

    dataOrder.move = function (old_index, new_index) {
        if (new_index >= this.length) {
            var k = new_index - this.length;
            while ((k--) + 1) {
                this.push(undefined);
            }
        }
        this.splice(new_index, 0, this.splice(old_index, 1)[0]);
        return this; // for testing purposes
    };

    var newList = dataOrder.move(start,end)
    this.chatAppData.dataOrder = newList;
  }

  generateTimelineMapping(dataById) {
     var dateTimes = [];
     for (let key in dataById) {
       if (dataById.hasOwnProperty(key)) {
               var value = dataById[key];
               dateTimes.push( {dataId: key, time: value.datetime_milli} );
           }
     }

     dateTimes.sort((a, b) => {
    if (a.time === b.time) {
        return 0;
    }
    else {
        return (a.time < b.time) ? -1 : 1;
    }});
     return dateTimes;
   }

  handleActions(action) {
    switch(action.type) {
      case "SET_USERID": {
        this.chatAppData.userId = action.data.userId;
        this.emit("change");
        break;
      }
      case "RECEIVE_DATA": {
        this.chatAppData.dataById = action.data.dataById;
        this.chatAppData.dataOrder = action.data.dataOrder;
        this.chatAppData.modifiedDataList = action.data.modifiedDataList;
        this.chatAppData.timelineMapping = this.generateTimelineMapping(action.data.dataById);
        this.emit("change");
        break;
      }
      case "ADD_ENTRY": {
        this.addEntry(action.idx);
        this.chatAppData.timelineMapping = this.generateTimelineMapping(this.chatAppData.dataById);
        this.emit("change");
        break;
      }
      case "DELETE_ENTRY": {
        this.deleteEntry(action.dataId);
        this.chatAppData.timelineMapping = this.generateTimelineMapping(this.chatAppData.dataById);
        this.emit("change");
        break;
      }
      case "HANDLE_USER_INPUT": {
        this.handleUserInput(action.dataId, action.entryContent);
        this.emit("change");
        break;
      }
      case "CHANGE_ENTRY_DATETIME": {
        this.changeEntryDateTime(action.dataId, action.entryContent, action.precision);
        this.chatAppData.timelineMapping = this.generateTimelineMapping(this.chatAppData.dataById);
        this.emit("change");
        break;
      }
      case "HANDLE_REORDER": {
        var draggingDataId = this.chatAppData.dataOrder[action.start];
        this.handleReorder(action.start, action.end);
        
        // this is used to remove the duplicate element created from the dragula library
        // after there has been dynamic lazy load from scrolling
        if (action.scrolled) {
          var select = document.getElementById(draggingDataId.toString());
          $(select).remove();
        }

        this.emit("change");
        // If the sortEntryOrder reverts the reordered dataOrder back to its original state,
        // dragula will register the change but it won't revert back because the dataOrder didn't change
        // upon emit change
        this.sortEntryOrder();
        this.emit("change")
        break;
      }
      case "PUSH_DATABYID_MEDIA": {
        this.chatAppData.dataById[action.dataId].media.push( action.fileInfo );
        this.emit("change");
        break;
      }
      case "DELETE_MEDIA_FROM_ENTRY": {
        var entryMedia = this.chatAppData.dataById[action.dataId].media;
        var index = null;
        for (let i=0; i<entryMedia.length; i++) {
          if (entryMedia[i].fileName === action.filePath) {
            index = i;
          }
        }

        if (index !== null) {
          entryMedia.splice( index, 1 );
        }
        
        this.emit("change");
        break;
      }
      case "ADD_AI_RESPONSE": {
        this.chatAppData.dataById[action.dataId].ai_response.push( action.response);
        break;
      }
      case "SAVE_SUCCESS": {
        this.chatAppData.modifiedDataList = action.modifiedDataList;
        this.chatAppData.newDataList = [];
        this.chatAppData.deleteDataList = [];
        this.chatAppData.saveerror = '';
        this.emit("change");
        break;
      }
      case "SAVE_FAILED": {
        this.chatAppData.saveerror = action.saveerror;
        this.emit("change");
        break;
      }
      case "VERIFY_EMAIL_MSG": {
        this.chatAppData.saveerror = 'Please verify email in order to continue using this app';
        this.emit("change");
        break;
      }
      default:{
        // console.log('No matching action')
        break;
      }
    }
  }

}

const chatAppStore = new ChatAppStore();
dispatcher.register(chatAppStore.handleActions.bind(chatAppStore));

export default chatAppStore; 