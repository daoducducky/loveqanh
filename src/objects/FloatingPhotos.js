import * as THREE from 'three';
import { randomRange } from '../utils/random.js';

export class FloatingPhotos {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.photoCount = 22;
        this.photos = [];
        this.globalAlpha = 0.0;

        this.initPhotos();
    }

    initPhotos() {
        const textureLoader = new THREE.TextureLoader();

        for (let i = 1; i <= this.photoCount; i++) {
            const imgPath = `img/${i}.png`;
            
            // Texture with fallback handling
            const texture = textureLoader.load(
                imgPath,
                (tex) => {
                    tex.generateMipmaps = true;
                    tex.minFilter = THREE.LinearMipmapLinearFilter;
                },
                undefined,
                () => {
                    // Try .jpg if .png fails
                    textureLoader.load(`img/${i}.jpg`, (tex) => {
                        material.map = tex;
                        material.needsUpdate = true;
                    });
                }
            );

            // Glowing Photo Card Material
            const material = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                opacity: 0,
                depthWrite: false
            });

            const sprite = new THREE.Sprite(material);

            // Distribution in 3D volume around heart
            const z = randomRange(-28, 6);
            const x = (Math.random() < 0.5 ? -1 : 1) * randomRange(4.5, 17.0); // placed around heart, not directly blocking center
            const y = randomRange(-9, 14);

            sprite.position.set(x, y, z);

            // Card scale with natural photo aspect ratio
            const depthFactor = (z + 28) / 34; // 0 (far) to 1 (near)
            const baseScale = (1.6 + depthFactor * 1.8) * randomRange(0.9, 1.25);
            sprite.scale.set(baseScale, baseScale * 1.25, 1.0);

            const photoData = {
                sprite,
                material,
                baseScale,
                speedY: randomRange(0.35, 0.9),
                swayFreq: randomRange(0.4, 1.1),
                swayAmp: randomRange(0.25, 0.7),
                phase: Math.random() * Math.PI * 2,
                initialZ: z,
                targetOpacity: (0.55 + depthFactor * 0.4) * randomRange(0.8, 1.0)
            };

            this.photos.push(photoData);
            this.group.add(sprite);
        }
    }

    update(time, delta) {
        for (let i = 0; i < this.photos.length; i++) {
            const p = this.photos[i];
            const pos = p.sprite.position;

            // Gentle upward drift
            pos.y += p.speedY * delta;

            // Smooth floating sway
            pos.x += Math.sin(time * p.swayFreq + p.phase) * p.swayAmp * delta;
            pos.z = p.initialZ + Math.cos(time * 0.6 + p.phase) * 0.35;

            // Wrap around when rising past top boundary
            if (pos.y > 15) {
                pos.y = -10;
                pos.x = (Math.random() < 0.5 ? -1 : 1) * randomRange(4.5, 17.0);
                p.initialZ = randomRange(-28, 6);
                pos.z = p.initialZ;
            }

            p.material.opacity = this.globalAlpha * p.targetOpacity * (0.88 + 0.12 * Math.sin(time * 1.5 + p.phase));
        }
    }

    setAlpha(val) {
        this.globalAlpha = val;
    }

    dispose() {
        this.photos.forEach(p => {
            if (p.material.map) p.material.map.dispose();
            if (p.material) p.material.dispose();
        });
        this.scene.remove(this.group);
    }
}
