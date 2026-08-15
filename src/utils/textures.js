import * as THREE from 'three';

/**
 * Procedural Texture Generator
 * Creates anti-aliased, high-resolution textures without external image dependencies
 */

// Cache textures for performance
const textureCache = new Map();

/**
 * Creates an ultra-crisp glowing heart texture
 */
export const createHeartTexture = (size = 256, color = '#ffffff') => {
    const key = `heart_${size}_${color}`;
    if (textureCache.has(key)) return textureCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const center = size / 2;
    const s = size * 0.42;

    // Draw soft outer glow
    const glowGrad = ctx.createRadialGradient(center, center, s * 0.2, center, center, size * 0.48);
    glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    glowGrad.addColorStop(0.3, 'rgba(255, 180, 205, 0.6)');
    glowGrad.addColorStop(0.7, 'rgba(255, 80, 130, 0.2)');
    glowGrad.addColorStop(1, 'rgba(255, 0, 80, 0)');

    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(center, center, size * 0.48, 0, Math.PI * 2);
    ctx.fill();

    // Draw heart path
    ctx.save();
    ctx.translate(center, center + s * 0.1);
    ctx.beginPath();
    
    // Heart bezier curve
    const topCurveHeight = s * 0.35;
    ctx.moveTo(0, s * 0.35);
    ctx.bezierCurveTo(-s * 0.6, -s * 0.3, -s * 0.7, s * 0.1, 0, s * 0.75);
    ctx.bezierCurveTo(s * 0.7, s * 0.1, s * 0.6, -s * 0.3, 0, s * 0.35);

    ctx.closePath();

    ctx.fillStyle = color;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowBlur = size * 0.12;
    ctx.fill();
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    textureCache.set(key, texture);
    return texture;
};

/**
 * Creates a soft glowing circular particle texture
 */
export const createGlowDiscTexture = (size = 128) => {
    const key = `glow_disc_${size}`;
    if (textureCache.has(key)) return textureCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const center = size / 2;
    const radius = size / 2;

    const grad = ctx.createRadialGradient(center, center, 0, center, center, radius);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.2, 'rgba(255, 240, 245, 0.9)');
    grad.addColorStop(0.5, 'rgba(255, 150, 180, 0.4)');
    grad.addColorStop(0.8, 'rgba(255, 50, 100, 0.1)');
    grad.addColorStop(1, 'rgba(255, 0, 50, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    textureCache.set(key, texture);
    return texture;
};

/**
 * Creates a 4-point sparkle flare texture
 */
export const createSparkleTexture = (size = 128) => {
    const key = `sparkle_${size}`;
    if (textureCache.has(key)) return textureCache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const center = size / 2;

    // Outer soft glow
    const grad = ctx.createRadialGradient(center, center, 0, center, center, size * 0.4);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.4, 'rgba(255, 220, 240, 0.6)');
    grad.addColorStop(1, 'rgba(255, 100, 150, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(center, center, size * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Cross flares
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    
    // Horizontal flare
    ctx.beginPath();
    ctx.ellipse(center, center, size * 0.46, size * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();

    // Vertical flare
    ctx.beginPath();
    ctx.ellipse(center, center, size * 0.05, size * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    textureCache.set(key, texture);
    return texture;
};

/**
 * Creates high-DPI text texture with luminous neon glow
 */
export const createNeonTextTexture = (text, options = {}) => {
    const {
        fontSize = 64,
        color = '#ff4d91',
        glowColor = '#ff2f75',
        fontFamily = "'Cinzel', 'Outfit', 'Inter', sans-serif",
        fontWeight = '700'
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const fontStr = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.font = fontStr;

    const metrics = ctx.measureText(text);
    const textWidth = Math.ceil(metrics.width);
    const textHeight = Math.ceil(fontSize * 1.5);

    const padding = Math.ceil(fontSize * 0.8);
    canvas.width = textWidth + padding * 2;
    canvas.height = textHeight + padding * 2;

    // Reset font after resizing canvas
    ctx.font = fontStr;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Multi-pass neon glow
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = fontSize * 0.6;
    ctx.fillStyle = color;
    ctx.fillText(text, cx, cy);

    ctx.shadowBlur = fontSize * 0.3;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, cx, cy);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    return {
        texture,
        aspectRatio: canvas.width / canvas.height,
        width: canvas.width,
        height: canvas.height
    };
};
