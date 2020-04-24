const path = require('path');

const getFilePath = (filePath, options?) => {
    if (!window['process']) return filePath;

    if (typeof filePath !== 'string') {
        throw new TypeError(`Expected a string, got ${typeof filePath}`);
    }

    options = {
        resolve: true,
        ...options
    };

    let pathName = filePath;

    if (options.resolve) {
        pathName = path.resolve(filePath);
    }

    pathName = pathName.replace(/\\/g, '/');

    // Windows drive letter must be prefixed with a slash
    if (pathName[0] !== '/') {
        pathName = `/${pathName}`;
    }

    // Escape required characters for path components
    // See: https://tools.ietf.org/html/rfc3986#section-3.3
    return encodeURI(`file://${pathName}`).replace(/[?#]/g, encodeURIComponent);
};

const audioMap = {
    1: new Audio(getFilePath("src/assets/sounds/434611__jens-enk__pauseoff.ogg")),
    2: new Audio(getFilePath("src/assets/sounds/458651__jorgerosa__alarm-2.ogg")),
    3: new Audio(getFilePath("src/assets/sounds/251894__shift560__loopedbell.ogg")),
    4: new Audio(getFilePath("src/assets/sounds/72128__kizilsungur__sweetalertsound4.wav"))
};

export function playSound(num: number): void {
    const audio = audioMap[num];
    if (audio) audio.play();
}