"use strict";var tag=document.createElement("script");tag.src="https://www.youtube.com/iframe_api";var player,vm,firstScriptTag=document.getElementsByTagName("script")[0];function onYouTubeIframeAPIReady(){player=new YT.Player("yt-iframe-player",{height:"0",width:"0",videoId:"H7pOrQEnc3c",playerVars:{controls:0},events:{onReady:vm.onPlayerReady,onStateChange:vm.onPlayerStateChange}})}firstScriptTag.parentNode.insertBefore(tag,firstScriptTag),$(function(){vm=new Vue({el:"#app",data:{currentPlayList:{},playingPlayList:null,currentSong:null,isCued:!1,isPlaying:!1,isPause:!1,isBuffering:!1,isEnded:!1,currentTime:0,durationTime:0,loadedFraction:0,playingTimer:null,loadingTimer:null,sidebarHide:!1,playerState:null,screenWidth:document.body.clientWidth,listPauseHover:!1,volume:50,preVolume:null,randomMode:!1,randomPreviousSong:[],favoriteList:[],playList:{}},watch:{playerState:function(t){this.isBuffering=!1,this.isEnded=!1,this.isCued=!1,t==YT.PlayerState.CUED?this.isCued=!0:t==YT.PlayerState.PLAYING?(this.isPlaying=!0,this.isPause=!1):t==YT.PlayerState.PAUSED?(this.isPause=!0,this.isPlaying=!1):t==YT.PlayerState.ENDED?(this.isEnded=!0,this.playNextSong()):t==YT.PlayerState.BUFFERING?this.isBuffering=!0:(this.isPause=!1,this.isPlaying=!1)},isPlaying:function(t){t?(this.setPlayerTimer(),this.durationTime=player.getDuration()):this.clearPlayerTimer()},playingPlayList:function(t,e){t!=e&&(this.randomPreviousSong=[])}},computed:{cdRotate:function(){return(this.isPlaying||this.isPause)&&!this.isEnded},playPercentage:function(){return parseFloat((this.currentTime/this.durationTime).toFixed(4))||0},loadingPercentage:function(){return parseFloat(this.loadedFraction.toFixed(3))},currentPlayListSong:function(){return this.currentPlayList.song||[]},isCurrentPlayFavorite:function(){var e=this;return!!this.currentSong&&this.favoriteList.some(function(t){return t.videoId==e.currentSong.videoId})}},methods:{onPlayerReady:function(){this.volume=player.getVolume()},setVolume:function(t){this.volume=t.target.value,player.setVolume(this.volume)},muteVolume:function(){0<this.volume?(this.preVolume=this.volume,this.volume=0):this.volume<1&&this.preVolume&&(this.volume=this.preVolume,this.preVolume=null),player.setVolume(this.volume)},onPlayerStateChange:function(t){this.playerState=t.data},setCurrentPlaylist:function(t){var e;"favorite"!==t?this.currentPlayList=this.playList[t]:(e={title:"我的最愛",song:this.favoriteList},this.currentPlayList=e)},setCurrentSong:function(t){this.currentSong=t,player.cueVideoById({videoId:this.currentSong.videoId}),this.currentTime=0,this.durationTime=0,this.loadedFraction=0},playCurrentSong:function(t){this.setCurrentSong(t),this.setCdCoverImg(t.coverImgFileName),this.playingPlayList=this.currentPlayList,player.playVideo()},playNextSong:function(){if(this.randomMode)return this.randomPreviousSong.push(this.currentSong),void this.playRandomSong();var t=this.currentPlayList.song.indexOf(this.currentSong);t+1===this.currentPlayList.song.length?this.playCurrentSong(this.currentPlayList.song[0]):this.playCurrentSong(this.currentPlayList.song[t+1])},playPreviousSong:function(){var t,e,i;this.randomMode?0===(t=this.randomPreviousSong.length)?player.seekTo(0):(this.playCurrentSong(this.randomPreviousSong[t-1]),this.randomPreviousSong.splice(-1,1)):(e=this.currentPlayList.song.indexOf(this.currentSong),i=this.currentPlayList.song.length-1,0===e?this.playCurrentSong(this.currentPlayList.song[i]):this.playCurrentSong(this.currentPlayList.song[e-1]))},playRandomSong:function(){var i=this.currentPlayList.song.indexOf(this.currentSong),r=this.currentPlayList.song.length;this.playCurrentSong(this.currentPlayList.song[function t(){var e=Math.floor(Math.random()*r);return e===i?t():e}()])},toggleRandomMode:function(){this.randomMode=!this.randomMode,this.randomPreviousSong=[]},setCdCoverImg:function(t){var e="url('../image/MusicPlayer/albumCover/".concat(t,"')");document.getElementById("cd").style.backgroundImage=e},setPlayerTimer:function(){var t=this;this.currentTime=player.getCurrentTime(),this.loadedFraction=player.getVideoLoadedFraction(),this.playingTimer=setInterval(function(){t.buffer||(t.currentTime=player.getCurrentTime())},1e3/29),this.loadingTimer=setInterval(function(){t.loadedFraction=player.getVideoLoadedFraction()},5e3)},clearPlayerTimer:function(){clearInterval(this.playingTimer),clearInterval(this.loadingTimer)},handleCollapse:function(){this.sidebarHide=!this.sidebarHide},changeCurrentTime:function(t){var e=this;this.buffer=setTimeout(function(){clearTimeout(e.buffer),e.buffer=null},1e3),this.currentTime=t.target.value,player.seekTo(t.target.value)},handlePlayBtn:function(){this.isPause||this.isEnded?player.playVideo():player.pauseVideo()},addToFavorite:function(e){var t,i=this.favoriteList.find(function(t){return t.videoId==e.videoId});i?(t=this.favoriteList.indexOf(i),this.favoriteList.splice(t,1)):this.favoriteList.push(e);var r=JSON.stringify(this.favoriteList);localStorage.setItem("favoriteList",r)},isListSongFavorite:function(e){return this.favoriteList.some(function(t){return t.videoId==e.videoId})}},filters:{timeFormat:function(t){var e=parseInt(t/60)||0,i=parseInt(t)%60||0;return"".concat(e,":").concat(9<i?i:"0"+i)}},created:function(){var e=this,t=JSON.parse(localStorage.getItem("favoriteList"))||[];this.favoriteList=t,$.getJSON("/json/MusicPlayer/playlist.json",function(t){e.playList=t,e.setCurrentPlaylist(Object.keys(e.playList)[0])})}})});
//# sourceMappingURL=musicPlayer.js.map
