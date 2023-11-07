class Params {

// CONSTRUCTOR
// --------------------

  constructor (params) {
    this.style                = this.setStyleParams(params.style);
    this.connectionStyle      = this.setStyleParams(params.connectionStyle);
    this.connectionAnimation  = params.connectionAnimation;
    this.waveParams           = this.setWaveParams(params.waveParams)
  }


// METHODS
// --------------------

  setDimensions (_dimensions) {
    if (_dimensions) {
      var cols   = _dimensions.cols;
      if (vw < 720 && _dimensions.colsMobile && _dimensions.colsMobile.min > 0) cols = _dimensions.colsMobile;
      var rows   = _dimensions.rows;
      if (vw < 720 && _dimensions.rowsMobile && _dimensions.rowsMobile.min > 0) rows = _dimensions.rowsMobile;
      var length = _dimensions.length;
      if (vw < 720 && _dimensions.lengthMobile > 0) length = _dimensions.lengthMobile;
      var dimensions = {
        cols: this.setRange(cols),
        rows: this.setRange(rows),
        length: parseFloat(length),
      }
      return dimensions;
    }
  }

  setStyleParams (_style) {
    if (_style) {
      var { strokeWidth, strokeColor, shadowBlur, fillColor } = _style;
      return setStyle(strokeWidth, strokeColor, shadowBlur, fillColor);
    }
    return false;
  }

  setRange (_values) {
    if (_values) {
      var min   = parseFloat(_values.min);
      var range = parseFloat(_values.range);
      if (!isNaN(range)) {
        return randomInt(range, min);
      }
      return min;
    }
    return false;
  }

  setWaveParams (_params) {
    var amountOfPeriods      = parseFloat(_params.wavePeriods)   || 20;
    var amountOfWaves        = parseFloat(_params.waveAmount)    || 5;
    var periodHasRandomWidth = _params.randomPeriod              || false;
    var speed                = parseFloat(_params.speed)         || 1;
    var waveAmplitude        = parseFloat(_params.waveAmplitude) || .5;
    var waveForm             = _params.waveform                  || 'triangle';
    var waveSmoothing        = parseFloat(_params.waveSmoothing) || 0;

    var waveParams = {
      form:           waveForm,                             // sawtooth, square, triangle
      amount:         amountOfWaves,                        // amount of waves, 2-25
      periods:        amountOfPeriods,                      // amount of periods, 2-50
      length:         vw / amountOfPeriods,                 // wave length
      amplitudeRatio: waveAmplitude,                        // wave amplitude (proportional to length) 0.1-10
      amplitude:      vw / amountOfPeriods * waveAmplitude, // wave amplitude
      distance:       vh / amountOfWaves,                   // distance between waves
      randomPeriod:   periodHasRandomWidth,                 // determine if periods are same width or not
      smoothing:      waveSmoothing,                        // smooth path 0-1
      speed:          speed,
    }
    return waveParams;
  }

}