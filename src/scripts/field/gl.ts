/** Minimal WebGL2 helpers: compile a program, look up its locations, upload float buffers. */

export function createProgram(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const shader = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader failed');
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, shader(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'link failed');
  const uniforms = new Map<string, WebGLUniformLocation | null>();
  return {
    program: p,
    u(name: string) {
      if (!uniforms.has(name)) uniforms.set(name, gl.getUniformLocation(p, name));
      return uniforms.get(name)!;
    },
    a(name: string) {
      return gl.getAttribLocation(p, name);
    },
  };
}

export type Program = ReturnType<typeof createProgram>;

/** Uploads `data` to a buffer bound to attribute `name` with `size` floats per vertex. */
export function attribute(gl: WebGL2RenderingContext, prog: Program, name: string, data: Float32Array, size: number, existing?: WebGLBuffer) {
  const loc = prog.a(name);
  const buf = existing ?? gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  if (loc >= 0) {
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
  }
  return buf;
}

/** "#2c3be0" or "rgb(44 59 224)" to linear-ish 0..1 floats (the canvas blends in sRGB like the page). */
export function cssColor(value: string): [number, number, number] {
  const v = value.trim();
  if (v.startsWith('#')) {
    const h = v.length === 4 ? v.slice(1).split('').map((c) => c + c).join('') : v.slice(1, 7);
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number];
  }
  const n = v.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
  return [n[0] / 255, n[1] / 255, n[2] / 255];
}
