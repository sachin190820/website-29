const SHADERS = {
    // Vertex shader
    vs: `
      attribute vec4 position;
      void main() {
        gl_Position = position;
      }
    `,
  
    // Fragment shader
    // Reference: https://www.shadertoy.com/view/XsX3zS
    fs: `
      precision mediump float;
      uniform vec2 resolution;
      uniform sampler2D audioData;
      uniform float u_time;
      uniform float u_speed;
      uniform vec3 u_color;
      uniform vec2 u_wavelength;
      uniform float u_amplitude;
      uniform float u_shift;
  
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution;
  
        float time = u_time * u_speed * 5.0;
        
        vec3 color = vec3(0.0);
  
        const float WAVES = %s;
  
        for (float i=0.0; i < WAVES; i++) {
          float freq = texture2D(audioData, vec2(i / WAVES * 0.75, 0.0)).x * 1.0;
          float unit = 1.0 / WAVES;
          float base = (unit * i * -1.0) - (unit * 0.5);
  
          vec2 pos = vec2(uv);
  
          pos.x += i * u_shift + freq * 0.03;
          pos.y += base + sin(pos.x * u_wavelength.x + time) * cos(pos.x * u_wavelength.y) * (freq + 0.02) * u_amplitude * ((i + 1.0) / WAVES);
  
          float intensity = abs(0.01 / pos.y) * clamp(freq, 0.35, 1.75);
  
          color += vec3(u_color.x * intensity, u_color.y * intensity, u_color.z * intensity) * (5.0 / WAVES);
        }
  
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  
    fsClear: `
      precision mediump float;
  
      void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      }
    `,
  
    fs2: `
      precision mediump float;
  
      uniform vec2 resolution;
  
      vec3 rgb(float r, float g, float b) {
        return vec3(r / 255.0, g / 255.0, b / 255.0);
      }
  
      vec4 circle(vec2 uv, vec2 pos, float rad, vec3 color) {
        float d = length(pos - uv) - rad;
        float t = clamp(d, 0.0, 1.0);
        return vec4(color, 1.0 - t);
      }
  
      void main () {
  
        vec2 uv = gl_FragCoord.xy;
        vec2 center = resolution.xy * 0.5;
        float radius = 0.25 * resolution.y;
  
        // Background layer
        vec4 layer1 = vec4(rgb(210.0, 222.0, 228.0), 1.0);
        
        // Circle
        vec3 red = rgb(225.0, 95.0, 60.0);
        vec4 layer2 = circle(uv, center, radius, red);
        
        // Blend the two
        gl_FragColor = mix(layer1, layer2, layer2.a);
  
      }
    `,
  
  };