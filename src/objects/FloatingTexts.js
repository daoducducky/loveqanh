import * as THREE from 'three';
import { createNeonTextTexture } from '../utils/textures.js';
import { getPerformanceConfig } from '../utils/device.js';
import { randomRange, randomChoice } from '../utils/random.js';

export class FloatingTexts {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.config = config;
        const perf = getPerformanceConfig();
        this.count = perf.floatingTextCount;

        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.textItems = [];
        this.globalAlpha = 0.0;

        this.messages = this.config.messages || [
            "I LOVE YOU",
            "Forever",
            "Love You",
            "Together",
            "Our Love",
            "❤️"
        ];

        this.initTexts();
    }

    initTexts() {
        // Pre-create textures for all unique messages to share GPU memory
        this.textureMap = new Map();
        const colors = ['#ff4d91', '#ff77aa', '#ff2f75', '#ff99c8', '#ffffff'];

        this.messages.forEach(msg => {
            const col = randomChoice(colors);
            const texData = createNeonTextTexture(msg, {
                fontSize: 56,
                color: col,
                glowColor: '#ff0055',
                fontWeight: '700'
            });
            this.textureMap.set(msg, texData);
        });

        for (let i = 0; i < this.count; i++) {
            const msg = this.messages[i % this.messages.length];
            const texData = this.textureMap.get(msg);

            const material = new THREE.SpriteMaterial({
                map: texData.texture,
                transparent: true,
                opacity: 0,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            const sprite = new THREE.Sprite(material);

            // Stagger initial Z distribution from far behind to near camera
            const z = randomRange(-35, 8);
            const x = randomRange(-18, 18);
            const y = randomRange(-7, 12);

            sprite.position.set(x, y, z);

            // Sprite aspect ratio
            const height = 1.4 * randomRange(0.85, 1.25);
            const width = height * texData.aspectRatio;
            sprite.scale.set(width, height, 1.0);

            const item = {
                sprite,
                material,
                texData,
                baseWidth: width,
                baseHeight: height,
                speedZ: randomRange(1.8, 3.8), // Camera fly-through speed
                driftX: randomRange(-0.2, 0.2),
                driftY: randomRange(0.1, 0.4),
                phase: Math.random() * Math.PI * 2,
                swayFreq: randomRange(0.4, 1.2)
            };

            this.textItems.push(item);
            this.group.add(sprite);
        }
    }

    update(time, delta) {
        for (let i = 0; i < this.textItems.length; i++) {
            const item = this.textItems[i];
            const pos = item.sprite.position;

            // Travel along Z towards camera
            pos.z += item.speedZ * delta;
            pos.x += Math.sin(time * item.swayFreq + item.phase) * 0.4 * delta;
            pos.y += item.driftY * delta;

            // Perspective fade calculation based on Z distance to camera (camera at Z ~ 12-14)
            let zFade = 1.0;
            if (pos.z < -25) {
                // Fade in as it approaches from deep distance
                zFade = THREE.MathUtils.smoothstep(pos.z, -35, -25);
            } else if (pos.z > 8) {
                // Fade out as it passes through the camera
                zFade = 1.0 - THREE.MathUtils.smoothstep(pos.z, 8, 14);
            }

            // Reset when passed behind camera
            if (pos.z > 14) {
                pos.z = -35;
                pos.x = randomRange(-18, 18);
                pos.y = randomRange(-7, 10);

                // Pick a new message occasionally
                const newMsg = randomChoice(this.messages);
                const newTex = this.textureMap.get(newMsg);
                if (newTex) {
                    item.material.map = newTex.texture;
                    item.texData = newTex;
                    const height = 1.4 * randomRange(0.85, 1.25);
                    item.sprite.scale.set(height * newTex.aspectRatio, height, 1.0);
                }
            }

            const twinkle = 0.85 + 0.15 * Math.sin(time * 2.5 + item.phase);
            item.material.opacity = this.globalAlpha * zFade * twinkle * 0.85;
        }
    }

    setAlpha(val) {
        this.globalAlpha = val;
    }

    dispose() {
        this.textItems.forEach(t => {
            if (t.material) t.material.dispose();
        });
        this.textureMap.forEach(texData => {
            if (texData.texture) texData.texture.dispose();
        });
        this.scene.remove(this.group);
    }
}
