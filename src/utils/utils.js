
export function convertToRatio(dB) {
	return Math.exp(dB / 8.6858);
}

export function resample(buffer, sampleRate, onComplete) {
	const interpolate = (sampleRate % 16000 !== 0);
	const multiplier = sampleRate / 16000;

	//const buffer = JSON.parse(JSON.stringify(input));

	for (let channel = 0; channel < buffer.numberOfChannels; ++channel) {

		const samples = buffer.getChannelData(channel);
		const subsamples = new Float32Array(1024);

		for (let i = 0; i < 1024; i += 1) {
			if (!interpolate) {
				subsamples[i] = samples[i * multiplier];
			} else {
				const left = Math.floor(i * multiplier);
				const right = left + 1;
				const p = (i * multiplier) - left;
				subsamples[i] = (((1 - p) * samples[left]) + (p * samples[right]));
			}
		}

		onComplete(subsamples);
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

