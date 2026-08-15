import * as THREE from 'three';
import { createHeartTexture } from '../utils/textures.js';
import { randomRange } from '../utils/random.js';

export class HeartExplosionManager {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.explosions = [];
        this.heartTexture = createHeartTexture(128, '#ff2a6d');
    }

    createExplosion(screenX, screenY) {
        const vector = new THREE.Vector3(screenX, screenY, 0.5);
        vector.unproject(this.camera);
        const dir = vector.sub(this.camera.position).normalize();
        const distance = -this.camera.position.z / dir.z;
        const origin = this.camera.position.clone().add(dir.multiplyScalar(distance));

        const count = 35;
        const sprites = [];
        const group = new THREE.Group();
        this.scene.add(group);

        const palette = ['#ff003c', '#ff1744', '#ff4081', '#ff7597', '#ffffff'];

        for (let i = 0; i < count; i++) {
            const col = palette[Math.floor(Math.random() * palette.length)];
            const tex = createHeartTexture(128, col);

            const material = new THREE.SpriteMaterial({
                map: tex,
                transparent: true,
                opacity: 1.0,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            const sprite = new THREE.Sprite(material);
            sprite.position.copy(origin);

            const scale = randomRange(0.4, 0.85);
            sprite.scale.set(scale, scale, 1.0);

            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const speed = randomRange(3.0, 7.0);

            const vx = Math.sin(phi) * Math.cos(theta) * speed;
            const vy = (Math.sin(phi) * Math.sin(theta) * speed) + randomRange(1.2, 3.5);
            const vz = Math.cos(phi) * speed;

            sprites.push({
                sprite,
                material,
                baseScale: scale,
                vel: new THREE.Vector3(vx, vy, vz),
                rotSpeed: randomRange(-2.0, 2.0)
            });

            group.add(sprite);
        }

        this.explosions.push({
            group,
            sprites,
            life: 1.0,
            decay: randomRange(0.65, 0.85)
        });
    }

    update(delta) {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const exp = this.explosions[i];
            exp.life -= exp.decay * delta;

            if (exp.life <= 0) {
                exp.sprites.forEach(s => {
                    if (s.material) s.material.dispose();
                });
                this.scene.remove(exp.group);
                this.explosions.splice(i, 1);
                continue;
            }

            const lifeCurve = Math.pow(exp.life, 1.4);

            exp.sprites.forEach(s => {
                s.vel.x *= 0.96;
                s.vel.y *= 0.96;
                s.vel.z *= 0.96;
                s.vel.y += 0.8 * delta; // gentle buoyant floating upward

                s.sprite.position.addScaledVector(s.vel, delta);
                s.material.opacity = lifeCurve;
                
                const sc = s.baseScale * (0.4 + 0.6 * lifeCurve);
                s.sprite.scale.set(sc, sc, 1.0);
            });
        }
    }

    dispose() {
        this.explosions.forEach(exp => {
            exp.sprites.forEach(s => {
                if (s.material) s.material.dispose();
            });
            this.scene.remove(exp.group);
        });
        this.explosions = [];
    }
}
