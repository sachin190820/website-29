class Controls {

// CONSTRUCTOR
// --------------------

  constructor () {
    this.animationTime = 1000;
    this.el   = $('.controls');
    this.logo = $('.logo');

    this.interval = null;

    this.trackInHome  = null;
    this.trackInIndex = null;

    this.seconds = {
      el:    $('.controls__seconds'),
    };
    this.play = {
      el:    $('.controls__play'),
    };
    this.progress = {
      el:    $('.controls__progress'),
    };
    this.vinyl = {
      el:    $('.controls__vinyl'),
      value: false,
    };
  }

// METHODS
// --------------------

  init () {
    this.initClickEvents();
    this.initKeyboardEvents();
  }

  initClickEvents () {
    this.play.el.click( this.handlePlay );
    this.progress.el.click( this.handleSeek );
    this.logo.click( () => { this.handleStop(); triggerClassOnBack() } );
  }

  initTouchEvents () {
    document.addEventListener('mousedown', this.handleTouch )
  }

  initKeyboardEvents () {
    document.addEventListener('keydown', this.handleKeyboard )
  }


  getNext () {
    var index         = _player.next || 0;
    var _track        = _tracks[index];
    this.trackInHome  = _track.$track;
    this.trackInIndex = _track.$trackInIndex;

    var next = {
      _track: _track,
      $track: _track.$track,
      slug:   _track.$track.attr('data-slug'),
      index:  index,
    }
    return next;
  }

  // Event handlers
  handleKeyboard = (e) => {
    switch (e.key) {
      case ' ':
        this.handlePlay();
        break;
      case 'Escape':
        this.handleStop();
        triggerClassOnBack();
        break;
      case 'ArrowRight':
        this.handleNext();
        break;
      default:
        return;
    }
  }

  handleNext = () => {
    if (_player.isSetup && _player.allowChangeTrack && _canvas.isSetup) {
      var { $track, _track, index, slug } = this.getNext();
      _global.unmount()

      setTimeout(() => {
        _global.requestTrack(slug)
        _track.addPlayClass()
        this.update(index)
      }, this.animationTime)

    // Play first track
    } else {
      var {_track, index, slug } = this.getNext();
      _player.trackIndex = index;
      _global.requestTrack(slug)
      _track.addPlayClass()
      this.update(index)
    }
  }

  handlePlay = () => {
    if (_player.isSetup && _canvas.isSetup) {
      this._track.togglePlayClass()
      _global.togglePlay()

    } else {
      this.handleNext()
    }
  }

  handleSeek = (e) => {
    if (_player.isSetup && _canvas.isSetup) {
      var duration = _player.el.duration;
      var value    = this.sliderMousePosition(e);
          value    = value * duration;
      _player.seek = value;

      this.update()
      this.updateSliders(_player.timeLeft, duration)
    }
  }

  handleStop () {
    _global.unmount()

    setTimeout(() => {
      _global.reset()
    }, this.animationTime)
  }

  handleTouch = (e) => {
    // mousePos = new paper.Point(e.clientX, e.clientY);
  }


  // Loading
  addLoadingState () {
    this.el.addClass('loading')
  }

  removeLoadingState () {
    this.el.removeClass('loading').addClass('playing');
  }

  sliderMousePosition (event) {
    var $element    = this.progress.el;
    var sliderWidth = $element.innerWidth();
    var sliderLeft  = $element.offset().left;
    var mouseX      = event.clientX - sliderLeft;
    var value       = 1 / sliderWidth * mouseX;
    return value;
  }

  reset () {
    $('.track, .index__item').removeClass('playing')
    this.el.removeClass('playing paused')
    this.resetTime()
    this.updateSliders(1)
  }

  togglePlayClass () {
    if (_player.isPlaying) {
      this.el.removeClass('paused')
    } else {
      this.el.addClass('paused')
    }
    return _player.isPlaying;
  }

  unmount () {
    $('.track, .index__item').removeClass('playing')
    this.el.removeClass('playing paused')
    this.updateSliders(1)
  }


  // Vinyl
  playVinyl () {
    this.vinyl.el.removeAttr('style');
    this.vinyl.el.addClass('spin');
  }

  toggleVinyl () {
    if (_player.isPlaying) {
      this.vinyl.el.css('webkitAnimationPlayState', 'running');
    } else {
      this.vinyl.el.css('webkitAnimationPlayState', 'paused');
    }
  }

  resetVinyl () {
    this.vinyl.el.removeAttr('style');
    this.vinyl.el.removeClass('spin');
  }

  resetTime () {
    this.seconds.el.html('- 00:00');
  }

  // Update
  update () {
    this.updateTrack()
    this.updateInfo()
  }

  updateTrack () {
    this.trackInHome  = this._track.$track;
    this.trackInIndex = this._track.$trackInIndex;
  }

  updateInfo () {
    var $track  = this.trackInHome;
    var number  = $track.find('.track__number').html();
    var title   = $track.find('.track__title').html();
    var text    = $track.find('.track__longtext').html();
    var service = $track.find('.track__services').html();

    $('.controls__track-number').html(number);
    $('.controls__track-title').html(title);
    $('.controls__track-text').html(text);
    $('.controls__track-services').html(service);
  }

  updateSeconds (timeLeft) {
    if (_player.isPlaying) {
      var formattedTime = formatTime(timeLeft) || '- 00:00';
      if (!isNaN(timeLeft)) {
        this.seconds.el.html(formattedTime);
      }
      return formattedTime;
    }
  }

  updateSliders (timeLeft, duration = 1) {
    this.updateSliderWidth(_controls.progress.el, timeLeft, duration)
    this.updateSliderWidth(_controls.trackInHome, timeLeft, duration)
    this.updateSliderWidth(_controls.trackInIndex, timeLeft, duration)
  }

  updateSliderWidth ($element, value, maxValue = 1) {
    if ($element) {
      var $slider     = $element.find('.slider__value');
      var sliderValue = 100 - (100 / maxValue * value) + '%';
      $slider.css('width', sliderValue);
      return sliderValue;
    }
    return false;
  }

  get _track () {
    return _tracks[_player.trackIndex];
  }

}



