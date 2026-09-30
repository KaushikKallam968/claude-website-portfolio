import { attribute, createProgram, type Program } from './gl';

/**
 * The Field: one crowd of dots that can be three things. A dot has a place in Kaushik's name, a place on
 * the world map and a place in the portrait of the visit; `stage` moves the crowd between them
 * (0 name, 1 world, 2 visit). A second, smaller layer draws the route, the places and the traveller.
 */

const DOTS_VS = /* glsl */ `#version 300 es
precision highp float;
in vec3 aName;   // px from the name's top-left, alpha
in vec4 aMap;    // projected x, y; longitude, latitude (radians)
in vec4 aMeta;   // stagger, orbit radius, orbit phase, map alpha
in vec3 aVisit;  // px from the portrait's top-left, alpha
uniform vec2 uRes;
uniform float uDpr;
uniform float uStage;
uniform vec2 uNameAt;
uniform vec2 uVisitAt;
uniform vec3 uCam;
uniform float uScale;
uniform vec2 uSun;
uniform float uTime;
uniform float uMapIn;
uniform float uMapVis;
uniform float uNameVis;
uniform float uVisitVis;
uniform float uNameDot;
uniform float uMapDot;
uniform float uVisitDot;
uniform vec3 uTrail[20];
uniform vec3 uInk;
uniform vec3 uNote;
uniform float uClip;
out vec4 vColor;
out float vSize;

float inout3(float t) { return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) * 0.5; }

void main() {
  vec2 namePos = uNameAt + aName.xy;
  vec2 mapPos = uRes * 0.5 + vec2(aMap.x - uCam.x, uCam.y - aMap.y) * uScale * uCam.z;
  vec2 visitPos = uVisitAt + aVisit.xy;

  float lag = aMeta.x * 0.45;
  float t1 = inout3(clamp((uStage - lag) / 0.55, 0.0, 1.0));
  float t2 = inout3(clamp((uStage - 1.0 - lag) / 0.55, 0.0, 1.0));
  vec2 p = mix(mix(namePos, mapPos, t1), visitPos, t2);

  // In flight every dot keeps its own small orbit, so the crowd moves like ink in water rather than sliding.
  float flight = sin(3.14159 * t1) + sin(3.14159 * t2);
  float ang = aMeta.z * 6.28318 + uTime * 0.7;
  p += vec2(cos(ang), sin(ang * 1.3)) * flight * aMeta.y;

  // The live terminator: night land dims, and the band where the sun is on the horizon turns blue.
  float cosZ = sin(aMap.w) * sin(uSun.x) + cos(aMap.w) * cos(uSun.x) * cos(aMap.z - uSun.y);
  float day = smoothstep(-0.05, 0.05, cosZ);
  float dusk = 1.0 - smoothstep(0.0, 0.06, abs(cosZ));

  float appear = clamp((uMapIn - aMeta.x * 0.7) / 0.3, 0.0, 1.0);
  float mapA = aMeta.w * uMapVis * appear * mix(0.5, 0.92, day);
  float a = mix(mix(aName.z * uNameVis, mapA, t1), aVisit.z * uVisitVis, t2);

  // Attention: the pointer's recent path warms the letters it passes and nudges them aside.
  float heat = 0.0;
  for (int i = 0; i < 20; i++) {
    vec2 d = p - uTrail[i].xy;
    heat += uTrail[i].z * exp(-dot(d, d) / 5000.0);
  }
  heat = clamp(heat, 0.0, 1.0) * (1.0 - t1);
  vec2 away = p - uTrail[0].xy;
  float dist = max(length(away), 0.001);
  p += (away / dist) * uTrail[0].z * 16.0 * exp(-dist * dist / 3200.0) * (1.0 - t1);

  float size = mix(uNameDot * (1.0 + heat * 0.85), uMapDot * mix(0.78, 1.0, day) * pow(uCam.z, 0.72), t1);
  size = mix(size, uVisitDot, t2);
  vec3 col = mix(uInk, uNote, max(heat, dusk * t1 * (1.0 - t2) * 0.85));
  // Above uClip only the portrait may show: the closing section is a window onto the world.
  a *= mix(smoothstep(uClip, uClip + 60.0, p.y), 1.0, aVisit.z * t2);
  vColor = vec4(col, a);
  vSize = size * uDpr;
  gl_PointSize = vSize;
  vec2 clip = p / uRes * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}`;

const DOT_FS = /* glsl */ `#version 300 es
precision mediump float;
in vec4 vColor;
in float vSize;
out vec4 outColor;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float aa = 1.2 / max(vSize, 1.0);
  float m = 1.0 - smoothstep(0.5 - aa, 0.5, d);
  outColor = vec4(vColor.rgb, 1.0) * vColor.a * m;
}`;

