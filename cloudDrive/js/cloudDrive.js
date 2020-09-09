"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var vm;
vm = new Vue({
  el: '#app',
  data: {
    sidebarDropdownVisible: false,
    fileNavDropdownVisible: false,
    storage_size: 5000000,
    storage_usage: 0,
    searchInput: '',
    searchResult: [],
    dataStorage: {
      rootFolder: {
        id: 'root',
        name: '我的雲端硬碟',
        editable: true,
        modifiedTime: '',
        size: '',
        ownerId: 'me',
        fileType: 'folder',
        fileList: [{
          id: '#1-f',
          name: 'Hello World!',
          editable: true,
          isStar: false,
          modifiedTime: 1598047432044,
          size: '',
          ownerId: 'me',
          fileType: 'folder',
          childrenFolder: [],
          fileList: [],
          path: '/root'
        }],
        path: ''
      },
      trash: {
        id: 'trash',
        name: '垃圾桶',
        editable: false,
        modifiedTime: '',
        size: '',
        ownerId: 'me',
        fileType: 'folder',
        fileList: []
      },
      star: {
        id: 'star',
        name: '已加星號',
        editable: false,
        modifiedTime: '',
        size: '',
        ownerId: 'me',
        fileType: 'folder',
        fileList: []
      }
    },
    starFileId: [],
    lastSection: null,
    currentSection: null,
    currentFolder: null,
    preFolderNav: [],
    folderNav: [],
    preventRecord: false,
    dragoverItem: null,
    rightClickItem: null,
    isDraggingItem: null,
    newFolderName: '新文件夾',
    fileDropdownVisible: false
  },
  computed: {
    displayfolderNav: function displayfolderNav() {
      if (this.folderNav.length > 3) {
        var newArray = this.folderNav.slice(1, -1);
        var newDisplayfolderNav = [].concat(this.folderNav);
        newDisplayfolderNav.splice(1, this.folderNav.length - 2, newArray);
        return newDisplayfolderNav;
      } else {
        return this.folderNav;
      }
    },
    storeUsagePercentage: function storeUsagePercentage() {
      return this.storage_usage / this.storage_size * 100;
    },
    displayFileList: function displayFileList() {
      return this.currentFolder.fileList;
    },
    searchFilter: function searchFilter() {
      if (this.searchInput != '') {
        var result = this.searchFile(this.dataStorage.rootFolder, this.searchInput);
        return result;
      } else return [];
    }
  },
  watch: {
    currentFolder: {
      handler: function handler(newVal, oldVal) {
        var _this = this;

        if (oldVal && !this.preventRecord) {
          if (newVal.id == 'root' || newVal.id == 'trash' || newVal.id == 'search' || newVal.id == 'star') {
            this.folderNav = [];
            this.folderNav.push(newVal);
          } else {
            //將資料夾路徑紀錄至folderNav
            this.folderNav.push(newVal);
          }

          if (newVal.editable) {
            this.editableFolder = true;
          } else {
            this.editableFolder = false;
          }
        }

        if (newVal.id == 'root' || newVal.id == 'trash' || newVal.id == 'search' || newVal.id == 'star') {
          if (oldVal) {
            this.lastSection = this.currentSection;
          }

          this.currentSection = newVal.id;
        }

        this.$nextTick(function () {
          if (_this.lastSection) {
            $('.table_wrapper').removeClass(_this.lastSection);
          }

          $('.table_wrapper').addClass(_this.currentSection);
        });
      }
    },
    dragoverItem: function dragoverItem() {
      var _this2 = this;

      //TODO: 目前class被改動就會影響到contextmenu的判斷，應將contextmenu改為vue內data驅動
      this.$nextTick(function () {
        if (_this2.lastSection) {
          $('.table_wrapper').removeClass(_this2.lastSection);
        }

        $('.table_wrapper').addClass(_this2.currentSection);
      });
    },
    searchFilter: function searchFilter(newVal) {
      var result = {
        id: 'search',
        name: '搜尋結果',
        editable: false,
        modifiedTime: '',
        size: '',
        ownerId: 'me',
        fileType: 'folder',
        fileList: newVal,
        path: ''
      };
      this.currentFolder = result;

      if (this.searchInput == '') {
        this.currentFolder = this.dataStorage.rootFolder;
      }
    }
  },
  methods: {
    searchFile: function searchFile(folder, searchInput) {
      var _this3 = this;

      var filter = folder.fileList.filter(function (item) {
        return item.name.toLowerCase().includes(searchInput.toLowerCase());
      });

      var result = _toConsumableArray(filter);

      var childrenFolder = folder.fileList.filter(function (item) {
        return item.fileType == 'folder';
      }); //是否有下一層

      if (childrenFolder.length > 0) {
        childrenFolder.forEach(function (item) {
          //回傳結果再push進result
          _this3.searchFile(item, searchInput).forEach(function (item) {
            result.push(item);
          });
        });
      }

      return result;
    },
    filterStarFile: function filterStarFile(folder) {
      var _this4 = this;

      var filter = folder.fileList.filter(function (item) {
        return item.isStar === true;
      });

      var result = _toConsumableArray(filter);

      var childrenFolder = folder.fileList.filter(function (item) {
        return item.fileType == 'folder';
      }); //是否有下一層

      if (childrenFolder.length > 0) {
        childrenFolder.forEach(function (item) {
          //回傳結果再push進result
          _this4.filterStarFile(item).forEach(function (item) {
            result.push(item);
          });
        });
      }

      return result;
    },
    handleClickOutside: function handleClickOutside(e, el) {
      var elName = el.getAttribute('el-name');
      this["".concat(elName, "Visible")] = false;
    },
    handleListItemDblClick: function handleListItemDblClick(item) {
      if (item.isInTrash) return;

      if (item.fileType === 'folder') {
        this.currentFolder = item;
      } else {//TODO 待新增檔案預覽功能
      }
    },
    handleNavToFolder: function handleNavToFolder(target) {
      if (target === this.currentFolder) return; //找到物件nav index 刪除它後面紀錄

      var targetIndex = this.folderNav.findIndex(function (item) {
        return item.id == target.id;
      });
      this.folderNav.splice(targetIndex); //防止watch時把此動作記錄下來

      this.preventRecord = true;
      this.currentFolder = target;
      this.preventRecord = false;
    },
    createFolder: function createFolder() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '新文件夾';
      this.sidebarDropdownVisible = false;
      var newFolder = {
        id: this._creatUuid(),
        name: name,
        editable: true,
        isStar: false,
        modifiedTime: new Date().getTime(),
        size: '',
        ownerId: 'me',
        fileType: 'folder',
        fileList: [],
        path: this.currentFolder.path + '/' + this.currentFolder.id
      };
      this.currentFolder.fileList.push(newFolder); //save to local

      this.saveToLocalStorage();
      this.newFolderName = '新文件夾';
    },
    //拖曳開始，設定目前拖曳中元素
    dragStart: function dragStart(e, item) {
      if (!this.currentFolder.editable) return;
      this.isDraggingItem = item;
      $('.table_wrapper').addClass('draggedTable');
    },
    //拖曳結束，清除拖曳及目標元素
    dragEnd: function dragEnd(e, item) {
      this.isDraggingItem = null;
      this.dragoverItem = null;
      $('.table_wrapper').removeClass('draggedTable');
    },
    //設定目前拖曳目標
    dragOver: function dragOver(targetElem) {
      if (!this.currentFolder.editable) return;

      if (!this.dragoverItem && !targetElem.fileList.includes(this.isDraggingItem) && targetElem != this.isDraggingItem) {
        this.dragoverItem = targetElem;
      }
    },
    //若拖曳離開目前目標元素，則將目標元素設定為null
    dragLeave: function dragLeave() {
      if (!this.currentFolder.editable) return;
      this.dragoverItem = null;
    },
    //拖曳檔案被移動至目標元素中
    drop: function drop(e, targetElem) {
      if (!this.currentFolder.editable) return;
      var srcItem = this.isDraggingItem;
      var targetItem = this.dragoverItem; //判斷是否為Drive上既有檔案，若true則進行搬移

      if (srcItem) {
        //若拖曳檔案與目標檔案相同則return
        if (srcItem == targetItem || !targetItem) return;else this.moveDriveFile(srcItem, targetItem);
        targetItem = null;
        return;
      } //判斷是否為Drive上既有檔案，若false則將檔案存至local並將檔案資訊加入隸屬檔案夾物件


      this.handleUploadFile(e.dataTransfer.files, targetElem);
      this.dragoverItem = null;
    },
    uploadByInput: function uploadByInput(e) {
      if (!this.currentFolder.editable) return;
      this.handleUploadFile(e.target.files, this.currentFolder);
      this.sidebarDropdownVisible = false;
    },
    //處理上傳檔案
    handleUploadFile: function handleUploadFile(file, targetFolder) {
      var _this5 = this;

      var _loop = function _loop(i) {
        var receiveFile = file[i];

        if (receiveFile.type == '') {
          alert("\u300C".concat(receiveFile.name, "\u300D\u683C\u5F0F\u932F\u8AA4\uFF0C\u76EE\u524D\u66AB\u4E0D\u652F\u63F4\u4E0A\u50B3\u6B64\u7A2E\u683C\u5F0F\u3002"));
          return {
            v: void 0
          };
        }

        if (receiveFile.size > 3890704) {
          alert("\u300C".concat(receiveFile.name, "\u300D\u6A94\u6848\u592A\u5927\u56C9\uFF0C\u7531\u65BC\u662F\u5B58\u5165localStorage\uFF0C\u5EFA\u8B70\u6E2C\u8A66\u6A94\u6848\u5C0F\u65BC3.8MB\u3002"));
          return {
            v: void 0
          };
        }

        _this5.convertFile(receiveFile).then(function (data) {
          var fileId = _this5._creatUuid();

          var fileName = receiveFile.name;
          var newFile = {
            id: fileId,
            name: fileName,
            isStar: false,
            modifiedTime: receiveFile.lastModified,
            size: receiveFile.size,
            ownerId: 'me',
            fileType: _this5.checkFileType(receiveFile.type),
            path: _this5.currentFolder.path + '/' + _this5.currentFolder.id
          };
          targetFolder.fileList.push(newFile);

          _this5.saveToLocal(data, fileId, fileName);

          _this5.storage_usage = JSON.stringify(localStorage).length * 0.77; //save to local

          _this5.saveToLocalStorage();
        }).catch(function (err) {
          console.log('err', err);
        });
      };

      for (var i = 0; i < file.length; i++) {
        var _ret = _loop(i);

        if (_typeof(_ret) === "object") return _ret.v;
      }
    },
    //Drive檔案搬移
    moveDriveFile: function moveDriveFile(srcItem, targetItem) {
      if (srcItem.fileType != 'folder' && targetItem.fileType == 'folder') {
        var indexOfItem = this.currentFolder.fileList.indexOf(srcItem);
        targetItem.fileList.push(srcItem);
        this.currentFolder.fileList.splice(indexOfItem, 1); //save to local

        this.saveToLocalStorage();
      } else if (srcItem.fileType == 'folder' && targetItem.fileType == 'folder') {
        var indexInList = this.currentFolder.fileList.indexOf(srcItem); //加入

        targetItem.fileList.push(srcItem); //移出

        this.currentFolder.fileList.splice(indexInList, 1); //save to local

        this.saveToLocalStorage();
      }
    },
    checkFileType: function checkFileType(fileType) {
      console.log(fileType);
      if (fileType.includes('mp4')) return 'mp4';
      if (fileType.includes('image')) return 'image';
      if (fileType.includes('msword') || fileType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) return 'msword';
      if (fileType.includes('pdf')) return 'pdf';else return 'default';
    },
    convertFile: function convertFile(file) {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();

        reader.onload = function () {
          resolve(reader.result);
        };

        reader.onerror = function () {
          reject(reader.error);
        };

        reader.readAsDataURL(file);
      });
    },
    saveToLocal: function saveToLocal(data, fileId, fileName) {
      var newFile = {
        data: data,
        fileId: fileId,
        fileName: fileName
      };
      var stringData = JSON.stringify(newFile);
      localStorage.setItem(fileId, stringData);
    },
    download: function download() {
      var item = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.rightClickItem;
      if (this.currentSection == 'trash') return;
      if (item.fileType == 'folder') return;
      var decodeData = JSON.parse(localStorage.getItem(item.id));
      var a = document.createElement('a');
      a.href = decodeData.data;
      a.setAttribute('download', item.name);
      a.click();
    },
    activeUploadInput: function activeUploadInput() {
      if (this.currentSection != 'root') {
        this.currentFolder = this.dataStorage.rootFolder;
      }

      this.$refs.fileInput.click();
    },
    moveToTrash: function moveToTrash() {
      var file = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.rightClickItem;
      if (this.currentSection == 'trash') return;
      file.isInTrash = true;
      this.dataStorage.trash.fileList.push(file);
      var delFile = this.currentFolder.fileList.find(function (item) {
        return item.id == file.id;
      });
      var delFileIndex = this.currentFolder.fileList.indexOf(delFile);
      this.currentFolder.fileList.splice(delFileIndex, 1); //save to local

      this.saveToLocalStorage();
      this.saveToLocalTrash();
    },
    deleteFile: function deleteFile() {
      var file = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.rightClickItem;
      var delFileIndex = this.dataStorage.trash.fileList.indexOf(file);
      this.dataStorage.trash.fileList.splice(delFileIndex, 1);
      localStorage.removeItem(file.id);
      this.storage_usage = JSON.stringify(localStorage).length * 0.77; //save to local

      this.saveToLocalTrash();
    },
    recycleItem: function recycleItem() {
      var item = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.rightClickItem;
      if (this.currentSection != 'trash') return; ///讀取path

      var pathArray = item.path.split('/'); //刪除根目錄及前方空白

      pathArray.splice(0, 2);
      var targetFolder;

      if (pathArray.length == 0) {
        //檔案於根目錄
        targetFolder = this.dataStorage.rootFolder;
      } else {
        //檔案於子目錄
        var current = this.dataStorage.rootFolder;

        var _loop2 = function _loop2(i) {
          var childFolder = current.fileList.find(function (item) {
            return item.id == pathArray[i];
          });
          current = childFolder;
        };

        for (var i = 0; i < pathArray.length; i++) {
          _loop2(i);
        }

        targetFolder = current;
      }

      item.isInTrash = false;
      targetFolder.fileList.push(item);
      var indexOfDelItem = this.dataStorage.trash.fileList.indexOf(item);
      this.dataStorage.trash.fileList.splice(indexOfDelItem, 1); //save to local

      this.saveToLocalStorage();
      this.saveToLocalTrash();
    },
    _creatUuid: function _creatUuid() {
      var d = Date.now();

      if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now(); //use high-precision timer if available
      }

      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : r & 0x3 | 0x8).toString(16);
      });
    },
    fileContextMenu: function fileContextMenu(item) {
      this.rightClickItem = item;
    },
    addStar: function addStar() {
      var item = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.rightClickItem;
      item.isStar = !item.isStar;
      this.saveToLocalStorage();
      this.saveToLocalTrash();

      if (item.isStar) {
        this.dataStorage.star.fileList.push(item);
      } else {
        var target = this.dataStorage.star.fileList;
        var findObj = target.find(function (obj) {
          return obj.id == item.id;
        });
        var index = target.indexOf(findObj);
        target.splice(index, 1);
      }
    },
    starPage: function starPage() {
      var starFile = this.filterStarFile(this.dataStorage.rootFolder);
      this.dataStorage.star.fileList = starFile;
      this.currentFolder = this.dataStorage.star;
    },
    saveToLocalStorage: function saveToLocalStorage() {
      //save to LocalStorage
      var storeData = JSON.stringify(this.dataStorage.rootFolder.fileList);
      localStorage.setItem('myStorage', storeData);
    },
    saveToLocalTrash: function saveToLocalTrash() {
      //save to Local Trash
      var trashData = JSON.stringify(this.dataStorage.trash.fileList);
      localStorage.setItem('myTrash', trashData);
    }
  },
  filters: {
    timeFormat: function timeFormat(timestamp) {
      var date = new Date(timestamp);
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();
      var hours = '0' + date.getHours();
      var minutes = '0' + date.getMinutes();
      var seconds = '0' + date.getSeconds();
      return "".concat(year, "-").concat(month, "-").concat(day, " ").concat(hours.substr(-2), ":").concat(minutes.substr(-2), ":").concat(seconds.substr(-2));
    },
    sizeFormat: function sizeFormat(bytes) {
      var decimals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      if (isNaN(bytes) || !bytes) return '';
      if (bytes === 0) return '0 Bytes';
      var k = 1024;
      var dm = decimals < 0 ? 0 : decimals;
      var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      var i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
  },
  created: function created() {
    this.currentFolder = this.dataStorage.rootFolder;
    this.folderNav.push(this.dataStorage.rootFolder);
    this.storage_usage = JSON.stringify(localStorage).length * 0.77;
    var starFile = this.filterStarFile(this.dataStorage.rootFolder);
    this.dataStorage.star.fileList = starFile;
    var getStoreData = JSON.parse(localStorage.getItem('myStorage')) || [{
      id: '#1-f',
      name: 'Hello World!',
      editable: true,
      isStar: false,
      modifiedTime: 1598047432044,
      size: '',
      ownerId: 'me',
      fileType: 'folder',
      childrenFolder: [],
      fileList: [],
      path: '/root'
    }];
    var getTrashData = JSON.parse(localStorage.getItem('myTrash')) || [];
    this.dataStorage.rootFolder.fileList = getStoreData;
    this.dataStorage.trash.fileList = getTrashData;
  },
  mounted: function mounted() {},
  directives: {
    'click-outside': {
      bind: function bind(el, binding, vnode) {
        el.clickOutsideEvent = function (event) {
          var elName = el.getAttribute('el-name');

          if (!(el == event.target || el.contains(event.target)) && elName != event.target.getAttribute('bind-el')) {
            vnode.context[binding.expression](event, el);
          }
        };

        document.body.addEventListener('click', el.clickOutsideEvent);
        document.body.addEventListener('contextmenu', el.clickOutsideEvent);
      },
      unbind: function unbind(el) {
        document.body.removeEventListener('click', el.clickOutsideEvent);
        document.body.removeEventListener('contextmenu', el.clickOutsideEvent);
      }
    }
  }
}); //雲端硬碟 右鍵選單

