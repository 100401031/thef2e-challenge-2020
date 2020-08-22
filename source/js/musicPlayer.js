// This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('yt-iframe-player', {
    height: '0',
    width: '0',
    videoId: 'H7pOrQEnc3c',
    playerVars: { controls: 0 },
    events: {
      onReady: vm.onPlayerReady,
      onStateChange: vm.onPlayerStateChange
    }
  });
}

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
      playList: {
        // '#pl-1': {
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
      playerState(newVal) {
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
      isPlaying(newVal) {
        if (newVal) {
          this.setPlayerTimer();
          this.durationTime = player.getDuration();
        } else {
          this.clearPlayerTimer();
        }
      },
      playingPlayList(newVal, oldVal) {
        if (newVal != oldVal) {
          this.randomPreviousSong = [];
        }
      }
    },
    computed: {
      cdRotate() {
        return (this.isPlaying || this.isPause) && !this.isEnded;
      },
      playPercentage() {
        return parseFloat((this.currentTime / this.durationTime).toFixed(4)) || 0;
      },
      loadingPercentage() {
        return parseFloat(this.loadedFraction.toFixed(3));
      },
      currentPlayListSong() {
        return this.currentPlayList.song || [];
      },
      isCurrentPlayFavorite() {
        if (this.currentSong)
          return this.favoriteList.some(item => item.videoId == this.currentSong.videoId);
        else return false;
      }
    },
    methods: {
      onPlayerReady() {
        this.volume = player.getVolume();
      },
      setVolume(e) {
        this.volume = e.target.value;
        player.setVolume(this.volume);
      },
      muteVolume() {
        if (this.volume > 0) {
          this.preVolume = this.volume;
          this.volume = 0;
        } else if (this.volume < 1 && this.preVolume) {
          this.volume = this.preVolume;
          this.preVolume = null;
        }
        player.setVolume(this.volume);
      },
      onPlayerStateChange(event) {
        this.playerState = event.data;
      },
      setCurrentPlaylist(key) {
        if (key === 'favorite') {
          const favoritePlaylist = {
            title: '我的最愛',
            song: this.favoriteList
          };
          this.currentPlayList = favoritePlaylist;
          return;
        }
        this.currentPlayList = this.playList[key];
      },
      setCurrentSong(songObj) {
        this.currentSong = songObj;
        player.cueVideoById({
          videoId: this.currentSong.videoId
        });
        this.currentTime = 0;
        this.durationTime = 0;
        this.loadedFraction = 0;
      },
      playCurrentSong(songObj) {
        this.setCurrentSong(songObj);
        this.setCdCoverImg(songObj.coverImgFileName);
        this.playingPlayList = this.currentPlayList;
        player.playVideo();
      },
      playNextSong() {
        if (this.randomMode) {
          //存取曾播放之歌曲讓使用者能播放上一首
          this.randomPreviousSong.push(this.currentSong);
          this.playRandomSong();
          return;
        }
        //抓取現在索引值，確認是否為最後一首，處理true/false不同邏輯
        const currentIndex = this.currentPlayList.song.indexOf(this.currentSong);
        const currentListLength = this.currentPlayList.song.length;
        if (currentIndex + 1 === currentListLength) {
          //若為最後一首，則播放清單第一首
          this.playCurrentSong(this.currentPlayList.song[0]);
        } else {
          this.playCurrentSong(this.currentPlayList.song[currentIndex + 1]);
        }
      },
      playPreviousSong() {
        if (this.randomMode) {
          //若隨機播放紀錄無上一首則播放目前歌曲
          const preSongArrayLength = this.randomPreviousSong.length;
          if (preSongArrayLength === 0) {
            player.seekTo(0);
          } else {
            //播放隨機播放紀錄上一首，並從陣列中將移除
            this.playCurrentSong(this.randomPreviousSong[preSongArrayLength - 1]);
            this.randomPreviousSong.splice(-1, 1);
          }
          return;
        }
        //抓取現在索引值，確認是否為第一首，處理true/false不同邏輯，並播放下一索引歌曲
        const currentIndex = this.currentPlayList.song.indexOf(this.currentSong);
        const lastSongIndex = this.currentPlayList.song.length - 1;
        //若為第一首
        if (currentIndex === 0) {
          this.playCurrentSong(this.currentPlayList.song[lastSongIndex]);
        } else {
          this.playCurrentSong(this.currentPlayList.song[currentIndex - 1]);
        }
        // playCurrentSong();
      },
      playRandomSong() {
        const currentIndex = this.currentPlayList.song.indexOf(this.currentSong);
        const currentListLength = this.currentPlayList.song.length;
        const randomSongIndex = () => {
          let randomIndex = Math.floor(Math.random() * currentListLength);
          if (randomIndex === currentIndex) return randomSongIndex();
          else return randomIndex;
        };
        this.playCurrentSong(this.currentPlayList.song[randomSongIndex()]);
      },
      toggleRandomMode() {
        this.randomMode = !this.randomMode;
        this.randomPreviousSong = [];
      },
      setCdCoverImg(imageName) {
        const style = `url('../image/MusicPlayer/albumCover/${imageName}')`;
        document.getElementById('cd').style.backgroundImage = style;
      },
      setPlayerTimer() {
        this.currentTime = player.getCurrentTime();
        this.loadedFraction = player.getVideoLoadedFraction();
        this.playingTimer = setInterval(() => {
          if (!this.buffer) {
            this.currentTime = player.getCurrentTime();
          }
        }, 1000 / 29);
        this.loadingTimer = setInterval(() => {
          this.loadedFraction = player.getVideoLoadedFraction();
        }, 5000);
      },
      clearPlayerTimer() {
        clearInterval(this.playingTimer);
        clearInterval(this.loadingTimer);
      },
      handleCollapse() {
        this.sidebarHide = !this.sidebarHide;
      },
      changeCurrentTime(e) {
        this.buffer = setTimeout(() => {
          clearTimeout(this.buffer);
          this.buffer = null;
        }, 1000);
        this.currentTime = e.target.value;
        player.seekTo(e.target.value);
      },
      handlePlayBtn() {
        if (this.isPause || this.isEnded) {
          player.playVideo();
        } else {
          player.pauseVideo();
        }
      },
      addToFavorite(songObj) {
        const alreadyInList = this.favoriteList.find(item => item.videoId == songObj.videoId);
        if (alreadyInList) {
          const index = this.favoriteList.indexOf(alreadyInList);
          this.favoriteList.splice(index, 1);
        } else {
          this.favoriteList.push(songObj);
        }
        const favoriteListJson = JSON.stringify(this.favoriteList);
        localStorage.setItem('favoriteList', favoriteListJson);
      },
      isListSongFavorite(songObj) {
        return this.favoriteList.some(item => item.videoId == songObj.videoId);
      }
    },
    filters: {
      timeFormat(time) {
        //將秒數轉換成mm:ss格式字串並回傳
        let min = parseInt(time / 60) || 0;
        let sec = parseInt(time) % 60 || 0;
        return `${min}:${sec > 9 ? sec : '0' + sec}`;
      }
    },
    created() {
      const localFavoriteList = JSON.parse(localStorage.getItem('favoriteList')) || [];
      this.favoriteList = localFavoriteList;
      $.getJSON('../json/MusicPlayer/playList.json', data => {
        this.playList = data;
        this.setCurrentPlaylist(Object.keys(this.playList)[0]);
      });
    }
  });
});
