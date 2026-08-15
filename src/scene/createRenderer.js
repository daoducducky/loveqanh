import * as THREE from 'three';

export const createRenderer = (canvas) => {
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true
    });

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2.0);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const handleResize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
    };

    window.addEventListener('resize', handleResize);

    return { renderer, handleResize };
};
