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
        fileList: [
          {
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
          }
        ],
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
    displayfolderNav() {
      if (this.folderNav.length > 3) {
        const newArray = this.folderNav.slice(1, -1);
        const newDisplayfolderNav = [].concat(this.folderNav);
        newDisplayfolderNav.splice(1, this.folderNav.length - 2, newArray);
        return newDisplayfolderNav;
      } else {
        return this.folderNav;
      }
    },
    storeUsagePercentage() {
      return (this.storage_usage / this.storage_size) * 100;
    },
    displayFileList() {
      return this.currentFolder.fileList;
    },
    searchFilter() {
      if (this.searchInput != '') {
        const result = this.searchFile(this.dataStorage.rootFolder, this.searchInput);
        return result;
      } else return [];
    }
  },
  watch: {
    currentFolder: {
      handler(newVal, oldVal) {
        if (oldVal && !this.preventRecord) {
          if (
            newVal.id == 'root' ||
            newVal.id == 'trash' ||
            newVal.id == 'search' ||
            newVal.id == 'star'
          ) {
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
        if (
          newVal.id == 'root' ||
          newVal.id == 'trash' ||
          newVal.id == 'search' ||
          newVal.id == 'star'
        ) {
          if (oldVal) {
            this.lastSection = this.currentSection;
          }
          this.currentSection = newVal.id;
        }
        this.$nextTick(() => {
          if (this.lastSection) {
            $('.table_wrapper').removeClass(this.lastSection);
          }
          $('.table_wrapper').addClass(this.currentSection);
        });
      }
    },
    dragoverItem() {
      //TODO: 目前class被改動就會影響到contextmenu的判斷，應將contextmenu改為vue內data驅動
      this.$nextTick(() => {
        if (this.lastSection) {
          $('.table_wrapper').removeClass(this.lastSection);
        }
        $('.table_wrapper').addClass(this.currentSection);
      });
    },
    searchFilter(newVal) {
      const result = {
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
    searchFile(folder, searchInput) {
      const result = [];
      const filter = folder.fileList.filter(item => item.name.includes(searchInput));
      filter.forEach(item => {
        result.push(item);
      });
      const childrenFolder = folder.fileList.filter(item => item.fileType == 'folder');
      //是否有下一層
      if (childrenFolder.length > 0) {
        childrenFolder.forEach(item => {
          //回傳結果再push進result
          this.searchFile(item, searchInput).forEach(item => {
            result.push(item);
          });
        });
      }
      return result;
    },
    filterStarFile(folder) {
      const result = [];
      const filter = folder.fileList.filter(item => item.isStar === true);
      filter.forEach(item => {
        result.push(item);
      });
      const childrenFolder = folder.fileList.filter(item => item.fileType == 'folder');
      //是否有下一層
      if (childrenFolder.length > 0) {
        childrenFolder.forEach(item => {
          //回傳結果再push進result
          this.filterStarFile(item).forEach(item => {
            result.push(item);
          });
        });
      }
      return result;
    },
    handleClickOutside(e, el) {
      const elName = el.getAttribute('el-name');
      this[`${elName}Visible`] = false;
    },
    handleListItemDblClick(item) {
      if (item.isInTrash) return;
      if (item.fileType === 'folder') {
        this.currentFolder = item;
      } else {
        //TODO 待新增檔案預覽功能
      }
    },
    handleNavToFolder(target) {
      if (target === this.currentFolder) return;
      //找到物件nav index 刪除它後面紀錄
      const targetIndex = this.folderNav.findIndex(item => item.id == target.id);
      this.folderNav.splice(targetIndex);
      //防止watch時把此動作記錄下來
      this.preventRecord = true;
      this.currentFolder = target;
      this.preventRecord = false;
    },
    createFolder(name = '新文件夾') {
      this.sidebarDropdownVisible = false;
      const newFolder = {
        id: this._creatUuid(),
        name,
        editable: true,
        isStar: false,
        modifiedTime: new Date().getTime(),
        size: '',
        ownerId: 'me',
        fileType: 'folder',
        fileList: [],
        path: this.currentFolder.path + '/' + this.currentFolder.id
      };
      this.currentFolder.fileList.push(newFolder);
      //save to local
      this.saveToLocalStorage();
      this.newFolderName = '新文件夾';
    },
    //拖曳開始，設定目前拖曳中元素
    dragStart(e, item) {
      if (!this.currentFolder.editable) return;
      this.isDraggingItem = item;
      $('.table_wrapper').addClass('draggedTable');
    },

    //拖曳結束，清除拖曳及目標元素
    dragEnd(e, item) {
      this.isDraggingItem = null;
      this.dragoverItem = null;
      $('.table_wrapper').removeClass('draggedTable');
    },
    //設定目前拖曳目標
    dragOver(targetElem) {
      if (!this.currentFolder.editable) return;
      if (
        !this.dragoverItem &&
        !targetElem.fileList.includes(this.isDraggingItem) &&
        targetElem != this.isDraggingItem
      ) {
        this.dragoverItem = targetElem;
      }
    },
    //若拖曳離開目前目標元素，則將目標元素設定為null
    dragLeave() {
      if (!this.currentFolder.editable) return;
      this.dragoverItem = null;
    },
    //拖曳檔案被移動至目標元素中
    drop(e, targetElem) {
      if (!this.currentFolder.editable) return;
      let srcItem = this.isDraggingItem;
      let targetItem = this.dragoverItem;
      //判斷是否為Drive上既有檔案，若true則進行搬移
      if (srcItem) {
        //若拖曳檔案與目標檔案相同則return
        if (srcItem == targetItem || !targetItem) return;
        else this.moveDriveFile(srcItem, targetItem);
        targetItem = null;
        return;
      }
      //判斷是否為Drive上既有檔案，若false則將檔案存至local並將檔案資訊加入隸屬檔案夾物件
      this.handleUploadFile(e.dataTransfer.files, targetElem);
      this.dragoverItem = null;
    },
    uploadByInput(e) {
      if (!this.currentFolder.editable) return;
      this.handleUploadFile(e.target.files, this.currentFolder);
      this.sidebarDropdownVisible = false;
    },
    //處理上傳檔案
    handleUploadFile(file, targetFolder) {
      for (let i = 0; i < file.length; i++) {
        const receiveFile = file[i];
        if (receiveFile.type == '') {
          alert(`「${receiveFile.name}」格式錯誤，目前暫不支援上傳此種格式。`);
          return;
        }
        if (receiveFile.size > 3890704) {
          alert(
            `「${receiveFile.name}」檔案太大囉，由於是存入localStorage，建議測試檔案小於3.8MB。`
          );
          return;
        }
        this.convertFile(receiveFile)
          .then(data => {
            const fileId = this._creatUuid();
            const fileName = receiveFile.name;
            const newFile = {
              id: fileId,
              name: fileName,
              isStar: false,
              modifiedTime: receiveFile.lastModified,
              size: receiveFile.size,
              ownerId: 'me',
              fileType: this.checkFileType(receiveFile.type),
              path: this.currentFolder.path + '/' + this.currentFolder.id
            };
            targetFolder.fileList.push(newFile);
            this.saveToLocal(data, fileId, fileName);
            this.storage_usage = JSON.stringify(localStorage).length * 0.77;
            //save to local
            this.saveToLocalStorage();
          })
          .catch(err => {
            console.log('err', err);
          });
      }
    },
    //Drive檔案搬移
    moveDriveFile(srcItem, targetItem) {
      if (srcItem.fileType != 'folder' && targetItem.fileType == 'folder') {
        const indexOfItem = this.currentFolder.fileList.indexOf(srcItem);
        targetItem.fileList.push(srcItem);
        this.currentFolder.fileList.splice(indexOfItem, 1);
        //save to local
        this.saveToLocalStorage();
      } else if (srcItem.fileType == 'folder' && targetItem.fileType == 'folder') {
        const indexInList = this.currentFolder.fileList.indexOf(srcItem);
        //加入
        targetItem.fileList.push(srcItem);
        //移出
        this.currentFolder.fileList.splice(indexInList, 1);
        //save to local
        this.saveToLocalStorage();
      }
    },
    checkFileType(fileType) {
      console.log(fileType);
      if (fileType.includes('mp4')) return 'mp4';
      if (fileType.includes('image')) return 'image';
      if (
        fileType.includes('msword') ||
        fileType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      )
        return 'msword';
      if (fileType.includes('pdf')) return 'pdf';
      else return 'default';
    },
    convertFile(file) {
      return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.onerror = () => {
          reject(reader.error);
        };
        reader.readAsDataURL(file);
      });
    },
    saveToLocal(data, fileId, fileName) {
      const newFile = { data, fileId, fileName };
      const stringData = JSON.stringify(newFile);
      localStorage.setItem(fileId, stringData);
    },
    download(item = this.rightClickItem) {
      if (this.currentSection == 'trash') return;
      if (item.fileType == 'folder') return;
      const decodeData = JSON.parse(localStorage.getItem(item.id));
      var a = document.createElement('a');
      a.href = decodeData.data;
      a.setAttribute('download', item.name);
      a.click();
    },
    activeUploadInput() {
      if (this.currentSection != 'root') {
        this.currentFolder = this.dataStorage.rootFolder;
      }
      this.$refs.fileInput.click();
    },
    moveToTrash(file = this.rightClickItem) {
      if (this.currentSection == 'trash') return;
      file.isInTrash = true;
      this.dataStorage.trash.fileList.push(file);
      const delFile = this.currentFolder.fileList.find(item => item.id == file.id);
      const delFileIndex = this.currentFolder.fileList.indexOf(delFile);
      this.currentFolder.fileList.splice(delFileIndex, 1);
      //save to local
      this.saveToLocalStorage();
      this.saveToLocalTrash();
    },
    deleteFile(file = this.rightClickItem) {
      const delFileIndex = this.dataStorage.trash.fileList.indexOf(file);
      this.dataStorage.trash.fileList.splice(delFileIndex, 1);
      localStorage.removeItem(file.id);
      this.storage_usage = JSON.stringify(localStorage).length * 0.77;
      //save to local
      this.saveToLocalTrash();
    },
    recycleItem(item = this.rightClickItem) {
      if (this.currentSection != 'trash') return;
      ///讀取path
      const pathArray = item.path.split('/');
      //刪除根目錄及前方空白
      pathArray.splice(0, 2);
      var targetFolder;
      if (pathArray.length == 0) {
        //檔案於根目錄
        targetFolder = this.dataStorage.rootFolder;
      } else {
        //檔案於子目錄
        var current = this.dataStorage.rootFolder;
        for (let i = 0; i < pathArray.length; i++) {
          const childFolder = current.fileList.find(item => item.id == pathArray[i]);
          current = childFolder;
        }
        targetFolder = current;
      }
      item.isInTrash = false;
      targetFolder.fileList.push(item);
      const indexOfDelItem = this.dataStorage.trash.fileList.indexOf(item);
      this.dataStorage.trash.fileList.splice(indexOfDelItem, 1);
      //save to local
      this.saveToLocalStorage();
      this.saveToLocalTrash();
    },
    _creatUuid() {
      var d = Date.now();
      if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now(); //use high-precision timer if available
      }
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
    },
    fileContextMenu(item) {
      //將右鍵點擊物件紀錄
      this.rightClickItem = item;
    },
    addStar(item = this.rightClickItem) {
      item.isStar = !item.isStar;
      this.saveToLocalStorage();
      this.saveToLocalTrash();
      if (item.isStar) {
        this.dataStorage.star.fileList.push(item);
      } else {
        const target = this.dataStorage.star.fileList;
        const findObj = target.find(obj => obj.id == item.id);
        const index = target.indexOf(findObj);
        target.splice(index, 1);
      }
    },
    starPage() {
      this.currentFolder = this.dataStorage.star;
    },
    saveToLocalStorage() {
      //save to LocalStorage
      const storeData = JSON.stringify(this.dataStorage.rootFolder.fileList);
      localStorage.setItem('myStorage', storeData);
    },
    saveToLocalTrash() {
      //save to Local Trash
      const trashData = JSON.stringify(this.dataStorage.trash.fileList);
      localStorage.setItem('myTrash', trashData);
    }
  },
  filters: {
    timeFormat(timestamp) {
      let date = new Date(timestamp);
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      let hours = '0' + date.getHours();
      let minutes = '0' + date.getMinutes();
      let seconds = '0' + date.getSeconds();
      return `${year}-${month}-${day} ${hours.substr(-2)}:${minutes.substr(-2)}:${seconds.substr(
        -2
      )}`;
    },
    sizeFormat(bytes, decimals = 1) {
      if (isNaN(bytes) || !bytes) return '';
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
  },
  created() {
    this.currentFolder = this.dataStorage.rootFolder;
    this.folderNav.push(this.dataStorage.rootFolder);
    this.storage_usage = JSON.stringify(localStorage).length * 0.77;
    const starFile = this.filterStarFile(this.dataStorage.rootFolder);
    this.dataStorage.star.fileList = starFile;
    const getStoreData = JSON.parse(localStorage.getItem('myStorage')) || [
      {
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
      }
    ];
    const getTrashData = JSON.parse(localStorage.getItem('myTrash')) || [];
    this.dataStorage.rootFolder.fileList = getStoreData;
    this.dataStorage.trash.fileList = getTrashData;
  },
  mounted() {},
  directives: {
    'click-outside': {
      bind: function (el, binding, vnode) {
        el.clickOutsideEvent = function (event) {
          const elName = el.getAttribute('el-name');
          if (
            !(el == event.target || el.contains(event.target)) &&
            elName != event.target.getAttribute('bind-el')
          ) {
            vnode.context[binding.expression](event, el);
          }
        };
        document.body.addEventListener('click', el.clickOutsideEvent);
        document.body.addEventListener('contextmenu', el.clickOutsideEvent);
      },
      unbind: function (el) {
        document.body.removeEventListener('click', el.clickOutsideEvent);
        document.body.removeEventListener('contextmenu', el.clickOutsideEvent);
      }
    }
  }
});