$(function () {
  $.contextMenu({
    selector: '.table_contextmenu.root',
    items: {
      upload: {
        name: '上傳檔案',
        callback: function callback() {
          vm.activeUploadInput();
        }
      },
      createNewFolder: {
        name: '新增資料夾',
        callback: function callback() {
          $('#newFolderModal').modal('show');
        }
      }
    }
  });
}); //檔案夾右鍵選單

$(function () {
  $.contextMenu({
    selector: '.table_contextmenu.root .folder_type',
    items: {
      // share: { name: '共享' },
      // download: {
      //   name: '下載',
      //   callback() {
      //     vm.download();
      //   }
      // },
      star: {
        name: '標示星號',
        callback: function callback() {
          vm.addStar();
        }
      },
      moveToTrash: {
        name: '移至垃圾桶',
        callback: function callback() {
          vm.moveToTrash();
        }
      }
    }
  });
}); //檔案右鍵選單

$(function () {
  $.contextMenu({
    selector: '.table_contextmenu.root .doc_type',
    items: {
      download: {
        name: '下載',
        callback: function callback() {
          vm.download();
        }
      },
      star: {
        name: '標示星號',
        callback: function callback() {
          vm.addStar();
        }
      },
      moveToTrash: {
        name: '移至垃圾桶',
        callback: function callback() {
          vm.moveToTrash();
        }
      }
    }
  });
}); //垃圾桶檔案及檔案夾右鍵選單

$(function () {
  $.contextMenu({
    selector: '.table_contextmenu.trash .doc_type , .table_contextmenu.trash .folder_type',
    items: {
      recycle: {
        name: '還原',
        callback: function callback() {
          vm.recycleItem();
        }
      },
      delete: {
        name: '永久刪除',
        callback: function callback() {
          $('#deleteModal').modal('show');
        }
      }
    }
  });
});
//# sourceMappingURL=cloudDrive.js.map
