"use strict";

// This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player = null;

window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
  player = new YT.Player('yt-iframe-player', {
    height: '0',
    width: '0',
    videoId: 'H7pOrQEnc3c',
    playerVars: {
      controls: 0
    },
    events: {
      onReady: vm.onPlayerReady,
      onStateChange: vm.onPlayerStateChange
    }
  });
};

var vm;
$(function () {
  vm = new Vue({
    el: '#app',
    data: {
      currentPlayList: {},
      playingPlayList: null,
      currentSong: null,
      isCued: false,
      isPlaying: false,
      isPause: false,
      isBuffering: false,
      isEnded: false,
      currentTime: 0,
      durationTime: 0,
      loadedFraction: 0,
      playingTimer: null,
      loadingTimer: null,
      sidebarHide: false,
      playerState: null,
      screenWidth: document.body.clientWidth,
      listPauseHover: false,
      volume: 50,
      preVolume: null,
      randomMode: false,
      randomPreviousSong: [],
      favoriteList: [],
      favoritePlaylist: {
        title: '我的最愛',
        song: []
      },
      playList: {// '#pl-1': {
        //   title: '周杰倫金曲',
        //   song: [
        //     {
        //       title: '蝸牛',
        //       artist: '周杰倫',
        //       album: '范特西',
        //       videoId: 'H7pOrQEnc3c',
        //       coverImgFileName: 'jay_chou.jpg'
        //     },
        //     {
        //       title: '世界末日',
        //       artist: '周杰倫',
        //       album: '范特西',
        //       videoId: 'NDFULbHgL6E',
        //       coverImgFileName: 'jay_chou.jpg'
        //     },
        //     {
        //       title: '晴天',
        //       artist: '周杰倫',
        //       album: '葉惠美',
        //       videoId: 'DYptgVvkVLQ',
        //       coverImgFileName: 'jay_chou.jpg'
        //     }
        //   ]
        // },
        // '#pl-2': {
        //   title: '張震嶽精選',
        //   song: [
        //     {
        //       title: '思念是一種病',
        //       artist: '張震嶽',
        //       album: 'OK',
        //       videoId: '9ei1PUmDz98',
        //       coverImgFileName: 'Ayal_Komod.png'
        //     },
        //     {
        //       title: '愛我別走',
        //       artist: '張震嶽',
        //       album: '秘密基地',
        //       videoId: 'zPeMFCDPgKE',
        //       coverImgFileName: 'Ayal_Komod.png'
        //     },
        //     {
        //       title: '自由',
        //       artist: '張震嶽',
        //       album: '秘密基地',
        //       videoId: '_dsyAjwf620',
        //       coverImgFileName: 'Ayal_Komod.png'
        //     }
        //   ]
        // }
      }
    },
    watch: {
      playerState: function playerState(newVal) {
        this.isBuffering = false;
        this.isEnded = false;
        this.isCued = false;

        if (newVal == YT.PlayerState.CUED) {
          this.isCued = true;
        } else if (newVal == YT.PlayerState.PLAYING) {
          this.isPlaying = true;
          this.isPause = false;
        } else if (newVal == YT.PlayerState.PAUSED) {
          this.isPause = true;
          this.isPlaying = false;
        } else if (newVal == YT.PlayerState.ENDED) {
          this.isEnded = true;
          this.playNextSong();
        } else if (newVal == YT.PlayerState.BUFFERING) {
          this.isBuffering = true;
        } else {
          this.isPause = false;
          this.isPlaying = false;
        }
      },
      isPlaying: function isPlaying(newVal) {
        if (newVal) {
          this.setPlayerTimer();
          this.durationTime = player.getDuration();
        } else {
          this.clearPlayerTimer();
        }
      },
      playingPlayList: function playingPlayList(newVal, oldVal) {
        if (newVal != oldVal) {
          this.randomPreviousSong = [];
        }
      }
    },
    computed: {
      cdRotate: function cdRotate() {
        return (this.isPlaying || this.isPause) && !this.isEnded;
      },
      playPercentage: function playPercentage() {
        return parseFloat((this.currentTime / this.durationTime).toFixed(4)) || 0;
      },
      loadingPercentage: function loadingPercentage() {
        return parseFloat(this.loadedFraction.toFixed(3));
      },
      currentPlayListSong: function currentPlayListSong() {
        return this.currentPlayList.song || [];
      },
      isCurrentPlayFavorite: function isCurrentPlayFavorite() {
        var _this = this;

        if (this.currentSong) return this.favoriteList.some(function (item) {
          return item.videoId == _this.currentSong.videoId;
        });else return false;
      }
    },
    methods: {
      onPlayerReady: function onPlayerReady() {
        this.volume = player.getVolume();
      },
      setVolume: function setVolume(e) {
        this.volume = e.target.value;
        player.setVolume(this.volume);
      },
      muteVolume: function muteVolume() {
        if (this.volume > 0) {
          this.preVolume = this.volume;
          this.volume = 0;
        } else if (this.volume < 1 && this.preVolume) {
          this.volume = this.preVolume;
          this.preVolume = null;
        }

        player.setVolume(this.volume);
      },
      onPlayerStateChange: function onPlayerStateChange(event) {
        this.playerState = event.data;
      },
      setCurrentPlaylist: function setCurrentPlaylist(key) {
        if (key === 'favorite') {
          this.currentPlayList = this.favoritePlaylist;
          return;
        }

        this.currentPlayList = this.playList[key];
      },
      setCurrentSong: function setCurrentSong(songObj) {
        this.currentSong = songObj;
        player.cueVideoById({
          videoId: this.currentSong.videoId
        });
        this.currentTime = 0;
        this.durationTime = 0;
        this.loadedFraction = 0;
      },
      playCurrentSong: function playCurrentSong(songObj) {
        this.setCurrentSong(songObj);
        this.setCdCoverImg(songObj.coverImgFileName);
        this.playingPlayList = this.currentPlayList;
        player.playVideo();
      },
      playNextSong: function playNextSong() {
        if (this.randomMode) {
          //存取曾播放之歌曲讓使用者能播放上一首
          this.randomPreviousSong.push(this.currentSong);
          this.playRandomSong();
          return;
        } //抓取現在索引值，確認是否為最後一首，處理true/false不同邏輯


        var currentIndex = this.currentPlayList.song.indexOf(this.currentSong);
        var currentListLength = this.currentPlayList.song.length;

        if (currentIndex + 1 === currentListLength) {
          //若為最後一首，則播放清單第一首
          this.playCurrentSong(this.currentPlayList.song[0]);
        } else {
          this.playCurrentSong(this.currentPlayList.song[currentIndex + 1]);
        }
      },
      playPreviousSong: function playPreviousSong() {
        if (this.randomMode) {
          //若隨機播放紀錄無上一首則播放目前歌曲
          var preSongArrayLength = this.randomPreviousSong.length;

          if (preSongArrayLength === 0) {
            player.seekTo(0);
          } else {
            //播放隨機播放紀錄上一首，並從陣列中將移除
            this.playCurrentSong(this.randomPreviousSong[preSongArrayLength - 1]);
            this.randomPreviousSong.splice(-1, 1);
          }

          return;
        } //抓取現在索引值，確認是否為第一首，處理true/false不同邏輯，並播放下一索引歌曲


        var currentIndex = this.currentPlayList.song.indexOf(this.currentSong);
        var lastSongIndex = this.currentPlayList.song.length - 1; //若為第一首

        if (currentIndex === 0) {
          this.playCurrentSong(this.currentPlayList.song[lastSongIndex]);
        } else {
          this.playCurrentSong(this.currentPlayList.song[currentIndex - 1]);
        } // playCurrentSong();

      },
      playRandomSong: function playRandomSong() {
        var currentIndex = this.currentPlayList.song.indexOf(this.currentSong);
        var currentListLength = this.currentPlayList.song.length;

        var randomSongIndex = function randomSongIndex() {
          var randomIndex = Math.floor(Math.random() * currentListLength);
          if (randomIndex === currentIndex) return randomSongIndex();else return randomIndex;
        };

        this.playCurrentSong(this.currentPlayList.song[randomSongIndex()]);
      },
      toggleRandomMode: function toggleRandomMode() {
        this.randomMode = !this.randomMode;
        this.randomPreviousSong = [];
      },
      setCdCoverImg: function setCdCoverImg(imageName) {
        var style = "url('./image/albumCover/".concat(imageName, "')");
        document.getElementById('cd').style.backgroundImage = style;
      },
      setPlayerTimer: function setPlayerTimer() {
        var _this2 = this;

        this.currentTime = player.getCurrentTime();
        this.loadedFraction = player.getVideoLoadedFraction();
        this.playingTimer = setInterval(function () {
          if (!_this2.buffer) {
            _this2.currentTime = player.getCurrentTime();
          }
        }, 1000 / 29);
        this.loadingTimer = setInterval(function () {
          _this2.loadedFraction = player.getVideoLoadedFraction();
        }, 5000);
      },
      clearPlayerTimer: function clearPlayerTimer() {
        clearInterval(this.playingTimer);
        clearInterval(this.loadingTimer);
      },
      handleCollapse: function handleCollapse() {
        this.sidebarHide = !this.sidebarHide;
      },
      changeCurrentTime: function changeCurrentTime(e) {
        var _this3 = this;

        this.buffer = setTimeout(function () {
          clearTimeout(_this3.buffer);
          _this3.buffer = null;
        }, 1000);
        this.currentTime = e.target.value;
        player.seekTo(e.target.value);
      },
      handlePlayBtn: function handlePlayBtn() {
        if (this.isPause || this.isEnded) {
          player.playVideo();
        } else {
          player.pauseVideo();
        }
      },
      addToFavorite: function addToFavorite(songObj) {
        var alreadyInList = this.favoriteList.find(function (item) {
          return item.videoId == songObj.videoId;
        });

        if (alreadyInList) {
          var index = this.favoriteList.indexOf(alreadyInList);
          this.favoriteList.splice(index, 1);
        } else {
          this.favoriteList.push(songObj);
        }

        var favoriteListJson = JSON.stringify(this.favoriteList);
        localStorage.setItem('favoriteList', favoriteListJson);
      },
      isListSongFavorite: function isListSongFavorite(songObj) {
        return this.favoriteList.some(function (item) {
          return item.videoId == songObj.videoId;
        });
      }
    },
    filters: {
      timeFormat: function timeFormat(time) {
        //將秒數轉換成mm:ss格式字串並回傳
        var min = parseInt(time / 60) || 0;
        var sec = parseInt(time) % 60 || 0;
        return "".concat(min, ":").concat(sec > 9 ? sec : '0' + sec);
      }
    },
    created: function created() {
      var _this4 = this;

      var localFavoriteList = JSON.parse(localStorage.getItem('favoriteList')) || [];
      this.favoriteList = localFavoriteList;
      this.favoritePlaylist.song = this.favoriteList;
      $.getJSON('./json/playlist.json', function (data) {
        _this4.playList = data;

        _this4.setCurrentPlaylist(Object.keys(_this4.playList)[0]);
      });
    }
  });
});
//# sourceMappingURL=musicPlayer.js.map
