$(function () {
  $.contextMenu({
    selector: '.upload_button',
    callback: function (key, options) {
      var m = 'clicked: ' + key;
      (window.console && console.log(m)) || alert(m);
    },
    items: {
      share: { name: '共享' },
      download: { name: '下載' },
      star: { name: '標示星號' },
      rename: { name: '重新命名' },
      move: { name: '移動' },
      copy: { name: '複製' },
      delete: { name: '刪除' }
    }
  });

  $('.upload_button').on('click', function (e) {
    console.log('clicked', this);
  });
});
var vm;
$(function () {
  vm = new Vue({
    el: '#app',
    data: {},
    mounted() {
      // document.getElementById('app').addEventListener('contextmenu', e => {
      //   console.log(e);
      //   e.preventDefault();
      //   return false;
      // });
    }
  });
});
