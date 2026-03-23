"use client"

import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Triangle } from 'ogl'

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return [0.529, 0.306, 0.996]
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ]
}

const vertex = `#version 300 es
in vec2 position;
out vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragment = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;
in vec2 vUv;
out vec4 fragColor;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = G * sin(G * texCoord);
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c) * uv;
}

void main() {
  float rnd     = noise(gl_FragCoord.xy);
  vec2  uv      = rotateUvs(vUv * uScale, uRotation);
  vec2  tex     = uv * uScale;
  float tOffset = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
    0.4 * sin(5.0 * (tex.x + tex.y +
                     cos(3.0 * tex.x + 5.0 * tex.y) +
                     0.02 * tOffset) +
             sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  fragColor = col;
}
`

interface SilkProps {
  color?: string
  speed?: number
  scale?: number
  noiseIntensity?: number
  rotation?: number
}

export default function Silk({
  color = '#064673',
  speed = 2,
  scale = 0.6,
  noiseIntensity = 0,
  rotation = 0,
}: SilkProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const propsRef = useRef({ color, speed, scale, noiseIntensity, rotation })
  propsRef.current = { color, speed, scale, noiseIntensity, rotation }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new Renderer({ webgl: 2, alpha: false, antialias: false, dpr: Math.min(window.devicePixelRatio || 1, 2) })
    const gl = renderer.gl
    const canvas = gl.canvas as HTMLCanvasElement
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    container.appendChild(canvas)

    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime:          { value: 0 },
        uColor:         { value: new Float32Array(hexToRgb(color)) },
        uSpeed:         { value: speed },
        uScale:         { value: scale },
        uNoiseIntensity:{ value: noiseIntensity },
        uRotation:      { value: rotation },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })

    const setSize = () => {
      const rect = container.getBoundingClientRect()
      renderer.setSize(Math.max(1, Math.floor(rect.width)), Math.max(1, Math.floor(rect.height)))
    }

    const ro = new ResizeObserver(setSize)
    ro.observe(container)
    setSize()

    let raf = 0
    const t0 = performance.now()
    const loop = (t: number) => {
      const p = propsRef.current
      const elapsed = (t - t0) * 0.001 * 0.1
      program.uniforms.uTime.value          = elapsed
      program.uniforms.uSpeed.value         = p.speed
      program.uniforms.uScale.value         = p.scale
      program.uniforms.uNoiseIntensity.value = p.noiseIntensity
      program.uniforms.uRotation.value      = p.rotation
      const rgb = hexToRgb(p.color);
      (program.uniforms.uColor.value as Float32Array).set(rgb)
      renderer.render({ scene: mesh })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      try { container.removeChild(canvas) } catch {}
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden' }}
    />
  )
}
