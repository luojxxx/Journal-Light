  export function authenticate_request(){
    var id_token = localStorage.getItem('id_token');
    var authHeader = 'Bearer ' + id_token;
    return authHeader
  };

  export function removeFromArrayByValue(array, value) {
    var index = array.indexOf(value);
    if (index >= 0) {
      array.splice(index, 1);
    }
    return array;
  }

  export function currentTimeInMill() {
    var currentTime = new Date();
    return currentTime.getTime();
  }

  export function currentTimeInArray(){
      var d = new Date();
      var year = d.getFullYear();
      var month = d.getMonth()+1;
      var day = d.getDate();
      var hour = d.getHours();
      var min = d.getMinutes();
      var sec = d.getSeconds();
      var datetime_array = [year, month, day, hour, min, sec];
      return datetime_array;
  }

  export function fillZero(num) {
      var numStr = num.toString();
      if (numStr.length === 1){
          return '0'+numStr;
      }
      else{
          return numStr;
      }
  }

  export function encodeDateTime(dateTimeArray){
      var dateTimeCode = '';

      for (let ele=0; ele < dateTimeArray.length; ele++){
        dateTimeCode += this.fillZero( dateTimeArray[ele] );
      }

      // return parseInt(dateTimeCode, 10);
      return dateTimeCode;
  }

  export function convertDateTimeToMilli(dateTimeArray){
      var arr = ['','','','','',''];

      for (let ele=0; ele < dateTimeArray.length; ele++){
        arr[ele] = fillZero( dateTimeArray[ele] );
      }

      var dateTimeIso = +new Date(arr[0]+'-'+arr[1]+'-'+arr[2]+'T'+arr[3]+':'+arr[4]+':'+arr[5]+'+0000');

      return dateTimeIso;
  }

  export function parseDateTime(dateTimeCode) {
    try {
      var codeStr = dateTimeCode.toString();
      var year = codeStr.substring(0,4);
      var month = codeStr.substring(4,6);
      var day = codeStr.substring(6,8);
      var hour = codeStr.substring(8,10);
      var min = codeStr.substring(10,12);
      var sec = codeStr.substring(12,14);
      var result = [year, month, day, hour, min, sec].map(function(val){
        return parseInt(val, 10);
      });
      return result;

    } catch(err) {
      console.log(err);
      return ' ';
    }
}

  export function hoursMilitaryAMPM(hour) {
    if (hour === 0) {
      return [12,'am'];
    }
    if (hour === 12) {
      return [12,'pm'];
    }
    if (hour < 12) {
      return [hour,'am'];
    } else {
      return [hour-12, 'pm'];
    }
  }

  // export function hoursAMPMMilitary(hour) {
  //   if (hour === '12am') {
  //     return 0;
  //   }
  //   if (hour === '12pm') {
  //     return 12;
  //   }
  // }

  export function monthDictionary(idx) {
    var months = {
      1:'January',
      2:'February',
      3:'March',
      4:'April',
      5:'May',
      6:'June',
      7:'July',
      8:'August',
      9:'September',
      10:'October',
      11:'November',
      12:'December'
    };
    return months[idx];
  }

  export function dayExtension(val) {
    var ext = '';
    switch ( val ) {

      case 1:
      case 21:
      case 31:
      ext = 'st';
      break;

      case 2:
      case 22:
      ext = 'nd';
      break;

      case 3:
      case 23:
      ext = 'rd';
      break;

      default:
      ext = 'th';
    }
    return ext;
  }

  export function prettyDateTime(datetime_array, precision){
    try {

      var prettyList = [
        datetime_array[0].toString(),
        ' '+monthDictionary( datetime_array[1] ),
        ' the '+datetime_array[2].toString()+dayExtension(datetime_array[2]),
        ' at '+hoursMilitaryAMPM(datetime_array[3])[0].toString(),
        ':'+this.fillZero(datetime_array[4]).toString(),
        ':'+this.fillZero(datetime_array[5]).toString()
        ];

      var stopIdx = 0;
      if (precision === 'none') {
        return '';
      } else {
        const timeTypeArray = ['none','year','month','day','hour','minute','second'];
        stopIdx = timeTypeArray.indexOf(precision);
      }
      let selectedPrettyDate = '';
      for (let i=0; i<stopIdx; i++) {
        selectedPrettyDate += prettyList[i];
      }

      if (precision === 'hour' || precision === 'minute' | precision === 'second') {
        selectedPrettyDate += hoursMilitaryAMPM(datetime_array[3])[1];
      }

      return selectedPrettyDate;

    } catch(err){
      console.log('prettydate error');
      return ' ';
    }
  }


export function closest (num, arr) {
                var mid;
                var lo = 0;
                var hi = arr.length - 1;
                while (hi - lo > 1) {
                    mid = Math.floor ((lo + hi) / 2);
                    if (arr[mid] < num) {
                        lo = mid;
                    } else {
                        hi = mid;
                    }
                }
                if (num - arr[lo] <= arr[hi] - num) {
                    return arr[lo];
                }
                return arr[hi];
            }