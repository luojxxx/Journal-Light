import { EventEmitter } from "events";
import dispatcher from "../Dispatcher";
import loading from '../icons/loadingblank.png';

class MediaStore extends EventEmitter {
  constructor() {
    super()
    this.chatAppData = {
      dataMedia: {},
    }
  }

  getMedia(fileName, size) {
    try {
      var file = this.chatAppData.dataMedia[fileName];
      let src = file[size];

      if (src === 'pending') {
        return 'pending';
      } else {
        return this.chatAppData.dataMedia[fileName][size];
      }

    } catch (err) {
      return loading;
    }
  }

  handleActions(action) {
    switch(action.type) {
      case "SET_DOWNLOAD_PENDING": {
        this.chatAppData.dataMedia[action.filePath] = {};
        this.chatAppData.dataMedia[action.filePath]['thumbnail'] = 'pending';
        this.chatAppData.dataMedia[action.filePath]['fullsize'] = 'pending';
        break;
      }
      case "SET_MEDIA_SRC": {
        this.chatAppData.dataMedia[action.filePath] = {};
        this.chatAppData.dataMedia[action.filePath]['thumbnail'] = action.src;
        this.chatAppData.dataMedia[action.filePath]['fullsize'] = action.src;
        this.emit("change");
        break;
      }
      case "UPDATE_MEDIAFILES": {
        this.emit("change");
        break;
      }
      default:{
        // console.log('No matching action');
        break;
      }
    }
  }

}

const mediaStore = new MediaStore();
mediaStore.setMaxListeners(30);
dispatcher.register(mediaStore.handleActions.bind(mediaStore));

export default mediaStore;