//雲端硬碟 右鍵選單
$(function () {
  $.contextMenu({
    selector: '.table_contextmenu.root',
    items: {
      upload: {
        name: '上傳檔案',
        callback() {
          vm.activeUploadInput();
        }
      },
      createNewFolder: {
        name: '新增資料夾',
        callback() {
          $('#newFolderModal').modal('show');
        }
      }
    }
  });
});

//檔案夾右鍵選單
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
        callback() {
          vm.addStar();
        }
      },
      moveToTrash: {
        name: '移至垃圾桶',
        callback() {
          vm.moveToTrash();
        }
      }
    }
  });
});
//檔案右鍵選單
$(function () {
  $.contextMenu({
    selector: '.table_contextmenu.root .doc_type',
    items: {
      download: {
        name: '下載',
        callback() {
          vm.download();
        }
      },
      star: {
        name: '標示星號',
        callback() {
          vm.addStar();
        }
      },
      moveToTrash: {
        name: '移至垃圾桶',
        callback() {
          vm.moveToTrash();
        }
      }
    }
  });
});

//垃圾桶檔案及檔案夾右鍵選單
$(function () {
  $.contextMenu({
    selector: '.table_contextmenu.trash .doc_type , .table_contextmenu.trash .folder_type',
    items: {
      recycle: {
        name: '還原',
        callback() {
          vm.recycleItem();
        }
      },
      delete: {
        name: '永久刪除',
        callback() {
          $('#deleteModal').modal('show');
        }
      }
    }
  });
});
