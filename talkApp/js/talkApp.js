"use strict";

var vm;
vm = new Vue({
  el: '#app',
  data: {
    currentGroup: {},
    msgRecognizing: false,
    msgRecording: false,
    autoSend: false,
    tempMsg: {
      text: null,
      audioBlob: null,
      audioUrl: null,
      audioDuration: null
    },
    groups: [{
      id: '#1',
      title: '101 Airborne Division',
      messages: []
    }, {
      id: '#2',
      title: 'Easy Company',
      messages: []
    }]
  },
  computed: {
    messages: function messages() {
      return this.currentGroup.messages.reverse();
    }
  },
  methods: {
    recordFn: function recordFn() {
      return {
        mediaRecorder: null,
        start: function start() {
          var _this = this;

          vm.msgRecording = true;
          navigator.mediaDevices.getUserMedia({
            audio: true
          }).then(function (stream) {
            _this.mediaRecorder = new MediaRecorder(stream);

            _this.mediaRecorder.start();

            var startTime = Date.now();
            var audioChunks = [];

            _this.mediaRecorder.addEventListener('dataavailable', function (event) {
              audioChunks.push(event.data);
            });

            _this.mediaRecorder.addEventListener('stop', function () {
              var stopTime = Date.now();
              vm.tempMsg.audioDuration = stopTime - startTime;
              var audioBlob = new Blob(audioChunks);
              var audioUrl = URL.createObjectURL(audioBlob);
              vm.tempMsg.audioBlob = audioBlob;
              vm.tempMsg.audioUrl = audioUrl;

              if (vm.autoSend) {
                vm.sendMsg();
              }
            });
          });
        },
        end: function end() {
          this.mediaRecorder.stop();
          vm.msgRecording = false;
        }
      };
    },
    inputRecognition: function inputRecognition() {
      var vm = this; //辨識初始設定

      var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
      var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
      var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
      var recognition = new SpeechRecognition();
      recognition.continuous = true; // 連續辨識

      recognition.interimResults = true; // 是否要輸出中間結果

      recognition.lang = 'en-US'; //錄音初始設定

      var record = this.recordFn(); // 開始辨識及錄音

      recognition.start();

      recognition.onstart = function () {
        record.start();
        vm.msgRecognizing = true; // 設定為辨識中
      };

      recognition.onend = function () {
        // 辨識完成
        record.end();
        vm.commandRecognition();
        vm.msgRecognizing = false; // 設定為「非辨識中」
      };

      recognition.onresult = function (event) {
        var interim_transcript = ''; // 中間結果

        var final_transcript = '';

        for (var i = event.resultIndex; i < event.results.length; ++i) {
          // 對於每一個辨識結果
          if (event.results[i].isFinal) {
            // 如果是最終結果
            final_transcript += event.results[i][0].transcript; // 將其加入最終結果中

            vm.tempMsg.text = final_transcript;
            recognition.stop();
          } else {
            // 否則
            interim_transcript += event.results[i][0].transcript; // 將其加入中間結果中

            vm.tempMsg.text = interim_transcript;
          }
        }
      };
    },
    commandRecognition: function commandRecognition() {
      var vm = this;
      var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
      var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
      var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
      var commands = ['switch to'];
      var grammar = '#JSGF V1.0; grammar commands; public <commands> = ' + commands.join(' | ') + ' ;';
      var recognition = new SpeechRecognition();
      var speechRecognitionList = new SpeechGrammarList();
      speechRecognitionList.addFromString(grammar, 1);
      recognition.grammars = speechRecognitionList;
      recognition.lang = 'en-US';
      recognition.continuous = true; // 連續辨識

      recognition.interimResults = false; // 是否要輸出中間結果

      recognition.maxAlternatives = 1;
      recognition.start();

      recognition.onend = function () {
        // console.log('commandRecognition End');
        setTimeout(function () {
          if (!vm.msgRecording) {
            // console.log('commandRecognition');
            vm.commandRecognition();
          }
        }, 50);
      };

      recognition.onresult = function (event) {
        //不在錄音的情況下執行
        if (!vm.msgRecognizing) {
          var last = event.results.length - 1;
          var command = event.results[last][0].transcript; // console.log(command.toLowerCase() + ' Confidence: ' + event.results[0][0].confidence);

          if (command.toLowerCase().includes('switch to')) {
            switchGroup(command.toLowerCase());
          }
        }
      };

      function switchGroup(command) {
        var group;

        if (command.includes('channel')) {
          var inputGroup = command.replace('switch to channel', '').trim();
          var index = parseInt(inputGroup, 10) - 1;
          group = vm.groups[index];
        } else {
          var _inputGroup = command.replace('switch to', '').trim();

          if (_inputGroup == vm.currentGroup.title) return;
          group = vm.groups.find(function (item) {
            return item.title.toLowerCase() == _inputGroup;
          });
        }

        if (group && vm.currentGroup !== group) {
          vm.currentGroup = group;
        }
      }
    },
    sendMsg: function sendMsg(e) {
      var msg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.tempMsg;
      // console.log('sendMsg');
      msg.sentTime = Date.now();
      this.currentGroup.messages.push(msg);
      this.tempMsg = {
        text: null,
        audioBlob: null,
        audioUrl: null,
        audioDuration: null
      };
    }
  },
  created: function created() {
    this.commandRecognition();
    this.currentGroup = this.groups[0];
  }
});
//# sourceMappingURL=talkApp.js.map
