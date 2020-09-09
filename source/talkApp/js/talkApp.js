var vm;
vm = new Vue({
  el: '#app',
  data: {
    inputLang: 'en-US',
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
    groups: [
      { id: '#1', title: '101 Airborne Division', messages: [] },
      { id: '#2', title: 'Easy Company', messages: [] }
    ]
  },
  watch: {
    currentGroup() {
      const audio = new Audio('./sound/channel.mp3');
      audio.play();
    }
  },
  computed: {
    messages() {
      return this.currentGroup.messages.reverse();
    }
  },
  methods: {
    recordFn() {
      return {
        mediaRecorder: null,
        start: function () {
          vm.msgRecording = true;
          navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            this.mediaRecorder = new MediaRecorder(stream);
            this.mediaRecorder.start();
            const startTime = Date.now();
            const audioChunks = [];
            this.mediaRecorder.addEventListener('dataavailable', event => {
              audioChunks.push(event.data);
            });
            this.mediaRecorder.addEventListener('stop', () => {
              const stopTime = Date.now();
              vm.tempMsg.audioDuration = stopTime - startTime;
              const audioBlob = new Blob(audioChunks);
              const audioUrl = URL.createObjectURL(audioBlob);
              vm.tempMsg.audioBlob = audioBlob;
              vm.tempMsg.audioUrl = audioUrl;
              if (vm.autoSend) {
                vm.sendMsg();
              }
            });
          });
        },
        end: function () {
          this.mediaRecorder.stop();
          vm.msgRecording = false;
        }
      };
    },
    inputRecognition() {
      const vm = this;
      //辨識初始設定
      const SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
      const SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
      const SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // 連續辨識
      recognition.interimResults = true; // 是否要輸出中間結果
      recognition.lang = this.inputLang;
      //錄音初始設定
      const record = this.recordFn();
      // 開始辨識及錄音
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
        let interim_transcript = ''; // 中間結果
        let final_transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
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
    commandRecognition() {
      const vm = this;
      const SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
      const SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
      const SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
      const commands = ['switch to'];
      var grammar =
        '#JSGF V1.0; grammar commands; public <commands> = ' + commands.join(' | ') + ' ;';
      const recognition = new SpeechRecognition();
      const speechRecognitionList = new SpeechGrammarList();
      speechRecognitionList.addFromString(grammar, 1);
      recognition.grammars = speechRecognitionList;
      recognition.lang = 'en-US';
      recognition.continuous = true; // 連續辨識
      recognition.interimResults = false; // 是否要輸出中間結果
      recognition.maxAlternatives = 1;
      recognition.start();
      recognition.onend = function () {
        console.log('commandRecognition End');
        setTimeout(() => {
          if (!vm.msgRecording) {
            console.log('commandRecognition');
            vm.commandRecognition();
          }
        }, 50);
      };
      recognition.onresult = function (event) {
        //不在錄音的情況下執行
        if (!vm.msgRecognizing) {
          const last = event.results.length - 1;
          const command = event.results[last][0].transcript;
          console.log(command.toLowerCase() + ' Confidence: ' + event.results[0][0].confidence);
          if (command.toLowerCase().includes('switch to')) {
            switchGroup(command.toLowerCase());
          }
        }
      };
      function switchGroup(command) {
        let group;
        if (command.includes('channel')) {
          const inputGroup = command.replace('switch to channel', '').trim();
          const index = parseInt(inputGroup, 10) - 1;
          group = vm.groups[index];
        } else {
          const inputGroup = command.replace('switch to', '').trim();
          if (inputGroup == vm.currentGroup.title) return;
          group = vm.groups.find(item => item.title.toLowerCase() == inputGroup);
        }
        if (group && vm.currentGroup !== group) {
          vm.currentGroup = group;
        }
      }
    },
    sendMsg(e, msg = this.tempMsg) {
      if (!msg.text.length && !msg.audioUrl) return;
      msg.timestamp = Date.now();
      this.currentGroup.messages.push(msg);
      this.tempMsg = {
        text: null,
        audioBlob: null,
        audioUrl: null,
        audioDuration: null
      };
    }
  },
  created() {
    this.currentGroup = this.groups[0];
    this.commandRecognition();
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
    }
  }
});
