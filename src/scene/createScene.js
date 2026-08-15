import * as THREE from 'three';

export const createScene = (backgroundColor = 0x050003) => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    
    // Soft exponential fog for depth falloff
    scene.fog = new THREE.FogExp2(backgroundColor, 0.018);

    // Subtle ambient lighting for any 3D meshes
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Point lights for warm luminous core
    const coreLight = new THREE.PointLight(0xff3366, 2.0, 30);
    coreLight.position.set(0, 0, 2);
    scene.add(coreLight);

    return { scene, coreLight };
};
