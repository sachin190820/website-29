class Canvas {

// CONSTRUCTOR
// --------------------

  constructor (params) {
    this.initialParams  = {};
    this.isSetup        = false;
    this.isPlaying      = false;
    this.params         = {};
    this.paths          = [];
    this.time           = 0;
    this.title          = null;

    this.glCanvas       = new GlCanvas();
  }


// METHODS
// --------------------

  // Pause canvas animation
  pause () {
    this.isPlaying = false;
  }

  // Play canvas animation
  play () {
    this.isPlaying = true;
  }

  // On successful request, setup and render canvas
  requestTrackOnSuccess (data) {
    this.reset();
    this.setup(data);
    return data;
  }

  // Reset canvas element
  reset () {
    this.glCanvas.reset();
    return false;
  }

  resetParams () {
    this.params = JSON.parse(JSON.stringify(this.initialParams));
    return this.params;
  }

  // On first call, setup canvas dom element
  setCanvas () {
    if (!this.isSetup) {
      this.isSetup = true;
    }
  }

  // Setup paper in canvas element 
  setup (data) {
    this.setCanvas();
    if (data.params) {
      this.addParams        = data.params;
      this.addInitialParams = this.params;
      this.addTitle         = data.title;
    }
    this.glCanvas.start();
    return this;
  }

  // Increment time counter by 1
  timeIncr () {
    this.time = this.time + 1;
  }

  // Toggle play / pause state
  togglePlay () {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  // Unmount canvas elements
  unmount (time = 750) {
    this.glCanvas.reset();
  }

  updateParams (newParams) {
    var oldParams = this.params;
    Object.keys(oldParams).map((element, index) => {
      var oldParam = oldParams[element];
      var newParam = newParams[element];
      if (newParam && oldParam != newParam) {
        this.params[element] = newParam;
      }
    })
    return newParams;
  }


// SETTERS
// --------------------

  set addParams (params) {
    this.params = params;
  }

  set addInitialParams (params) {
    this.initialParams = {...params};
  }

  set addTitle (title) {
    this.title = title;
  }
};