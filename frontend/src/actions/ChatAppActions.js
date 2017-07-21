import dispatcher from "../Dispatcher";
import 'whatwg-fetch';
import * as Utility from '../LibAssist';
import gifshot from 'gifshot';
var guestData = require('./guest.json');

// =============================================== //
// CHATAPP AUTHENTICATION ACTIONS
export function setUsesID(userId) {
  dispatcher.dispatch({
    type: 'SET_USERID',
    data: {
      userId: userId
    }
  })
}

export function authenticateEmail(email, uid, recaptchaKey) {
  fetch('https://murmuring-thicket-60925.herokuapp.com/api/v2/emailauth', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        {
            'email':email,
            'uid':uid,
            'recaptchaKey':recaptchaKey,
        }),
    })
}

export function emailVerification() {
  return fetch('https://api.dropboxapi.com/2/users/get_current_account', {
    method: 'POST',
    headers: {
      Authorization: Utility.authenticate_request(),
    },
  }).then( (response) => {
    return response.json();
  }).then( (dataJSON) => {
    return dataJSON.email_verified;
  })
}

export function verifyEmailMsg() {
  dispatcher.dispatch({
    type: 'VERIFY_EMAIL_MSG',
  })
}

// =============================================== //
// CHATAPP ENTRY DATA FUNCTIONS
export function addEntry(idx) {
  dispatcher.dispatch({
    type: "ADD_ENTRY",
    idx : idx,
  });
}

export function deleteEntry(dataId) {
  dispatcher.dispatch({
    type: "DELETE_ENTRY",
    dataId : dataId,
  });
}

export function handleUserInput(dataId, entryContent) {
  try {
    entryContent = entryContent.target.value;
  } catch (err) {}
  dispatcher.dispatch({
    type: "HANDLE_USER_INPUT",
    dataId : dataId,
    entryContent : entryContent,
  });
}

export function changeEntryDateTime(dataId, entryContent, precision) {
  try {
    entryContent = entryContent.target.value;
  } catch (err) {}
  dispatcher.dispatch({
    type: "CHANGE_ENTRY_DATETIME",
    dataId : dataId,
    entryContent : entryContent,
    precision : precision,
  });
}

export function handleReorder(start, end, scrolled) {
  dispatcher.dispatch({
    type: "HANDLE_REORDER",
    start: start,
    end: end,
    scrolled:scrolled,
  })
}

export function addAiResponse(dataId, response) {
  dispatcher.dispatch({
    type: "ADD_AI_RESPONSE",
    dataId: dataId,
    response: response,
  })
}

// =============================================== //
// CHATAPP UX LOGIC FUNCTIONS

