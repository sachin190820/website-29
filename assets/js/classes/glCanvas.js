class GlCanvas {

// CONSTRUCTOR
// --------------------

  constructor (params) {
    this.gl             = document.querySelector("canvas").getContext("webgl");
    this.programInfo    = null;
    this.bufferInfo     = null;
    this.tex            = null;
    this.startTime      = 0;
    this.params         = { };

    this.vs             = SHADERS.vs;
    this.fs             = SHADERS.fs;
    this.init();
  }


// METHODS
// --------------------


  init () {
    this.initParams();
    window.addEventListener('click', this.initAudioCtx);
  }

  initAudioCtx = () => {
    window.removeEventListener('click', this.initAudioCtx);

    // make a Web Audio Context
    this.audioCtx       = new AudioContext();
    this.analyser       = this.audioCtx.createAnalyser();

    // Make a buffer to receive the audio data
    this.numPoints      = this.analyser.frequencyBinCount;
    this.audioDataArray = new Uint8Array(this.numPoints);

    // After Audio Context is initialized, check if _player audio can play and prepare for rendering

    _player.el.addEventListener('canplay', this.handleCanplay);
  }

  // `handleCanplay` is called when _player.el can be played
  handleCanplay = () => {
    const { audioCtx, analyser } = this;
    if (!this.mediaSource) this.mediaSource = audioCtx.createMediaElementSource(_player.el);

    this.mediaSource.connect(analyser);
    analyser.connect(audioCtx.destination);
  }


  initParams (params) {
    this.params = {
      wavesCount: '10.0',
      speed:      2.,            // values from 1. (slow) to 10.0 (fast)
      color:      [.5, .5, 1.5], // values from 0.2 (less intense) to 2.0 (more intense)
      wavelength: [20., 10.],    // values from 1.0 (wider wave) to 100.0 (tighter wave)
      amplitude:  .5,            // values from 0.01 (low wave) to 1.0 (high wave)
      shift:      1.,            // values from 0.01 (low shift) to 1.0 (high shift)
    }
  }

  updateParams () {
    this.fs = SHADERS.fs;

    if (_canvas.params) {
      const { wavesCount, waveLength, amplitude, color, shift, speed } = _canvas.params;
      this.params.wavesCount = `${ wavesCount }.0`;
      this.params.waveLength = [ waveLength, waveLength ];
      this.params.amplitude  = amplitude;
      this.params.color      = color;
      this.params.shift      = shift;
      this.params.speed      = speed;

    } else {
      this.params.wavesCount = `${Math.floor(Math.random() * 48) + 2}.0`;
      this.params.wavelength = [ (Math.random() * 30).toFixed(4), (Math.random() * 30).toFixed(4) ];
      this.params.color      = [ (Math.random() + .5).toFixed(4), (Math.random() + .5).toFixed(4), (Math.random() + .5).toFixed(4) ];
      this.params.amplitude  = (Math.random()).toFixed(4);
      this.params.shift      = (Math.random()).toFixed(4);
    }
  }

  // This will be called on canvas.`play new track`
  start () {
    this.updateParams();
    this.compileShader();
    this.render();
  }


  compileShader () {
    const { gl, numPoints, params } = this;

    // hardcode uniform to make loop work
    this.fs = this.fs.replace('%s', params.wavesCount);

    // init time
    this.startTime = Date.now();

    // compiles shaders, link program, look up locations
    this.programInfo = twgl.createProgramInfo(gl, [this.vs, this.fs]);    
    this.tex = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texImage2D(
       gl.TEXTURE_2D, 
       0,                 // level
       gl.LUMINANCE,      // internal format
       numPoints,         // width
       1,                 // height
       0,                 // border
       gl.LUMINANCE,      // format
       gl.UNSIGNED_BYTE,  // type
       null);  
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const arrays = {
      position: {
        numComponents: 2,
        data: [
          -1, -1,
           1, -1,
          -1,  1,
          -1,  1,
           1, -1,
           1,  1,
        ],
      }
    };

    // calls gl.createBuffer, gl.bindBuffer, gl.bufferData
    this.bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
  }

  // Render shapes on canvas
  render () {
    this.raf = requestAnimationFrame(this.animate);
  }

  animate = () => {
    const { gl, analyser, audioDataArray, tex, numPoints, programInfo, bufferInfo, startTime, params } = this;
    let elapsedMilliseconds = Date.now() - startTime;
    let elapsedSeconds      = elapsedMilliseconds / 1000.;
    let time                = elapsedSeconds;

    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.useProgram(programInfo.program);

    // get the current audio data
    analyser.getByteFrequencyData(audioDataArray);

    // upload the audio data to the texture
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texSubImage2D(
       gl.TEXTURE_2D, 
       0,            // level
       0,            // x
       0,            // y
       numPoints,    // width
       1,            // height
       gl.LUMINANCE, // format
       gl.UNSIGNED_BYTE,  // type
       audioDataArray);       

    // calls gl.enableVertexAttribArray, gl.bindBuffer, gl.vertexAttribPointer
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

    // calls gl.activeTexture, gl.bindTexture, gl.uniform
    twgl.setUniforms(programInfo, {
      audioData: tex,
      resolution: [vw, vh], //[gl.canvas.width, gl.canvas.height], // [vw, vh],
      u_time:       time,
      u_speed:      params.speed,
      u_color:      params.color,
      u_wavelength: params.wavelength,
      u_amplitude:  params.amplitude,
      u_shift:      params.shift,
    });
    // calls gl.drawArrays or gl.drawElements
    twgl.drawBufferInfo(gl, bufferInfo);

    this.raf = requestAnimationFrame(this.animate);
  }

  // Reset canvas element
  reset () {
    const { gl } = this;

    // Swap fragment shader with empty
    this.fs = SHADERS.fsClear;
    this.compileShader();
    this.render();

    // cancelAnimationFrame(this.raf);
  }

};