const ROUTE_VS = /* glsl */ `#version 300 es
precision highp float;
in vec2 aPos;    // projected
in vec4 aInfo;   // t along the route, kind (0 route, 1 place, 2 ring, 3 traveller), index, unused
uniform vec2 uRes;
uniform float uDpr;
uniform vec3 uCam;
uniform float uScale;
uniform float uRoute;
uniform float uVis;
uniform float uTime;
uniform vec3 uLeg;      // from t, to t, progress
uniform vec2 uTraveller;
uniform float uActive;  // t of the place being read, or -1
uniform vec3 uNote;
uniform vec3 uInk;
uniform float uClip;
out vec4 vColor;
out float vSize;
flat out float vKind;
out float vRing;

void main() {
  float kind = aInfo.y;
  vec2 pos = kind > 2.5 ? uTraveller : aPos;
  vec2 p = uRes * 0.5 + vec2(pos.x - uCam.x, uCam.y - pos.y) * uScale * uCam.z;
  float shown = step(aInfo.x, uRoute + 0.0001);
  float zoomSize = clamp(sqrt(uCam.z), 1.0, 2.6);
  float lo = min(uLeg.x, uLeg.y);
  float hi = max(uLeg.x, uLeg.y);
  bool onLeg = uLeg.z > 0.0 && aInfo.x >= lo - 0.0001 && aInfo.x <= hi + 0.0001;
  float size = 2.0 * zoomSize;
  float a = shown * uVis;
  vRing = 0.0;
  vec3 col = uNote;
  if (kind < 0.5) {
    a *= onLeg ? 1.0 : 0.55;
  } else if (kind < 1.5) {
    size = 7.0;
    col = abs(aInfo.x - uActive) < 0.0001 ? uNote : uInk;
  } else if (kind < 2.5) {
    float phase = fract(uTime * 0.45 + aInfo.z * 0.19);
    vRing = phase;
    size = 64.0;
    a *= (1.0 - phase) * (abs(aInfo.x - uActive) < 0.0001 ? 0.9 : 0.25);
  } else {
    size = 11.0;
    a = uVis * step(0.001, uLeg.z) * (1.0 - step(0.999, uLeg.z));
  }
  a *= smoothstep(uClip, uClip + 60.0, p.y);
  vColor = vec4(col, a);
  vKind = kind;
  vSize = size * uDpr;
  gl_PointSize = vSize;
  vec2 clip = p / uRes * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}`;

const ROUTE_FS = /* glsl */ `#version 300 es
precision mediump float;
in vec4 vColor;
in float vSize;
flat in float vKind;
in float vRing;
out vec4 outColor;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float aa = 1.2 / max(vSize, 1.0);
  float m;
  if (vKind > 1.5 && vKind < 2.5) {
    float r = 0.08 + vRing * 0.4;
    m = 1.0 - smoothstep(0.0, aa * 1.5, abs(d - r) - aa * 0.6);
  } else if (vKind > 2.5) {
    m = 1.0 - smoothstep(0.5 - aa, 0.5, d);
    m = max(m * step(d, 0.26), (1.0 - smoothstep(0.0, aa * 2.0, abs(d - 0.44) - aa)) * 0.9);
  } else {
    m = 1.0 - smoothstep(0.5 - aa, 0.5, d);
  }
  outColor = vec4(vColor.rgb, 1.0) * vColor.a * m;
}`;

export interface Camera {
  x: number;
  y: number;
  z: number;
}

export interface FieldFrame {
  stage: number;
  mapIn: number;
  mapVis: number;
  nameVis: number;
  visitVis: number;
  cam: Camera;
  route: number;
  routeVis: number;
  leg: [number, number, number];
  traveller: [number, number];
  active: number;
  nameAt: [number, number];
  visitAt: [number, number];
  trail: Float32Array;
  sun: [number, number];
  time: number;
  clip: number;
}

export interface Colors {
  ink: [number, number, number];
  note: [number, number, number];
}

export class FieldRenderer {
  readonly gl: WebGL2RenderingContext;
  private dots: Program;
  private route: Program;
  private dotsVao: WebGLVertexArrayObject;
  private routeVao: WebGLVertexArrayObject;
  private dotBuffers = new Map<string, WebGLBuffer>();
  private dotCount = 0;
  private routeCount = 0;
  width = 0;
  height = 0;
  dpr = 1;
  scale = 1;
  sizes = { name: 3, map: 2.2, visit: 4 };
  colors: Colors = { ink: [0.07, 0.07, 0.06], note: [0.17, 0.23, 0.88] };

