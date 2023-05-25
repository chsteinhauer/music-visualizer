

let _timeout;
export function setInterruptableTimeout(callback, interval) {
    clearTimeouts();
    _timeout = setTimeout(callback, interval);
}

export function clearTimeouts() {
    if (_timeout) {
        clearTimeout(_timeout)
    }
}

const concat = (buffer1, buffer2) => {
    const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);

    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);

    return tmp.buffer;
};


export function append(input, buffer, index) {
    for (let i = 0; i < input.numberOfChannels; i++) {
        const channel = buffer.getChannelData(i);
        channel.set(input.getChannelData(i), index);
    }
}


// Write a proper WAVE header for the given buffer.
export const wavify = (data, numberOfChannels, sampleRate) => {
    const header = new ArrayBuffer(44);

    var d = new DataView(header);

    d.setUint8(0, "R".charCodeAt(0));
    d.setUint8(1, "I".charCodeAt(0));
    d.setUint8(2, "F".charCodeAt(0));
    d.setUint8(3, "F".charCodeAt(0));

    d.setUint32(4, data.byteLength / 2 + 44, true);

    d.setUint8(8, "W".charCodeAt(0));
    d.setUint8(9, "A".charCodeAt(0));
    d.setUint8(10, "V".charCodeAt(0));
    d.setUint8(11, "E".charCodeAt(0));
    d.setUint8(12, "f".charCodeAt(0));
    d.setUint8(13, "m".charCodeAt(0));
    d.setUint8(14, "t".charCodeAt(0));
    d.setUint8(15, " ".charCodeAt(0));

    d.setUint32(16, 16, true);
    d.setUint16(20, 1, true);
    d.setUint16(22, numberOfChannels, true);
    d.setUint32(24, sampleRate, true);
    d.setUint32(28, sampleRate * 1 * 2);
    d.setUint16(32, numberOfChannels * 2);
    d.setUint16(34, 16, true);

    d.setUint8(36, "d".charCodeAt(0));
    d.setUint8(37, "a".charCodeAt(0));
    d.setUint8(38, "t".charCodeAt(0));
    d.setUint8(39, "a".charCodeAt(0));
    d.setUint32(40, data.byteLength, true);

    return concat(header, data);
};


export function callCallback(promise, callback) {
    if (!callback) return promise;
    return new Promise((resolve, reject) => {
        promise
            .then((result) => {
                callback(undefined, result);
                resolve(result);
            })
            .catch((error) => {
                callback(error);
                reject(error);
            });
    });
}

export function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }

