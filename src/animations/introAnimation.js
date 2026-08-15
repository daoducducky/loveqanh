/**
 * Cinematic 4-Phase Intro Sequence Timeline
 */

export class IntroAnimation {
    constructor({
        heart,
        ground,
        floatingPhotos,
        floatingHearts,
        floatingTexts,
        sparkles,
        bloomPass,
        camera,
        flashOverlay,
        onComplete
    }) {
        this.heart = heart;
        this.ground = ground;
        this.floatingPhotos = floatingPhotos;
        this.floatingHearts = floatingHearts;
        this.floatingTexts = floatingTexts;
        this.sparkles = sparkles;
        this.bloomPass = bloomPass;
        this.camera = camera;
        this.flashOverlay = flashOverlay;
        this.onComplete = onComplete;

        this.timeline = null;
        this.isFinished = false;
    }

    start() {
        const gsap = window.gsap;
        if (!gsap) {
            this.setCompleteState();
            return;
        }

        this.timeline = gsap.timeline({
            onComplete: () => {
                this.isFinished = true;
                if (this.onComplete) this.onComplete();
            }
        });

        this.heart.setAlpha(0.0);
        this.heart.setConvergence(0.0);
        this.heart.setColorMode(0.0);
        this.ground.setAlpha(0.0);
        if (this.floatingPhotos) this.floatingPhotos.setAlpha(0.0);
        this.floatingHearts.setAlpha(0.0);
        this.floatingTexts.setAlpha(0.0);
        this.sparkles.setAlpha(0.0);
        this.camera.position.set(0, 0.5, 15);

        // Phase 1
        this.timeline.to({}, { duration: 0.4 });
        this.timeline.to(this.sparkles.uniforms.uAlpha, { value: 0.8, duration: 1.0, ease: "power2.out" }, 0.4);

        // Phase 2: Gold Convergence
        this.timeline.to(this.heart.uniforms.uGlobalAlpha, { value: 1.0, duration: 1.2, ease: "power1.inOut" }, 1.0);
        this.timeline.to(this.heart.uniforms.uConvergence, { value: 1.0, duration: 5.0, ease: "power2.inOut" }, 1.2);
        this.timeline.to(this.camera.position, { z: 12.0, y: 0.6, duration: 5.2, ease: "sine.inOut" }, 1.2);

        if (this.bloomPass) {
            this.timeline.to(this.bloomPass, { strength: 1.8, radius: 0.6, duration: 1.0, ease: "power2.in" }, 5.8);
            this.timeline.to(this.bloomPass, { strength: 4.5, radius: 0.8, duration: 0.4, ease: "power4.in" }, 6.8);
        }

        // Phase 3: Flash
        if (this.flashOverlay) {
            this.timeline.to(this.flashOverlay, { opacity: 1.0, duration: 0.3, ease: "power3.in" }, 6.9);
        }

        this.timeline.add(() => {
            this.heart.setColorMode(1.0);
            document.body.classList.add('red-world');
        }, 7.2);

        if (this.flashOverlay) {
            this.timeline.to(this.flashOverlay, { opacity: 0.0, duration: 0.7, ease: "power2.out" }, 7.25);
        }

        if (this.bloomPass) {
            this.timeline.to(this.bloomPass, { strength: 0.9, radius: 0.45, duration: 0.9, ease: "power2.out" }, 7.25);
        }

        // Phase 4: Red World & Reveal Floating Photos
        this.timeline.to(this.ground.uniforms.uAlpha, { value: 0.95, duration: 1.6, ease: "power2.out" }, 7.4);
        if (this.floatingPhotos) {
            this.timeline.to(this.floatingPhotos, { globalAlpha: 0.9, duration: 2.0, ease: "power2.out" }, 7.6);
        }
        this.timeline.to(this.floatingHearts, { globalAlpha: 0.85, duration: 1.8, ease: "power2.out" }, 7.8);
        this.timeline.to(this.floatingTexts, { globalAlpha: 0.95, duration: 2.0, ease: "power2.out" }, 8.0);
    }

    setCompleteState() {
        this.heart.setAlpha(1.0);
        this.heart.setConvergence(1.0);
        this.heart.setColorMode(1.0);
        this.ground.setAlpha(0.95);
        if (this.floatingPhotos) this.floatingPhotos.setAlpha(0.9);
        this.floatingHearts.setAlpha(0.85);
        this.floatingTexts.setAlpha(0.95);
        this.sparkles.setAlpha(0.8);
        this.camera.position.set(0, 0.6, 12.0);
        this.isFinished = true;
        document.body.classList.add('red-world');
        if (this.flashOverlay) this.flashOverlay.style.opacity = '0';
    }
}
