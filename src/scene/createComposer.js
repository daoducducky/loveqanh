import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { getPerformanceConfig } from '../utils/device.js';

export const createComposer = (renderer, scene, camera) => {
    const config = getPerformanceConfig();
    const composer = new EffectComposer(renderer);

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    const bloomPass = new UnrealBloomPass(
        resolution,
        config.bloomStrength,
        config.bloomRadius,
        config.bloomThreshold
    );
    composer.addPass(bloomPass);

    const handleResize = () => {
        composer.setSize(window.innerWidth, window.innerHeight);
        bloomPass.resolution.set(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return { composer, bloomPass, handleResize };
};
