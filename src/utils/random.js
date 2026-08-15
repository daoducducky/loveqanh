/**
 * Mathematical and Random Helper Utilities
 */

export const randomRange = (min, max) => Math.random() * (max - min) + min;

export const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

// Box-Muller transform for Gaussian (normal) distribution
export const randomGaussian = (mean = 0, stdev = 1) => {
    let u = 1 - Math.random();
    let v = Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdev + mean;
};

// Random point in spherical shell
export const randomSpherePoint = (radius) => {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = Math.cbrt(Math.random()) * radius;
    const sinPhi = Math.sin(phi);
    return {
        x: r * sinPhi * Math.cos(theta),
        y: r * sinPhi * Math.sin(theta),
        z: r * Math.cos(phi)
    };
};
