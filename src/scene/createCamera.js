import * as THREE from 'three';

export const createCamera = () => {
    const aspect = window.innerWidth / window.innerHeight;
    
    // Dynamically scale FOV for mobile portrait to maintain heart scale
    const fov = aspect < 1 ? 65 : 55;
    
    const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);
    
    // Initial camera position for intro
    camera.position.set(0, 0.5, 14);
    camera.lookAt(0, 0, 0);

    const updateCameraAspect = () => {
        const newAspect = window.innerWidth / window.innerHeight;
        camera.aspect = newAspect;
        camera.fov = newAspect < 1 ? 65 : 55;
        camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', updateCameraAspect);

    return { camera, updateCameraAspect };
};
