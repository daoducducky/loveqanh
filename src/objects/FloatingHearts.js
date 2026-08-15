import * as THREE from 'three';
import { createHeartTexture } from '../utils/textures.js';
import { getPerformanceConfig } from '../utils/device.js';
import { randomRange } from '../utils/random.js';

export class FloatingHearts {
    constructor(scene) {
        this.scene = scene;
        const perf = getPerformanceConfig();
        this.count = perf.floatingHeartCount;

        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.hearts = [];
        this.globalAlpha = 0.0;

        this.initHearts();
    }

    initHearts() {
        const heartTexture = createHeartTexture(256, '#ff6b8b');
        const palette = [
            '#ff7b9c',
            '#ff8daa',
            '#ff4f7b',
            '#ff5e83',
            '#ffa3ba',
            '#ffffff'
        ];

        for (let i = 0; i < this.count; i++) {
            const col = palette[Math.floor(Math.random() * palette.length)];
            const tex = createHeartTexture(256, col);

            const material = new THREE.SpriteMaterial({
                map: tex,
                transparent: true,
                opacity: 0,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            const sprite = new THREE.Sprite(material);

            // Distribution in 3D volume
            const z = randomRange(-25, 8);
            const x = randomRange(-18, 18);
            const y = randomRange(-10, 15);

            sprite.position.set(x, y, z);

            // Base scale depends on depth for realistic perspective
            const depthFactor = (z + 25) / 33; // 0 (far) to 1 (near)
            const baseScale = (0.6 + depthFactor * 1.6) * randomRange(0.8, 1.4);
            sprite.scale.set(baseScale, baseScale, 1.0);

            const heartData = {
                sprite,
                material,
                baseScale,
                speedY: randomRange(0.6, 1.8),
                swayFreq: randomRange(0.5, 1.5),
                swayAmp: randomRange(0.4, 1.2),
                phase: Math.random() * Math.PI * 2,
                initialZ: z,
                targetOpacity: (0.35 + depthFactor * 0.5) * randomRange(0.7, 1.0)
            };

            this.hearts.push(heartData);
            this.group.add(sprite);
        }
    }

    update(time, delta) {
        for (let i = 0; i < this.hearts.length; i++) {
            const h = this.hearts[i];
            const pos = h.sprite.position;

            // Upward drift
            pos.y += h.speedY * delta;

            // Gentle sinusoidal sway
            pos.x += Math.sin(time * h.swayFreq + h.phase) * h.swayAmp * delta;
            
            // Subtle Z breathing
            pos.z = h.initialZ + Math.cos(time * 0.8 + h.phase) * 0.4;

            // Reset when reaching top boundary
            if (pos.y > 16) {
                pos.y = -10;
                pos.x = randomRange(-18, 18);
                h.initialZ = randomRange(-25, 8);
                pos.z = h.initialZ;
            }

            // Opacity modulation
            h.material.opacity = this.globalAlpha * h.targetOpacity * (0.8 + 0.2 * Math.sin(time * 2.0 + h.phase));
        }
    }

    setAlpha(val) {
        this.globalAlpha = val;
    }

    dispose() {
        this.hearts.forEach(h => {
            if (h.material) h.material.dispose();
        });
        this.scene.remove(this.group);
    }
}
