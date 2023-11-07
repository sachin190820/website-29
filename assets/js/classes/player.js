class Player {

// CONSTRUCTOR
// --------------------

  constructor (numberOfTracks) {
    this.allowChangeTrack = true;
    this.autoplayNext     = true;
    this.el               = document.createElement("audio");
    this.isPlaying        = false;
    this.isSetup          = false;
    this.hasInterval      = false;
    this.numberOfTracks   = numberOfTracks;
    this.trackIndex       = null;
    this.trackNumber      = null;
    this.trackTitle       = null;
    this.rms = 0;
  }

// METHODS
// --------------------

  setTrackCount (amount) {
    this.numberOfTracks  = amount;
    this.randomTrackList = this.createRandomTrackList();
  }

  createRandomTrackList () {
    var trackList = [];
    for (var i = 0; i < this.numberOfTracks; i++) {
      trackList[i] = i + 1;
    }
    return shuffle(trackList);
  }

  // PAUSE
  pause () {
    this.el.pause();
    this.isPlaying = false;
  }

  // PLAY
  play () {
    this.el.play();
    this.isPlaying = true;
  }

  // ON SUCCESSFUL REQUEST, SETUP AND PLAY TRACK
  onSuccessfulRequest (data) {
    this.setup(data);
    this.onTrackEnd();
    return this.el;
  }

  // RESET PLAYER ATTRIBUTES
  reset () {
    this.pause();
    this.isSetup     = false;
    this.isPlaying   = false;
    this.trackNumber = null;
    this.trackTitle  = null;
    return this;
  }

  // SETUP PLAYER
  setup (data) {
    var { src, title, number } = data;
    this.isSetup     = true;
    this.source      = src;
    this.trackTitle  = title;
    this.trackNumber = number;
    this.trackIndex  = number - 1;
    return this;
  }

  setupAnalyser () {
    if (!window.AudioContext || !window.webkitAudioContext) return;

    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
      this.processor = this.audioCtx.createScriptProcessor(2048, 1, 1);
      this.mediaSource = this.audioCtx.createMediaElementSource(this.el);

      this.processAudio()
    }

    this.mediaSource.connect(this.processor);
    this.mediaSource.connect(this.audioCtx.destination);
    this.processor.connect(this.audioCtx.destination);
  }

  processAudio () {
    this.processor.onaudioprocess = (e) => {
      var input = e.inputBuffer.getChannelData(0);
      var len = input.length;
      var total = 0; var i = 0;
      while ( i < len ) total += Math.abs( input[i++] );
      this.rms = Math.sqrt( total / len )
    };

  }

  // TOGGLE PLAY / PAUSE STATE
  togglePlay () {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  onTrackEnd () {
    this.el.addEventListener("ended", _global.autoplayNext );
  }

  onTimeUpdate () {
    if (!this.hasInterval) {

      setInterval( _global.timerInterval, 40)
      this.hasInterval = true;
    }
  }


// SETTERS
// --------------------

  set source (src) {
    this.el.src = src;
  }

  set seek (time) {
    this.el.pause();
    this.el.currentTime = time;

    if (this.isPlaying) this.el.play();
  }

  set volume (value) {
    this.el.volume = value; // 0 to 1
  }

  set change (value) {
    this.allowChangeTrack = value; // boolean
  }


// GETTERS
// --------------------
  get next () {
    var trackNumber = this.trackNumber;
    var nextNumber  = this.trackNumber < this.numberOfTracks ? this.trackNumber : 0;
    return nextNumber;
  }

  get randomNext () {
    var list        = this.randomTrackList;
    var trackNumber = this.trackNumber;
    var nextIndex   = list.indexOf(trackNumber) + 1;
    var nextNumber  = nextIndex < list.length ? list[nextIndex] : list[0];
    return nextNumber;
  }

  get frequency () {
    return this.rms;
    // const { analyser } = this;
    // analyser.fftSize = 1024;
    // var bufferLength = analyser.frequencyBinCount;
    // var dataArray = new Uint8Array(bufferLength);
    // return analyser.getByteTimeDomainData(dataArray);

    // return this.analyser;
  }

  get duration () {
    return parseInt(this.el.duration);
  }

  get currentTime () {
    return parseInt(this.el.currentTime);
  }

  get timeLeft () {
    return (parseInt(this.el.duration) - parseInt(this.el.currentTime));
  }

  get decimalTimeLeft () {
    return (this.el.duration - this.el.currentTime).toFixed(2);
  }
}
