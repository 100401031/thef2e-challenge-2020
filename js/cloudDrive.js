"use strict";function _typeof(e){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}var vm=new Vue({el:"#app",data:{sidebarDropdownVisible:!1,fileNavDropdownVisible:!1,storage_size:5e6,storage_usage:0,searchInput:"",searchResult:[],dataStorage:{rootFolder:{id:"root",name:"我的雲端硬碟",editable:!0,modifiedTime:"",size:"",ownerId:"me",fileType:"folder",fileList:[{id:"#1-f",name:"預設資料夾",editable:!0,isStar:!1,modifiedTime:1598047432044,size:"",ownerId:"me",fileType:"folder",childrenFolder:[],fileList:[],path:"/root"}],path:""},trash:{id:"trash",name:"垃圾桶",editable:!1,modifiedTime:"",size:"",ownerId:"me",fileType:"folder",fileList:[]},star:{id:"star",name:"已加星號",editable:!1,modifiedTime:"",size:"",ownerId:"me",fileType:"folder",fileList:[]}},starFileId:[],lastSection:null,currentSection:null,currentFolder:null,preFolderNav:[],folderNav:[],preventRecord:!1,dragoverItem:null,rightClickItem:null,isDraggingItem:null,newFolderName:"新文件夾",fileDropdownVisible:!1},computed:{displayfolderNav:function(){if(3<this.folderNav.length){var e=this.folderNav.slice(1,-1),t=[].concat(this.folderNav);return t.splice(1,this.folderNav.length-2,e),t}return this.folderNav},storeUsagePercentage:function(){return this.storage_usage/this.storage_size*100},displayFileList:function(){return this.currentFolder.fileList},searchFilter:function(){return""==this.searchInput?[]:this.searchFile(this.dataStorage.rootFolder,this.searchInput)}},watch:{currentFolder:{handler:function(e,t){var i=this;t&&!this.preventRecord&&("root"!=e.id&&"trash"!=e.id&&"search"!=e.id&&"star"!=e.id||(this.folderNav=[]),this.folderNav.push(e),e.editable?this.editableFolder=!0:this.editableFolder=!1),"root"!=e.id&&"trash"!=e.id&&"search"!=e.id&&"star"!=e.id||(t&&(this.lastSection=this.currentSection),this.currentSection=e.id),this.$nextTick(function(){i.lastSection&&$(".table_wrapper").removeClass(i.lastSection),$(".table_wrapper").addClass(i.currentSection)})}},dragoverItem:function(){var e=this;this.$nextTick(function(){e.lastSection&&$(".table_wrapper").removeClass(e.lastSection),$(".table_wrapper").addClass(e.currentSection)})},searchFilter:function(e){var t={id:"search",name:"搜尋結果",editable:!1,modifiedTime:"",size:"",ownerId:"me",fileType:"folder",fileList:e,path:""};this.currentFolder=t,""==this.searchInput&&(this.currentFolder=this.dataStorage.rootFolder)}},methods:{searchFile:function(e,t){var i=this,r=[];e.fileList.filter(function(e){return e.name.includes(t)}).forEach(function(e){r.push(e)});var o=e.fileList.filter(function(e){return"folder"==e.fileType});return 0<o.length&&o.forEach(function(e){i.searchFile(e,t).forEach(function(e){r.push(e)})}),r},filterStarFile:function(e){var t=this,i=[];e.fileList.filter(function(e){return!0===e.isStar}).forEach(function(e){i.push(e)});var r=e.fileList.filter(function(e){return"folder"==e.fileType});return 0<r.length&&r.forEach(function(e){t.filterStarFile(e).forEach(function(e){i.push(e)})}),i},handleClickOutside:function(e,t){var i=t.getAttribute("el-name");this["".concat(i,"Visible")]=!1},handleListItemDblClick:function(e){e.isInTrash||"folder"===e.fileType&&(this.currentFolder=e)},handleNavToFolder:function(t){var e;t!==this.currentFolder&&(e=this.folderNav.findIndex(function(e){return e.id==t.id}),this.folderNav.splice(e),this.preventRecord=!0,this.currentFolder=t,this.preventRecord=!1)},createFolder:function(e){var t=0<arguments.length&&void 0!==e?e:"新文件夾";this.sidebarDropdownVisible=!1;var i={id:this._creatUuid(),name:t,editable:!0,isStar:!1,modifiedTime:(new Date).getTime(),size:"",ownerId:"me",fileType:"folder",fileList:[],path:this.currentFolder.path+"/"+this.currentFolder.id};this.currentFolder.fileList.push(i),this.saveToLocalStorage(),this.newFolderName="新文件夾"},dragStart:function(e,t){this.currentFolder.editable&&(this.isDraggingItem=t,$(".table_wrapper").addClass("draggedTable"))},dragEnd:function(){this.isDraggingItem=null,this.dragoverItem=null,$(".table_wrapper").removeClass("draggedTable")},dragOver:function(e){this.currentFolder.editable&&(this.dragoverItem||e.fileList.includes(this.isDraggingItem)||e==this.isDraggingItem||(this.dragoverItem=e))},dragLeave:function(){this.currentFolder.editable&&(this.dragoverItem=null)},drop:function(e,t){if(this.currentFolder.editable){var i=this.isDraggingItem,r=this.dragoverItem;if(i){if(i==r||!r)return;return this.moveDriveFile(i,r),void(r=null)}this.handleUploadFile(e.dataTransfer.files,t),this.dragoverItem=null}},uploadByInput:function(e){this.currentFolder.editable&&(this.handleUploadFile(e.target.files,this.currentFolder),this.sidebarDropdownVisible=!1)},handleUploadFile:function(t,a){for(var n=this,e=0;e<t.length;e++){var i=function(e){var o=t[e];return""==o.type?(alert("「".concat(o.name,"」格式錯誤，目前暫不支援上傳此種格式。")),{v:void 0}):3890704<o.size?(alert("「".concat(o.name,"」檔案太大囉，由於是存入localStorage，建議測試檔案小於3.8MB。")),{v:void 0}):void n.convertFile(o).then(function(e){var t=n._creatUuid(),i=o.name,r={id:t,name:i,isStar:!1,modifiedTime:o.lastModified,size:o.size,ownerId:"me",fileType:n.checkFileType(o.type),dataURL:e};a.fileList.push(r),n.saveToLocal(e,t,i),n.storage_usage=.77*JSON.stringify(localStorage).length,n.saveToLocalStorage()}).catch(function(e){})}(e);if("object"===_typeof(i))return i.v}},moveDriveFile:function(e,t){var i,r;"folder"!=e.fileType&&"folder"==t.fileType?(i=this.currentFolder.fileList.indexOf(e),t.fileList.push(e),this.currentFolder.fileList.splice(i,1),this.saveToLocalStorage()):"folder"==e.fileType&&"folder"==t.fileType&&(r=this.currentFolder.fileList.indexOf(e),t.fileList.push(e),this.currentFolder.fileList.splice(r,1),this.saveToLocalStorage())},checkFileType:function(e){return e.includes("image")?"image":e.includes("msword")||e.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document")?"msword":e.includes("pdf")?"pdf":"default"},convertFile:function(r){return new Promise(function(e,t){var i=new FileReader;i.onload=function(){e(i.result)},i.onerror=function(){t(i.error)},i.readAsDataURL(r)})},saveToLocal:function(e,t,i){var r={data:e,fileId:t,fileName:i},o=JSON.stringify(r);localStorage.setItem(t,o)},download:function(e){var t,i,r=0<arguments.length&&void 0!==e?e:this.rightClickItem;"trash"!=this.currentSection&&"folder"!=r.fileType&&(t=JSON.parse(localStorage.getItem(r.id)),(i=document.createElement("a")).href=t.data,i.setAttribute("download",r.name),i.click())},activeUploadInput:function(){"root"!=this.currentSection&&(this.currentFolder=this.dataStorage.rootFolder),this.$refs.fileInput.click()},moveToTrash:function(e){var t,i,r=0<arguments.length&&void 0!==e?e:this.rightClickItem;"trash"!=this.currentSection&&(r.isInTrash=!0,this.dataStorage.trash.fileList.push(r),t=this.currentFolder.fileList.find(function(e){return e.id=r.id}),i=this.currentFolder.fileList.indexOf(t),this.currentFolder.fileList.splice(i,1),this.saveToLocalStorage(),this.saveToLocalTrash())},deleteFile:function(e){var t=0<arguments.length&&void 0!==e?e:this.rightClickItem,i=this.dataStorage.trash.fileList.indexOf(t);this.dataStorage.trash.fileList.splice(i,1),this.saveToLocalTrash()},recycleItem:function(e){var t=0<arguments.length&&void 0!==e?e:this.rightClickItem;if("trash"==this.currentSection){var i,r=t.path.split("/");if(r.splice(0,2),0==r.length)i=this.dataStorage.rootFolder;else{for(var o=this.dataStorage.rootFolder,a=0;a<r.length;a++)!function(t){o=o.fileList.find(function(e){return e.id==r[t]})}(a);i=o}t.isInTrash=!1,i.fileList.push(t);var n=this.dataStorage.trash.fileList.indexOf(t);this.dataStorage.trash.fileList.splice(n,1),this.saveToLocalStorage(),this.saveToLocalTrash()}},_creatUuid:function(){var i=Date.now();return"undefined"!=typeof performance&&"function"==typeof performance.now&&(i+=performance.now()),"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){var t=(i+16*Math.random())%16|0;return i=Math.floor(i/16),("x"===e?t:3&t|8).toString(16)})},fileContextMenu:function(e){this.rightClickItem=e},addStar:function(e){var t,i,r,o=0<arguments.length&&void 0!==e?e:this.rightClickItem;o.isStar=!o.isStar,this.saveToLocalStorage(),this.saveToLocalTrash(),o.isStar?this.dataStorage.star.fileList.push(o):(i=(t=this.dataStorage.star.fileList).find(function(e){return e.id==o.id}),r=t.indexOf(i),t.splice(r,1))},starPage:function(){this.currentFolder=this.dataStorage.star},saveToLocalStorage:function(){var e=JSON.stringify(this.dataStorage.rootFolder.fileList);localStorage.setItem("myStorage",e)},saveToLocalTrash:function(){var e=JSON.stringify(this.dataStorage.trash.fileList);localStorage.setItem("myTrash",e)}},filters:{timeFormat:function(e){var t=new Date(e),i=t.getFullYear(),r=t.getMonth()+1,o=t.getDate(),a="0"+t.getHours(),n="0"+t.getMinutes(),l="0"+t.getSeconds();return"".concat(i,"-").concat(r,"-").concat(o," ").concat(a.substr(-2),":").concat(n.substr(-2),":").concat(l.substr(-2))},sizeFormat:function(e,t){var i=1<arguments.length&&void 0!==t?t:1;if(isNaN(e)||!e)return"";if(0===e)return"0 Bytes";var r=i<0?0:i,o=Math.floor(Math.log(e)/Math.log(1024));return parseFloat((e/Math.pow(1024,o)).toFixed(r))+" "+["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"][o]}},created:function(){this.currentFolder=this.dataStorage.rootFolder,this.folderNav.push(this.dataStorage.rootFolder),this.storage_usage=.77*JSON.stringify(localStorage).length;var e=this.filterStarFile(this.dataStorage.rootFolder);this.dataStorage.star.fileList=e;var t=JSON.parse(localStorage.getItem("myStorage"))||[{id:"#1-f",name:"預設資料夾",editable:!0,isStar:!1,modifiedTime:1598047432044,size:"",ownerId:"me",fileType:"folder",childrenFolder:[],fileList:[],path:"/root"}],i=JSON.parse(localStorage.getItem("myTrash"))||[];this.dataStorage.rootFolder.fileList=t,this.dataStorage.trash.fileList=i},mounted:function(){},directives:{"click-outside":{bind:function(i,r,o){i.clickOutsideEvent=function(e){var t=i.getAttribute("el-name");i==e.target||i.contains(e.target)||t==e.target.getAttribute("bind-el")||o.context[r.expression](e,i)},document.body.addEventListener("click",i.clickOutsideEvent),document.body.addEventListener("contextmenu",i.clickOutsideEvent)},unbind:function(e){document.body.removeEventListener("click",e.clickOutsideEvent),document.body.removeEventListener("contextmenu",e.clickOutsideEvent)}}}});$(function(){$.contextMenu({selector:".table_contextmenu.root",items:{upload:{name:"上傳檔案",callback:function(){vm.activeUploadInput()}},createNewFolder:{name:"新增資料夾",callback:function(){$("#newFolderModal").modal("show")}}}})}),$(function(){$.contextMenu({selector:".table_contextmenu.root .folder_type",items:{star:{name:"標示星號",callback:function(){vm.addStar()}},moveToTrash:{name:"移至垃圾桶",callback:function(){vm.moveToTrash()}}}})}),$(function(){$.contextMenu({selector:".table_contextmenu.root .doc_type",items:{download:{name:"下載",callback:function(){vm.download()}},star:{name:"標示星號",callback:function(){vm.addStar()}},moveToTrash:{name:"移至垃圾桶",callback:function(){vm.moveToTrash()}}}})}),$(function(){$.contextMenu({selector:".table_contextmenu.trash .doc_type , .table_contextmenu.trash .folder_type",items:{recycle:{name:"還原",callback:function(){vm.recycleItem()}},delete:{name:"永久刪除",callback:function(){$("#deleteModal").modal("show")}}}})});
//# sourceMappingURL=cloudDrive.js.map
