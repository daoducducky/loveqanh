import * as THREE from 'three';
import { createSparkleTexture } from '../utils/textures.js';
import { getPerformanceConfig } from '../utils/device.js';
import { randomRange, randomGaussian } from '../utils/random.js';

export class Sparkles {
    constructor(scene) {
        this.scene = scene;
        const perf = getPerformanceConfig();
        this.count = perf.sparkleCount;

        this.initGeometry();
        this.initMaterial();
        this.initPoints();
    }

    initGeometry() {
        this.geometry = new THREE.BufferGeometry();

        const positions = new Float32Array(this.count * 3);
        const colors = new Float32Array(this.count * 3);
        const sizes = new Float32Array(this.count);
        const phases = new Float32Array(this.count);
        const speeds = new Float32Array(this.count);

        const palette = [
            new THREE.Color('#ffffff'),
            new THREE.Color('#fff0f5'),
            new THREE.Color('#ffd700'),
            new THREE.Color('#ffb6c1'),
            new THREE.Color('#ff69b4')
        ];

        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3;

            // Distributed in a sphere around scene
            const r = randomGaussian(0, 12);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);

            positions[i3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) + 1.0;
            positions[i3 + 2] = r * Math.cos(phi);

            const col = palette[Math.floor(Math.random() * palette.length)];
            colors[i3] = col.r;
            colors[i3 + 1] = col.g;
            colors[i3 + 2] = col.b;

            sizes[i] = randomRange(24, 48);
            phases[i] = Math.random() * Math.PI * 2;
            speeds[i] = randomRange(1.5, 4.0);
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
        this.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
        this.geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
        this.geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    }

    initMaterial() {
        const sparkleTex = createSparkleTexture(128);

        this.uniforms = {
            uTime: { value: 0 },
            uTexture: { value: sparkleTex },
            uAlpha: { value: 0.0 }
        };

        const vertexShader = `
            attribute vec3 aColor;
            attribute float aSize;
            attribute float aPhase;
            attribute float aSpeed;

            uniform float uTime;
            uniform float uAlpha;

            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mvPosition;

                // Sharp sparkling pulse
                float sparkle = pow(0.5 + 0.5 * sin(uTime * aSpeed + aPhase), 4.0);
                gl_PointSize = (aSize * (0.3 + sparkle * 1.8)) * (16.0 / -mvPosition.z);

                vColor = aColor + vec3(sparkle * 0.4);
                vAlpha = uAlpha * (0.2 + 0.8 * sparkle);
            }
        `;

        const fragmentShader = `
            uniform sampler2D uTexture;
            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                vec4 texColor = texture2D(uTexture, gl_PointCoord);
                if (texColor.a < 0.05) discard;
                gl_FragColor = vec4(vColor * texColor.rgb, texColor.a * vAlpha);
            }
        `;

        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader,
            fragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
    }

    initPoints() {
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
    }

    update(time) {
        this.uniforms.uTime.value = time;
    }

    setAlpha(val) {
        this.uniforms.uAlpha.value = val;
    }

    dispose() {
        if (this.geometry) this.geometry.dispose();
        if (this.material) this.material.dispose();
        this.scene.remove(this.points);
    }
}