  constructor(readonly canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'high-performance' });
    if (!gl) throw new Error('WebGL2 unavailable');
    this.gl = gl;
    this.dots = createProgram(gl, DOTS_VS, DOT_FS);
    this.route = createProgram(gl, ROUTE_VS, ROUTE_FS);
    this.dotsVao = gl.createVertexArray()!;
    this.routeVao = gl.createVertexArray()!;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }

  resize(width: number, height: number, dpr: number, mapWidthUnits: number) {
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    // At zoom 1 the whole world is a little wider than the screen, on any screen.
    this.scale = (Math.max(width, height * 1.6) * 1.08) / mapWidthUnits;
  }

  setDots(data: { name: Float32Array; map: Float32Array; meta: Float32Array; visit: Float32Array }, count: number) {
    const gl = this.gl;
    gl.bindVertexArray(this.dotsVao);
    const put = (attr: string, arr: Float32Array, size: number) =>
      this.dotBuffers.set(attr, attribute(gl, this.dots, attr, arr, size, this.dotBuffers.get(attr)));
    put('aName', data.name, 3);
    put('aMap', data.map, 4);
    put('aMeta', data.meta, 4);
    put('aVisit', data.visit, 3);
    gl.bindVertexArray(null);
    this.dotCount = count;
  }

  /** Only the portrait changes after the start, so it can be replaced on its own. */
  setVisit(visit: Float32Array) {
    const gl = this.gl;
    gl.bindVertexArray(this.dotsVao);
    this.dotBuffers.set('aVisit', attribute(gl, this.dots, 'aVisit', visit, 3, this.dotBuffers.get('aVisit')));
    gl.bindVertexArray(null);
  }

  setRoute(pos: Float32Array, info: Float32Array, count: number) {
    const gl = this.gl;
    gl.bindVertexArray(this.routeVao);
    attribute(gl, this.route, 'aPos', pos, 2);
    attribute(gl, this.route, 'aInfo', info, 4);
    gl.bindVertexArray(null);
    this.routeCount = count;
  }

  clear() {
    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  draw(f: FieldFrame) {
    const gl = this.gl;
    this.clear();
    const { ink, note } = this.colors;

    const d = this.dots;
    gl.useProgram(d.program);
    gl.uniform2f(d.u('uRes'), this.width, this.height);
    gl.uniform1f(d.u('uDpr'), this.dpr);
    gl.uniform1f(d.u('uStage'), f.stage);
    gl.uniform2f(d.u('uNameAt'), f.nameAt[0], f.nameAt[1]);
    gl.uniform2f(d.u('uVisitAt'), f.visitAt[0], f.visitAt[1]);
    gl.uniform3f(d.u('uCam'), f.cam.x, f.cam.y, f.cam.z);
    gl.uniform1f(d.u('uScale'), this.scale);
    gl.uniform2f(d.u('uSun'), f.sun[0], f.sun[1]);
    gl.uniform1f(d.u('uTime'), f.time);
    gl.uniform1f(d.u('uMapIn'), f.mapIn);
    gl.uniform1f(d.u('uMapVis'), f.mapVis);
    gl.uniform1f(d.u('uNameVis'), f.nameVis);
    gl.uniform1f(d.u('uVisitVis'), f.visitVis);
    gl.uniform1f(d.u('uNameDot'), this.sizes.name);
    gl.uniform1f(d.u('uMapDot'), this.sizes.map);
    gl.uniform1f(d.u('uVisitDot'), this.sizes.visit);
    gl.uniform3fv(d.u('uTrail'), f.trail);
    gl.uniform3f(d.u('uInk'), ...ink);
    gl.uniform3f(d.u('uNote'), ...note);
    gl.uniform1f(d.u('uClip'), f.clip);
    gl.bindVertexArray(this.dotsVao);
    gl.drawArrays(gl.POINTS, 0, this.dotCount);

    if (f.routeVis > 0.001 && this.routeCount) {
      const r = this.route;
      gl.useProgram(r.program);
      gl.uniform2f(r.u('uRes'), this.width, this.height);
      gl.uniform1f(r.u('uDpr'), this.dpr);
      gl.uniform3f(r.u('uCam'), f.cam.x, f.cam.y, f.cam.z);
      gl.uniform1f(r.u('uScale'), this.scale);
      gl.uniform1f(r.u('uRoute'), f.route);
      gl.uniform1f(r.u('uVis'), f.routeVis);
      gl.uniform1f(r.u('uTime'), f.time);
      gl.uniform3f(r.u('uLeg'), ...f.leg);
      gl.uniform2f(r.u('uTraveller'), ...f.traveller);
      gl.uniform1f(r.u('uActive'), f.active);
      gl.uniform3f(r.u('uNote'), ...note);
      gl.uniform3f(r.u('uInk'), ...ink);
      gl.uniform1f(r.u('uClip'), f.clip);
      gl.bindVertexArray(this.routeVao);
      gl.drawArrays(gl.POINTS, 0, this.routeCount);
    }
    gl.bindVertexArray(null);
  }
}
