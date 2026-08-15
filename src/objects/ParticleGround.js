import * as THREE from 'three';
import { createGlowDiscTexture } from '../utils/textures.js';
import { getPerformanceConfig } from '../utils/device.js';

export class ParticleGround {
    constructor(scene) {
        this.scene = scene;
        const perf = getPerformanceConfig();
        this.gridX = perf.groundGridX || 80;
        this.gridZ = perf.groundGridZ || 80;
        this.count = this.gridX * this.gridZ;

        this.initGeometry();
        this.initMaterial();
        this.initPoints();
    }

    initGeometry() {
        this.geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.count * 3);
        const gridCoords = new Float32Array(this.count * 2);
        const colors = new Float32Array(this.count * 3);
        const sizes = new Float32Array(this.count);

        const palette = [
            new THREE.Color('#ff003c'),
            new THREE.Color('#ff1744'),
            new THREE.Color('#ff2a6d'),
            new THREE.Color('#e50938'),
            new THREE.Color('#ff5983')
        ];

        const carpetWidth = 36.0;
        const carpetDepth = 36.0;
        const groundY = -4.6;

        let idx = 0;
        for (let ix = 0; ix < this.gridX; ix++) {
            for (let iz = 0; iz < this.gridZ; iz++) {
                const i3 = idx * 3;
                const i2 = idx * 2;

                const u = (ix / (this.gridX - 1)) * 2 - 1;
                const v = (iz / (this.gridZ - 1)) * 2 - 1;

                const x = u * (carpetWidth / 2);
                const z = v * (carpetDepth / 2);
                const y = groundY;

                positions[i3] = x;
                positions[i3 + 1] = y;
                positions[i3 + 2] = z;

                gridCoords[i2] = u;
                gridCoords[i2 + 1] = v;

                const centerDist = Math.sqrt(u * u + v * v);
                const col = (centerDist < 0.35 && Math.random() < 0.25)
                    ? new THREE.Color('#ffffff')
                    : palette[Math.floor(Math.random() * palette.length)];

                colors[i3] = col.r;
                colors[i3 + 1] = col.g;
                colors[i3 + 2] = col.b;

                const isGridLine = (ix % 4 === 0) || (iz % 4 === 0);
                sizes[idx] = (isGridLine ? 6.5 : 4.2) * (0.8 + Math.random() * 0.4);

                idx++;
            }
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('aGridCoord', new THREE.BufferAttribute(gridCoords, 2));
        this.geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
        this.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    }

    initMaterial() {
        const glowTexture = createGlowDiscTexture(64);
        this.uniforms = {
            uTime: { value: 0 },
            uTexture: { value: glowTexture },
            uAlpha: { value: 0.0 }
        };

        const vertexShader = `
            attribute vec2 aGridCoord;
            attribute vec3 aColor;
            attribute float aSize;

            uniform float uTime;
            uniform float uAlpha;

            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                vec3 pos = position;

                float dist = length(aGridCoord);
                float wave = sin(dist * 7.0 - uTime * 1.8) * 0.32 + sin(pos.x * 0.2 + uTime * 0.8) * 0.15;
                pos.y += wave;

                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mvPosition;

                float edgeFade = smoothstep(1.15, 0.3, dist);
                float rippleGlow = 0.5 + 0.5 * sin(dist * 7.0 - uTime * 1.8);
                gl_PointSize = (aSize * (0.85 + rippleGlow * 0.35)) * (11.0 / -mvPosition.z);

                vColor = aColor + vec3(rippleGlow * 0.2);
                vAlpha = uAlpha * edgeFade * (0.45 + 0.55 * rippleGlow);
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
