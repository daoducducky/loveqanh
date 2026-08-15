import * as THREE from 'three';
import { getActiveLoveConfig } from './config.js';
import { createScene } from './scene/createScene.js';
import { createCamera } from './scene/createCamera.js';
import { createRenderer } from './scene/createRenderer.js';
import { createComposer } from './scene/createComposer.js';

import { ParticleHeart } from './objects/ParticleHeart.js';
import { ParticleGround } from './objects/ParticleGround.js';
import { FloatingPhotos } from './objects/FloatingPhotos.js';
import { FloatingHearts } from './objects/FloatingHearts.js';
import { FloatingTexts } from './objects/FloatingTexts.js';
import { Sparkles } from './objects/Sparkles.js';
import { HeartExplosionManager } from './objects/HeartExplosion.js';

import { IntroAnimation } from './animations/introAnimation.js';
import { CameraAnimation } from './animations/cameraAnimation.js';

class LoveApp {
    constructor() {
        this.config = getActiveLoveConfig();
        this.canvas = document.getElementById('webgl-canvas');
        this.flashOverlay = document.getElementById('flash-overlay');
        this.startGate = document.getElementById('start-gate');
        this.audioBtn = document.getElementById('audio-toggle');
        this.bgMusic = document.getElementById('bg-music');

        this.isPlaying = false;
        this.clock = new THREE.Clock();

        this.init();
    }

    init() {
        const { scene } = createScene();
        this.scene = scene;

        const { camera } = createCamera();
        this.camera = camera;

        const { renderer } = createRenderer(this.canvas);
        this.renderer = renderer;

        const { composer, bloomPass } = createComposer(this.renderer, this.scene, this.camera);
        this.composer = composer;
        this.bloomPass = bloomPass;

        this.heart = new ParticleHeart(this.scene, this.config);
        this.ground = new ParticleGround(this.scene);
        this.floatingPhotos = new FloatingPhotos(this.scene);
        this.floatingHearts = new FloatingHearts(this.scene);
        this.floatingTexts = new FloatingTexts(this.scene, this.config);
        this.sparkles = new Sparkles(this.scene);
        this.explosionManager = new HeartExplosionManager(this.scene, this.camera);

        this.cameraAnim = new CameraAnimation(this.camera);
        this.introAnim = new IntroAnimation({
            heart: this.heart,
            ground: this.ground,
            floatingPhotos: this.floatingPhotos,
            floatingHearts: this.floatingHearts,
            floatingTexts: this.floatingTexts,
            sparkles: this.sparkles,
            bloomPass: this.bloomPass,
            camera: this.camera,
            flashOverlay: this.flashOverlay
        });

        this.initAudio();
        this.initInteractions();

        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    initAudio() {
        if (this.config.musicUrl && this.bgMusic) {
            this.bgMusic.src = this.config.musicUrl;
        }

        const startExperience = () => {
            if (this.hasStarted) return;
            this.hasStarted = true;

            if (this.startGate) {
                this.startGate.classList.add('fade-out');
                setTimeout(() => {
                    this.startGate.style.display = 'none';
                }, 800);
            }

            if (this.bgMusic) {
                this.bgMusic.play().then(() => {
                    this.isPlaying = true;
                    this.updateAudioIcon();
                }).catch(e => {
                    console.warn("Audio play prevented:", e);
                });
            }

            this.introAnim.start();
        };

        if (this.startGate) {
            this.startGate.addEventListener('click', startExperience);
            this.startGate.addEventListener('touchstart', startExperience, { passive: true });
        }

        if (this.audioBtn) {
            this.audioBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.bgMusic.paused) {
                    this.bgMusic.play();
                } else {
                    this.bgMusic.pause();
                }
                this.updateAudioIcon();
            });
        }
    }

    updateAudioIcon() {
        if (!this.audioBtn || !this.bgMusic) return;
        if (this.bgMusic.paused) {
            this.audioBtn.innerHTML = '<span>🔇</span>';
            this.audioBtn.classList.add('muted');
        } else {
            this.audioBtn.innerHTML = '<span>🔊</span>';
            this.audioBtn.classList.remove('muted');
        }
    }

    initInteractions() {
        const handleTap = (clientX, clientY) => {
            if (!this.hasStarted) return;
            const normX = (clientX / window.innerWidth) * 2 - 1;
            const normY = -(clientY / window.innerHeight) * 2 + 1;
            this.explosionManager.createExplosion(normX, normY);
        };

        window.addEventListener('click', (e) => {
            if (e.target.closest('#audio-toggle') || e.target.closest('#create-btn-link')) return;
            handleTap(e.clientX, e.clientY);
        });

        window.addEventListener('touchend', (e) => {
            if (e.target.closest('#audio-toggle') || e.target.closest('#create-btn-link')) return;
            if (e.changedTouches.length > 0) {
                const touch = e.changedTouches[0];
                handleTap(touch.clientX, touch.clientY);
            }
        }, { passive: true });
    }

    animate() {
        requestAnimationFrame(this.animate);

        const delta = Math.min(this.clock.getDelta(), 0.1);
        const elapsedTime = this.clock.getElapsedTime();

        this.heart.update(elapsedTime, delta);
        this.ground.update(elapsedTime);
        this.floatingPhotos.update(elapsedTime, delta);
        this.floatingHearts.update(elapsedTime, delta);
        this.floatingTexts.update(elapsedTime, delta);
        this.sparkles.update(elapsedTime);
        this.explosionManager.update(delta);

        this.cameraAnim.update(elapsedTime, delta, this.introAnim.isFinished);

        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.app = new LoveApp();
});
