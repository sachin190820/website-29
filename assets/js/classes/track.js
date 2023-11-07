class Track {

// CONSTRUCTOR
// --------------------

  constructor (index, num, homeId, indexId) {
    this.index          = index;
    this.num            = num;
    this.$track         = homeId  ? $(homeId) : null;
    this.$toggle        = homeId  ? $(homeId).find('.track__toggle') : null;
    this.$trackInIndex  = indexId ? $(indexId) : null;
  }

// METHODS
// --------------------

  init () {
    this.initClickEvents();
  }

  initClickEvents () {
    this.$track.click( this.handleTrack );
    this.$trackInIndex.click( this.handleTrack );
  }

  // Event handlers
  handleTrack = () => {
    // console.log(this.index, this.$track)

    var targetTitle = this.$track.find('.track__title').html();
    var isSameTrack = _player.trackTitle === targetTitle;

    if (isSameTrack) {
      _controls.handlePlay()

    } else {
      this.handleTrackRequest(this.$track)
      this.addPlayClass()
    }
  }

  handleTrackRequest = () => {
    if (_player.allowChangeTrack) {
      var $track        = this.$track;
      var slug          = $track.attr('data-slug');
      var animationTime = 500;
      _global.unmount()
      _controls.addLoadingState()

      setTimeout(function() {
        _global.requestTrack(slug)
      }, animationTime)
    }
  }

  // Update track class
  addPlayClass() {
    $('.track, .index__item').removeClass('playing paused');
    this.$track.addClass('playing');
    this.$trackInIndex.addClass('playing');
  }

  togglePlayClass() {
    var isPlaying = _player.isPlaying;
    if (isPlaying) {
      this.$track.removeClass('playing').addClass('paused');
      this.$trackInIndex.removeClass('playing').addClass('paused');
    } else {
      this.$track.removeClass('paused').addClass('playing');
      this.$trackInIndex.removeClass('paused').addClass('playing');
    }
  }

}