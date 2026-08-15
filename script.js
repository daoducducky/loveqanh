window.requestAnimationFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) { window.setTimeout(callback, 1000 / 60); };

window.isDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());

var loaded = false;
var initHeartAndSnow = function () {
    if (loaded) return;
    loaded = true;

    var mobile = window.isDevice;
    var koef = 1;
    var canvas = document.getElementById('heart');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var centerImg = document.getElementById('centerImg');
    var width, height;

    var setCanvasSize = function () {
        width = canvas.width = koef * window.innerWidth;
        height = canvas.height = koef * window.innerHeight;
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fillRect(0, 0, width, height);
    };
    setCanvasSize();

    var rand = Math.random;

    var heartPosition = function (rad) {
        return [
            Math.pow(Math.sin(rad), 3),
            -(15 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad))
        ];
    };

    var scaleAndTranslate = function (pos, sx, sy, dx, dy) {
        return [dx + pos[0] * sx, dy + pos[1] * sy];
    };

    window.addEventListener('resize', function () {
        setCanvasSize();
        createHeartPoints();
    });

    var pointsOrigin = [];
    var heartPointsCount;

    var createHeartPoints = function () {
        pointsOrigin = [];
        var dr = mobile ? 0.12 : 0.08;

        // Thu nhỏ tỷ lệ trái tim siêu nhỏ gọn và sắc nét
        var scale1 = mobile ? 65 : 150;
        var scale2 = mobile ? 45 : 100;
        var scale3 = mobile ? 25 : 60;

        var sy1 = mobile ? 4 : 10;
        var sy2 = mobile ? 3 : 7;
        var sy3 = mobile ? 2 : 4;

        for (var i = 0; i < Math.PI * 2; i += dr) pointsOrigin.push(scaleAndTranslate(heartPosition(i), scale1, sy1, 0, 0));
        for (var i = 0; i < Math.PI * 2; i += dr) pointsOrigin.push(scaleAndTranslate(heartPosition(i), scale2, sy2, 0, 0));
        for (var i = 0; i < Math.PI * 2; i += dr) pointsOrigin.push(scaleAndTranslate(heartPosition(i), scale3, sy3, 0, 0));

        heartPointsCount = pointsOrigin.length;
    };
    createHeartPoints();

    var targetPoints = [];
    var pulse = function (kx, ky) {
        var centerX = width / 2;
        var centerY = height / 2 - (mobile ? 20 : 40);

        for (var i = 0; i < pointsOrigin.length; i++) {
            targetPoints[i] = [];
            targetPoints[i][0] = kx * pointsOrigin[i][0] + centerX;
            targetPoints[i][1] = ky * pointsOrigin[i][1] + centerY;
        }
    };

    var e = [];
    var traceCount = mobile ? 25 : 50;

    for (var i = 0; i < heartPointsCount; i++) {
        var x = rand() * width;
        var y = rand() * height;
        e[i] = {
            vx: 0,
            vy: 0,
            R: 2,
            speed: rand() + 5,
            q: ~~(rand() * heartPointsCount),
            D: 2 * (i % 2) - 1,
            force: 0.2 * rand() + 0.7,
            f: "hsla(0," + ~~(40 * rand() + 60) + "%," + ~~(60 * rand() + 20) + "%,.3)",
            trace: []
        };
        for (var k = 0; k < traceCount; k++) e[i].trace[k] = { x: x, y: y };
    }

    var messagesPool = [
        "Yêu vk Quỳnh Anh",
        "I LOVE YOU",
        "Yêu vk Quỳnh Anh",
        "Ck iu vk",
        "Vk xinh đẹp nhất",
        "Yêu vk Quỳnh Anh",
        "Sư tử Hà Đông",
        "You're my universe",
        "I LOVE YOU"
    ];

    var podiumAngle = 0;

    var layersConfig = [
        { count: mobile ? 4 : 5, yOffset: mobile ? -12 : -18, radiusScale: 1.08, hue: 345 },
        { count: mobile ? 4 : 5, yOffset: 0, radiusScale: 1.00, hue: 355 },
        { count: mobile ? 4 : 5, yOffset: mobile ? 12 : 18, radiusScale: 0.92, hue: 25 }
    ];

    var podiumStructure = [];
    for (var l = 0; l < layersConfig.length; l++) {
        var layer = layersConfig[l];
        var layerItems = [];
        for (var i = 0; i < layer.count; i++) {
            var randomMsg = messagesPool[Math.floor(rand() * messagesPool.length)];
            layerItems.push(randomMsg);
        }
        podiumStructure.push(layerItems);
    }

    var draw3DPodium = function (centerX, centerY) {
        var baseRadiusX = mobile ? 110 : 180;
        var baseRadiusY = mobile ? 25 : 45;
        var baseCenterY = centerY + (mobile ? 85 : 150);

        var items = [];

        for (var l = 0; l < layersConfig.length; l++) {
            var layer = layersConfig[l];
            var wordsInLayer = layer.count;
            var angleStep = (Math.PI * 2) / wordsInLayer;
            var phaseShift = (l % 2 === 1) ? (angleStep / 2) : 0;

            for (var i = 0; i < wordsInLayer; i++) {
                var angle = podiumAngle + (i * angleStep) + phaseShift;

                var rX = baseRadiusX * layer.radiusScale;
                var rY = baseRadiusY * layer.radiusScale;

                var x = centerX + Math.cos(angle) * rX;
                var y = baseCenterY + Math.sin(angle) * rY + layer.yOffset;
                var z = Math.sin(angle);

                items.push({
                    text: podiumStructure[l][i],
                    x: x,
                    y: y,
                    z: z,
                    hue: layer.hue,
                    layerIndex: l
                });
            }
        }

        items.sort(function (a, b) { return a.z - b.z; });

        ctx.save();
        var fontSize = mobile ? 10 : 13;
        ctx.font = "bold " + fontSize + "px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (var i = 0; i < items.length; i++) {
            var item = items[i];

            var scale = 0.85 + (item.z + 1) * 0.15;
            var lightness = 50 + (item.z + 1) * 20;

            ctx.save();
            ctx.translate(item.x, item.y);
            ctx.scale(scale, scale);

            ctx.fillStyle = "hsl(" + item.hue + ", 100%, " + lightness + "%)";
            ctx.shadowColor = "rgba(255, 0, 80, 0.8)";
            ctx.shadowBlur = 3;

            ctx.fillText(item.text, 0, 0);

            ctx.restore();
        }

        ctx.restore();

        podiumAngle += 0.003;
    };

    var config = {
        traceK: 0.4,
        timeDelta: 0.01
    };

    var time = 0;

    var loop = function () {
        var centerX = width / 2;
        var centerY = height / 2;

        var n = -Math.cos(time);
        var pulseK = (1 + n) * 0.5;
        pulse(pulseK, pulseK);

        if (centerImg) {
            var imgScale = 0.95 + pulseK * 0.1;
            centerImg.style.transform = "translate(-50%, -50%) scale(" + imgScale + ")";
        }

        time += ((Math.sin(time)) < 0 ? 9 : (n > 0.8) ? .2 : 1) * config.timeDelta;

        ctx.fillStyle = "rgba(0,0,0,.12)";
        ctx.fillRect(0, 0, width, height);

        draw3DPodium(centerX, centerY);

        for (var i = e.length; i--;) {
            var u = e[i];
            var q = targetPoints[u.q];

            var dx = u.trace[0].x - q[0];
            var dy = u.trace[0].y - q[1];
            var length = Math.sqrt(dx * dx + dy * dy);

            if (10 > length) {
                if (0.95 < rand()) {
                    u.q = ~~(rand() * heartPointsCount);
                } else {
                    if (0.99 < rand()) {
                        u.D *= -1;
                    }
                    u.q += u.D;
                    u.q %= heartPointsCount;
                    if (0 > u.q) {
                        u.q += heartPointsCount;
                    }
                }
            }

            u.vx += -dx / length * u.speed;
            u.vy += -dy / length * u.speed;

            u.trace[0].x += u.vx;
            u.trace[0].y += u.vy;

            u.vx *= u.force;
            u.vy *= u.force;

            for (var k = 0; k < u.trace.length - 1;) {
                var T = u.trace[k];
                var N = u.trace[++k];
                N.x -= config.traceK * (N.x - T.x);
                N.y -= config.traceK * (N.y - T.y);
            }

            ctx.fillStyle = u.f;
            for (var k = 0; k < u.trace.length; k++) {
                ctx.fillRect(u.trace[k].x, u.trace[k].y, 1, 1);
            }
        }

        window.requestAnimationFrame(loop);
    };

    loop();

    // ==========================================
    // KHỞI TẠO HIỆU ỨNG TUYẾT RƠI ẢNH (1.png -> 15.png)
    // ==========================================
    initFallingSnowPhotos();
};

