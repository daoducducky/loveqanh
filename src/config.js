/**
 * Central Configuration for 3D Love Experience
 */

export const DEFAULT_LOVE_CONFIG = {
    person1: "Ngọc Ánh",
    person2: "Quốc Thiên",
    date: "22.12.2028",
    mainMessage: "I LOVE YOU",
    messages: [
        "Forever",
        "Love You",
        "Together",
        "Our Love",
        "Ngọc Ánh",
        "Quốc Thiên",
        "22.12.2028",
        "Forever & Always",
        "My Only One",
        "Yêu Em",
        "Bên Nhau Mãi Mãi",
        "❤️"
    ],
    mainHeartColor: "#ff164d",
    goldHeartColor: "#ffd76a",
    textColor: "#ff4d91",
    textGlowColor: "#ff0055",
    backgroundColor: "#050003",
    musicUrl: "assets/music.mp3"
};

/**
 * Encodes a configuration object to a URL-safe Base64 string
 */
export const encodeConfigToUrl = (config) => {
    try {
        const jsonStr = JSON.stringify(config);
        const utf8Bytes = new TextEncoder().encode(jsonStr);
        let binaryStr = '';
        utf8Bytes.forEach(byte => binaryStr += String.fromCharCode(byte));
        return encodeURIComponent(btoa(binaryStr));
    } catch (e) {
        console.error("Failed to encode config:", e);
        return "";
    }
};

/**
 * Decodes a configuration object from a URL parameter string
 */
export const decodeConfigFromUrl = (encodedStr) => {
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
        console.error("Failed to decode config from URL:", e);
        return null;
    }
};

/**
 * Loads current configuration merged with any URL parameters
 */
export const getActiveLoveConfig = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('d') || urlParams.get('data');
    
    let customConfig = {};
    if (encodedData) {
        const decoded = decodeConfigFromUrl(encodedData);
        if (decoded) customConfig = decoded;
    } else {
        // Also support simple query params: ?p1=A&p2=B&date=...
        const p1 = urlParams.get('p1');
        const p2 = urlParams.get('p2');
        const dt = urlParams.get('date');
        const msg = urlParams.get('msg');
        const music = urlParams.get('music');

        if (p1) customConfig.person1 = p1;
        if (p2) customConfig.person2 = p2;
        if (dt) customConfig.date = dt;
        if (msg) customConfig.mainMessage = msg;
        if (music) customConfig.musicUrl = music;
    }

    // Deep merge messages
    const merged = { ...DEFAULT_LOVE_CONFIG, ...customConfig };
    if (customConfig.messages && Array.isArray(customConfig.messages) && customConfig.messages.length > 0) {
        merged.messages = customConfig.messages;
    } else if (merged.person1 || merged.person2 || merged.date) {
        // Automatically inject customized names/dates into messages array
        const dynamicList = [
            merged.mainMessage || "I LOVE YOU",
            `${merged.person1} ❤️ ${merged.person2}`,
            merged.person1,
            merged.person2,
            merged.date,
            "Forever & Always",
            "Together",
            "Our Love",
            "My World",
            "Yêu Em Mãi Mãi",
            "Trọn Đời Bên Nhau",
            "❤️"
        ].filter(Boolean);
        merged.messages = Array.from(new Set(dynamicList));
    }

    return merged;
};
