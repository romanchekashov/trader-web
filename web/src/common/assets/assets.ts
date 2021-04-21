import path = require("path");

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

const soundPath = 'src/common/assets/sounds/';

const audioMap = {
    1: new Audio(getFilePath(soundPath + "434611__jens-enk__pauseoff.ogg")),
    2: new Audio(getFilePath(soundPath + "458651__jorgerosa__alarm-2.ogg")),
    3: new Audio(getFilePath(soundPath + "251894__shift560__loopedbell.ogg")),
    4: new Audio(getFilePath(soundPath + "72128__kizilsungur__sweetalertsound4.wav"))
};

export function playSound(num: number): void {
    const audioFile = audioMap[num];
    audioFile.volume = 0.4;
    if (audioFile) audioFile.play();
}