function initFallingSnowPhotos() {
    var container = document.getElementById('snow-container');
    if (!container) return;

    var totalSnowFlakes = window.isDevice ? 35 : 55;
    var imagePool = [];
    for (var i = 1; i <= 15; i++) {
        imagePool.push('./images/' + i + '.png');
    }

    for (var i = 0; i < totalSnowFlakes; i++) {
        var img = document.createElement('img');
        var randImg = imagePool[Math.floor(Math.random() * imagePool.length)];
        img.src = randImg;
        img.className = 'snow-flake-img';
        img.alt = 'Snow';

        // Phân bố ngẫu nhiên trên chiều ngang
        var leftPercent = Math.random() * 100;
        var duration = (Math.random() * 4.5 + 4.5); // 4.5s - 9.0s
        var delay = Math.random() * 8.0; // 0s - 8s delay
        var sizeMultiplier = (Math.random() * 0.4 + 0.8); // 0.8 - 1.2

        img.style.left = leftPercent + 'vw';
        img.style.animationDuration = duration + 's';
        img.style.animationDelay = delay + 's';
        img.style.transform = 'scale(' + sizeMultiplier + ')';

        container.appendChild(img);
    }
}

var s = document.readyState;
if (s === 'complete' || s === 'loaded' || s === 'interactive') {
    initHeartAndSnow();
} else {
    document.addEventListener('DOMContentLoaded', initHeartAndSnow, false);
}
