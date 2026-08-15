import * as THREE from 'three';
import { lerp } from '../utils/random.js';

export class CameraAnimation {
    constructor(camera) {
        this.camera = camera;
        
        this.mouse = { x: 0, y: 0 };
        this.targetMouse = { x: 0, y: 0 };
        
        this.baseZ = 11.5;
        this.targetLookAt = new THREE.Vector3(0, 0.4, 0);
        this.currentLookAt = new THREE.Vector3(0, 0.4, 0);

        this.initListeners();
    }

    initListeners() {
        // Desktop Mouse Move
        window.addEventListener('mousemove', (e) => {
            const normX = (e.clientX / window.innerWidth) * 2 - 1;
            const normY = -(e.clientY / window.innerHeight) * 2 + 1;
            this.targetMouse.x = normX;
            this.targetMouse.y = normY;
        }, { passive: true });

        // Mobile Touch Move
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                const normX = (touch.clientX / window.innerWidth) * 2 - 1;
                const normY = -(touch.clientY / window.innerHeight) * 2 + 1;
                this.targetMouse.x = normX * 0.8;
                this.targetMouse.y = normY * 0.6;
            }
        }, { passive: true });

        // Mobile Device Gyroscope (if available)
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (e) => {
                if (e.gamma !== null && e.beta !== null) {
                    // Gamma is left/right (-90 to 90), Beta is front/back (-180 to 180)
                    this.targetMouse.x = THREE.MathUtils.clamp(e.gamma / 35, -1, 1) * 0.7;
                    this.targetMouse.y = THREE.MathUtils.clamp((e.beta - 45) / 35, -1, 1) * 0.5;
                }
            }, { passive: true });
        }
    }

    update(time, delta, isIntroFinished) {
        // Smoothly interpolate mouse parallax
        this.mouse.x = lerp(this.mouse.x, this.targetMouse.x, 0.05);
        this.mouse.y = lerp(this.mouse.y, this.targetMouse.y, 0.05);

        if (isIntroFinished) {
            // Natural cinematic floating orbit and breathing zoom
            const orbitX = Math.sin(time * 0.15) * 1.5;
            const orbitY = 0.6 + Math.sin(time * 0.2) * 0.35;
            const breathingZ = this.baseZ + Math.sin(time * 0.1) * 1.8;

            this.camera.position.x = orbitX + this.mouse.x * 1.2;
            this.camera.position.y = orbitY + this.mouse.y * 0.8;
            this.camera.position.z = breathingZ;

            // Camera smoothly looks toward center heart
            const targetX = this.mouse.x * 0.3;
            const targetY = 0.4 + this.mouse.y * 0.2;
            this.currentLookAt.x = lerp(this.currentLookAt.x, targetX, 0.05);
            this.currentLookAt.y = lerp(this.currentLookAt.y, targetY, 0.05);

            this.camera.lookAt(this.currentLookAt);
        } else {
            // During intro, only apply subtle parallax
            this.camera.lookAt(0, 0.4, 0);
        }
    }
}
