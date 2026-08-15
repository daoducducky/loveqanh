/**
 * Device and Performance Detection Utility
 */
export const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
        || (window.innerWidth <= 768);
};

export const isIOS = () => {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

export const getPerformanceConfig = () => {
    const mobile = isMobile();
    return {
        isMobile: mobile,
        pixelRatio: Math.min(window.devicePixelRatio || 1, mobile ? 1.75 : 2.0),
        heartParticles: mobile ? 4500 : 8500,
        groundParticles: mobile ? 4000 : 8000,
        sparkleCount: mobile ? 200 : 400,
        floatingHeartCount: mobile ? 30 : 60,
        floatingTextCount: mobile ? 12 : 20,
        bloomStrength: 0.85,
        bloomRadius: 0.45,
        bloomThreshold: 0.45
    };
};