// =============================================== //
// CHATAPP PERSISTENT STORAGE FUNCTIONS
// Download related functions
export function listFolder(filePath) {
  return fetch('https://api.dropboxapi.com/2/files/list_folder', {
    method: 'POST',
    headers: {
      Authorization: Utility.authenticate_request(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      {
          "path": filePath,
          "recursive": false,
          "include_media_info": false,
          "include_deleted": false,
          "include_has_explicit_shared_members": false
      }),
  }).then( (response) => {
    return response;
  })
}

export function createFolder(filePath) {
  return fetch('https://api.dropboxapi.com/2/files/create_folder', {
    method: 'POST',
    headers: {
      Authorization: Utility.authenticate_request(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      {
          "path": filePath,
          "autorename": false
      }),
  }).then( (response) => {
    return response;
  })
}

export function downloadFile(filePath) {
  return fetch('https://content.dropboxapi.com/2/files/download', {
    method: 'POST',
    headers: {
      Authorization: Utility.authenticate_request(),
      "Dropbox-API-Arg": JSON.stringify({"path": filePath}),
    }

  }).then( (response) => {
    return response
  })

}

export function initializeLoadData() {
  if (Utility.authenticate_request() === 'Bearer guest') {
    var data = guestData;
    var dataOrder = data.dataOrder;
    var modifiedDataList = {};
    for (let i=0; i < dataOrder.length; i++){
        modifiedDataList[dataOrder[i]]=false;
    };

    dispatcher.dispatch({ 
      type: 'RECEIVE_DATA', 
      data: {
        dataById : data.dataById,
        dataOrder: data.dataOrder,
        modifiedDataList : modifiedDataList,
      }
    })
    return null;
  }

  emailVerification()
  .then( (verified) => {
    if (verified === true) {
      return listFolder("");
    } else {
      verifyEmailMsg();
    }
  }).then( (response) => {
    return response.json();

  }).then( (filesJSON) => {
    var filesList = filesJSON.entries;

    var journalentriesFolderExist = false;
    var configFolderExist = false;
    var recycleBinExist = false;
    for (let i=0; i<filesList.length; i++) {
      let filefolder = filesList[i];
      if (filefolder.name === 'journalentries') {
        journalentriesFolderExist = true;
      }
      if (filefolder.name === 'config') {
        configFolderExist = true;
      }
      if (filefolder.name === 'recyclebin') {
        recycleBinExist = true;
      }
    }

    if ( journalentriesFolderExist === true ) {
      loadData();
    } else {
      createFolder('/journalentries');
    }

    if ( configFolderExist === false ) {
      createFolder('/config');
    }

    if ( recycleBinExist === false ) {
      createFolder('/recyclebin');
    }

  })
}

export function loadData() {
  listFolder("/journalentries/")
  .then((response) => {
    return response.json()

  }).then((json) => {
    var journalDataBlobs = json.entries;
    var journalList = journalDataBlobs.map( (file) => {
      return parseInt(file.name, 10);
    });
    journalList.sort();
    journalList.reverse();
    return journalList[0];

  }).then((journalname) => {
    return downloadFile('/journalentries/'+journalname)

  }).then( (journaldata) => {
    return journaldata.json()

  }).then((data) => {
    var dataOrder = data.dataOrder;
    var modifiedDataList = {};
    for (let i=0; i < dataOrder.length; i++){
        modifiedDataList[dataOrder[i]]=false;
    };

    dispatcher.dispatch({ 
      type: 'RECEIVE_DATA', 
      data: {
        dataById : data.dataById,
        dataOrder: data.dataOrder,
        modifiedDataList : modifiedDataList,
      }
    })
  });
}

export function downloadMedia(filePath, stream) {
  // downloadPending(filePath)

  if (stream) {
      fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
          method: 'POST',
          headers: {
            Authorization: Utility.authenticate_request(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({"path": filePath})

        }).then( (response) => {
          return response.json();

        }).then( (data) => {
          setMediaSrc(filePath, data.link);
        })

    } else {
      fetch('https://content.dropboxapi.com/2/files/download', {
          method: 'POST',
          headers: {
            Authorization: Utility.authenticate_request(),
            "Dropbox-API-Arg": JSON.stringify({"path": filePath}),
          }

        }).then( (response) => {
        return response.blob();

      }).then( (blob) => {
        return URL.createObjectURL(blob);
        
      }).then( (src) => {
        setMediaSrc(filePath, src);
      })
    }

}

export function downloadPending(filePath) {
  dispatcher.dispatch({
    type: "SET_DOWNLOAD_PENDING",
    filePath: filePath,
  })
}


// Upload related functions
export function uploadFile(filePath, fileData) {
  if (Utility.authenticate_request() === 'Bearer guest') {
    var promise = new Promise((resolve, reject)=>{resolve('Success')})
    return promise
  }

  return fetch('https://content.dropboxapi.com/2/files/upload', {
    method: 'POST',
    headers: {
      Authorization: Utility.authenticate_request(),
      "Dropbox-API-Arg": JSON.stringify(
        {
            "path": filePath,
            "mode": "overwrite",
            "autorename": true,
            "mute": false
        }),
      "Content-Type": "application/octet-stream",
    },
    "body": fileData

  }).then((response) => {
    return 'Success'
  }, (error) => {
    return 'Error'
  })
}

export function b64toblob(b64Data, contentType, sliceSize) {
  contentType = contentType || '';
  sliceSize = sliceSize || 512;

  var byteCharacters = atob(b64Data);
  var byteArrays = [];

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize);

    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    var byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  var blob = new Blob(byteArrays, {type: contentType});
  return blob;
}

export function parseFileName(fileName) {
    var mainFileName = fileName.substr( 0, fileName.indexOf('.') );
    var ext = fileName.substr( fileName.indexOf('.'), fileName.length );
    return [mainFileName, ext];
}

export function returnDim(url) {
    var img = new Image();
    img.src = URL.createObjectURL(url);
    // return { width: img.width , height: img.height }
    img.onload = function() {
                let dimensions = { width: img.width , height: img.height };
                console.log(dimensions)
                return dimensions
            };
}

export function uploadVideo(filePath, file, dataId) {
  var gifFilePath = parseFileName(filePath)[0] + '.gif';

  var videoFile = URL.createObjectURL( file );
  gifshot.createGIF({
      video: [ videoFile ],
      interval: .1,
      numFrames: 10,
      sampleInterval: 10
  }, function (obj) {
      if (!obj.error) {
          var image = obj.image;
          var imageData = image.substr( image.indexOf(',')+1, image.length );
          var imgBlob = b64toblob(imageData, 'image/gif');

          uploadFile(gifFilePath, imgBlob)
          uploadFile(filePath, file)

          setMediaSrc(gifFilePath, URL.createObjectURL(imgBlob));
          setMediaSrc(filePath, videoFile );

          pushDataByIdMedia(dataId, {fileName: gifFilePath, fileType: 'video', realFileName: filePath });
          updateMediaStore();
      }
  })

}

export function uploadMedia(files, dataId) {
  for (let i=files.length-1; i>=0; i--) {
      let file = files[i];
      let name = Utility.encodeDateTime(Utility.currentTimeInArray()) 
      + Math.floor(Math.random()*1000000).toString()
      + parseFileName(file.name)[1];

      let filePath = '/'+name;

      if (file.type.includes('video') === true) {
        uploadVideo(filePath, file, dataId);
        continue
      }
      
      uploadFile(filePath, file)
      .then( (status) => {
        if (status==='Success') {

          // Set file info and media src upon image load to get the dimensions
          var img = new Image();
          img.src = URL.createObjectURL(file);
          img.onload = function() {
                      let dimensions = { width: img.width , height: img.height };

                      pushDataByIdMedia(dataId, {fileName: filePath, fileType: 'photo', dimensions: dimensions });
                      setMediaSrc(filePath, URL.createObjectURL(file));
                  };          
        }
      });

  }

}

export function pushDataByIdMedia(dataId, fileInfo) {
  dispatcher.dispatch({
    type: "PUSH_DATABYID_MEDIA",
    dataId: dataId,
    fileInfo: fileInfo,
  })
}

export function setMediaSrc(filePath, src) {
  dispatcher.dispatch({
    type: "SET_MEDIA_SRC",
    filePath: filePath,
    src: src,
  })
}

export function moveFileToRecycleBin(filePath) {
  if (Utility.authenticate_request() === 'Bearer guest') {
      return null;
    }

  return fetch('https://api.dropboxapi.com/2/files/move', {
    method: 'POST',
    headers: {
      Authorization: Utility.authenticate_request(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      {
          "from_path": filePath,
          "to_path":  "/recyclebin"+filePath,
          "allow_shared_folder": false,
          "autorename": false
      }),
  }).then( (response) => {
    return response;
  })
}

export function moveFileBatchToRecycleBin(filePaths) {
    if (Utility.authenticate_request() === 'Bearer guest') {
      return null;
    }

  var fileMoves = [];
  for (var key in filePaths) {
    if (filePaths.hasOwnProperty(key)) {
      let fileName = filePaths[key].fileName;
      fileMoves.push({
        "from_path": fileName,
        "to_path": "/recyclebin"+fileName})

      let realFileName = filePaths[key].realFileName;
      if (typeof realFileName !== 'undefined') {
        fileMoves.push({
          "from_path": realFileName,
          "to_path": "/recyclebin"+realFileName})
      }
    }
  }

  return fetch('https://api.dropboxapi.com/2/files/move_batch', {
    method: 'POST',
    headers: {
      Authorization: Utility.authenticate_request(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      {
          "entries": fileMoves
      }),
  }).then( (response) => {
    return response;
  })
}


export function deleteMediaFromEntry(dataId, filePath) {
  dispatcher.dispatch({
    type: "DELETE_MEDIA_FROM_ENTRY",
    dataId: dataId,
    filePath: filePath,
  })
  updateMediaStore();
  moveFileToRecycleBin(filePath);
}

export function updateMediaStore(){
  dispatcher.dispatch({
    type: "UPDATE_MEDIAFILES",
  });
}

export function userSave(state) {
    var dataOrder = state.dataOrder;
    var dataById = state.dataById;

    var jsonPacket = JSON.stringify({
     'dataOrder': dataOrder,
     'dataById': dataById, });

    var d = new Date();
    var time = d.getTime()

    uploadFile('/journalentries/'+time, jsonPacket)

}