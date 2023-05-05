
let timeout = null;

export function setInterruptableTimeout(callback, interval) {
	clearTimeouts();
	timeout = setTimeout(callback, interval);
}

export function clearTimeouts() {
	if (timeout) {
		clearTimeout(timeout)
	}
}


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

