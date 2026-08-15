import * as THREE from 'three';
import { createGlowDiscTexture } from '../utils/textures.js';
import { getPerformanceConfig } from '../utils/device.js';

export class ParticleHeart {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.config = config;
        const perf = getPerformanceConfig();
        this.particleCount = perf.heartParticles;

        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.group.rotation.x = 0.12;

        this.initGeometry();
        this.initMaterial();
        this.initPoints();
    }

    initGeometry() {
        this.geometry = new THREE.BufferGeometry();

        const positions = new Float32Array(this.particleCount * 3);
        const startPositions = new Float32Array(this.particleCount * 3);
        const targetPositions = new Float32Array(this.particleCount * 3);
        const goldColors = new Float32Array(this.particleCount * 3);
        const redColors = new Float32Array(this.particleCount * 3);
        const sizes = new Float32Array(this.particleCount);
        const phases = new Float32Array(this.particleCount);
        const sparkleSpeeds = new Float32Array(this.particleCount);

        const goldPalette = [
            new THREE.Color('#FFD76A'),
            new THREE.Color('#FFC837'),
            new THREE.Color('#FFE58F'),
            new THREE.Color('#FFF1B0'),
            new THREE.Color('#E6A817')
        ];

        const redPalette = [
            new THREE.Color('#ff003c'),
            new THREE.Color('#ff1744'),
            new THREE.Color('#e50938'),
            new THREE.Color('#d00036'),
            new THREE.Color('#ff2a6d'),
            new THREE.Color('#ff4081')
        ];

        const scale = 0.235;

        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            const u = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 2;

            const isShell = Math.random() < 0.70;
            const r = isShell ? (0.93 + Math.random() * 0.07) : (0.2 + Math.pow(Math.random(), 0.5) * 0.73);

            const hx = 16 * Math.pow(Math.sin(u), 3);
            const hy = 13 * Math.cos(u) - 5 * Math.cos(2 * u) - 2 * Math.cos(3 * u) - Math.cos(4 * u);

            const normX = hx / 16.0;
            const heightFactor = Math.max(0.05, 1.0 - Math.abs(hy - 2.0) / 19.0);
            
            const zMax = Math.sqrt(Math.max(0, 1.0 - normX * normX)) * 5.8 * Math.pow(heightFactor, 0.7);
            const hz = isShell ? (Math.sin(phi) * zMax) : ((Math.random() * 2 - 1) * zMax * r);

            targetPositions[i3] = hx * r * scale;
            targetPositions[i3 + 1] = (hy * r + 1.2) * scale;
            targetPositions[i3 + 2] = hz * scale;

            const spiralAngle = Math.random() * Math.PI * 12;
            const spiralDist = 14 + Math.random() * 30;
            const spiralHeight = (Math.random() - 0.5) * 32;

            startPositions[i3] = Math.cos(spiralAngle) * spiralDist;
            startPositions[i3 + 1] = spiralHeight;
            startPositions[i3 + 2] = Math.sin(spiralAngle) * spiralDist;

            positions[i3] = startPositions[i3];
            positions[i3 + 1] = startPositions[i3 + 1];
            positions[i3 + 2] = startPositions[i3 + 2];

            const goldCol = goldPalette[Math.floor(Math.random() * goldPalette.length)];
            goldColors[i3] = goldCol.r;
            goldColors[i3 + 1] = goldCol.g;
            goldColors[i3 + 2] = goldCol.b;

            const redCol = redPalette[Math.floor(Math.random() * redPalette.length)];
            redColors[i3] = redCol.r;
            redColors[i3 + 1] = redCol.g;
            redColors[i3 + 2] = redCol.b;

            sizes[i] = (isShell ? 8.0 : 5.8) * (0.85 + Math.random() * 0.35);
            phases[i] = Math.random() * Math.PI * 2;
            sparkleSpeeds[i] = 1.2 + Math.random() * 2.5;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('aStartPos', new THREE.BufferAttribute(startPositions, 3));
        this.geometry.setAttribute('aTargetPos', new THREE.BufferAttribute(targetPositions, 3));
        this.geometry.setAttribute('aGoldColor', new THREE.BufferAttribute(goldColors, 3));
        this.geometry.setAttribute('aRedColor', new THREE.BufferAttribute(redColors, 3));
        this.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
        this.geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
        this.geometry.setAttribute('aSparkleSpeed', new THREE.BufferAttribute(sparkleSpeeds, 1));
    }

    initMaterial() {
        const discTexture = createGlowDiscTexture(64);

        this.uniforms = {
            uTime: { value: 0 },
            uConvergence: { value: 0.0 },
            uColorMode: { value: 0.0 },
            uTexture: { value: discTexture },
            uHeartScale: { value: 1.0 },
            uPulse: { value: 0.0 },
            uGlobalAlpha: { value: 0.0 }
        };

        const vertexShader = `
            attribute vec3 aStartPos;
            attribute vec3 aTargetPos;
            attribute vec3 aGoldColor;
            attribute vec3 aRedColor;
            attribute float aSize;
            attribute float aPhase;
            attribute float aSparkleSpeed;

            uniform float uTime;
            uniform float uConvergence;
            uniform float uColorMode;
            uniform float uHeartScale;
            uniform float uPulse;
            uniform float uGlobalAlpha;

            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                float t = clamp(uConvergence, 0.0, 1.0);
                float ease = smoothstep(0.0, 1.0, t);
                float swirlAngle = (1.0 - ease) * 3.5;
                mat2 rot = mat2(cos(swirlAngle), -sin(swirlAngle), sin(swirlAngle), cos(swirlAngle));
                
                vec3 mixedPos = mix(aStartPos, aTargetPos, ease);
                mixedPos.xz = mix(rot * mixedPos.xz, mixedPos.xz, ease);

                if (t > 0.5) {
                    float osc = (t - 0.5) / 0.5;
                    float smallAmount = 0.035 * osc;
                    mixedPos.x += sin(uTime * 2.0 + aPhase) * smallAmount;
                    mixedPos.y += cos(uTime * 1.8 + aPhase * 1.2) * smallAmount;
                    mixedPos.z += sin(uTime * 2.5 + aPhase * 0.8) * (smallAmount * 1.2);
                }

                vec3 finalPos = mixedPos * (uHeartScale + uPulse * 0.04);
                vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
                gl_Position = projectionMatrix * mvPosition;

                float sparkle = 0.5 + 0.5 * sin(uTime * aSparkleSpeed + aPhase);
                float sizeSparkle = mix(0.85, 1.25, sparkle);

                gl_PointSize = (aSize * sizeSparkle) * (11.5 / -mvPosition.z);

                vec3 baseCol = mix(aGoldColor, aRedColor, uColorMode);
                vColor = baseCol + vec3(sparkle * 0.12);
                vAlpha = uGlobalAlpha * mix(0.75, 1.0, sparkle);
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
        this.group.add(this.points);
    }

    update(time) {
        this.uniforms.uTime.value = time;
        if (this.uniforms.uColorMode.value > 0.5) {
            const beatTime = (time * 1.3) % Math.PI;
            const doubleBeat = Math.pow(Math.sin(beatTime), 8.0) * 0.04 + Math.pow(Math.sin(beatTime + 0.32), 12.0) * 0.02;
            this.uniforms.uPulse.value = doubleBeat;
        }

        this.group.rotation.y = Math.sin(time * 0.35) * 0.32;
        this.group.rotation.x = 0.12 + Math.cos(time * 0.25) * 0.08;
    }

    setConvergence(val) { this.uniforms.uConvergence.value = val; }
    setColorMode(val) { this.uniforms.uColorMode.value = val; }
    setAlpha(val) { this.uniforms.uGlobalAlpha.value = val; }
    setScale(val) { this.uniforms.uHeartScale.value = val; }
}
