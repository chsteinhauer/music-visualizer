import * as tf from "@tensorflow/tfjs";

const model_url = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';
const loader = modelLoader(model_url, 'model');
let _model;

export async function setupModel() {
	_model = await loader.loadLayersModel();
}

export async function detectPitch(data) {
	await tf.nextFrame();

	const centMapping = tf.add(tf.linspace(0, 7180, 360), tf.tensor(1997.3794084376191));
	let frequency;

	tf.tidy(() => {
		const frame = tf.tensor(data.slice(0, 1024));
		const zeromean = tf.sub(frame, tf.mean(frame));
		const framestd = tf.tensor(tf.norm(zeromean).dataSync() / Math.sqrt(1024));
		const normalized = tf.div(zeromean, framestd);
		const input = normalized.reshape([1, 1024]);
		const activation = model.predict([input]).reshape([360]);
		const confidence = activation.max().dataSync()[0];
		const center = activation.argMax().dataSync()[0];

		const start = Math.max(0, center - 4);
		const end = Math.min(360, center + 5);
		const weights = activation.slice([start], [end - start]);
		const cents = centMapping.slice([start], [end - start]);

		const products = tf.mul(weights, cents);
		const productSum = products.dataSync().reduce((a, b) => a + b, 0);
		const weightSum = weights.dataSync().reduce((a, b) => a + b, 0);
		const predictedCent = productSum / weightSum;
		const predictedHz = 10 * (2 ** (predictedCent / 1200.0));

		frequency = (confidence > 0.3) ? predictedHz : null;
	});

	return frequency;
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


export function isAbsoluteURL(str) {
	const pattern = new RegExp('^(?:[a-z]+:)?//', 'i');
	return pattern.test(str);
}


export function getModelPath(absoluteOrRelativeUrl) {
	if (!isAbsoluteURL(absoluteOrRelativeUrl) && typeof window !== 'undefined') {
		return window.location.pathname + absoluteOrRelativeUrl;
	}
	return absoluteOrRelativeUrl;
}


class ModelLoader {

	constructor(path, expected = 'model', prepend = true) {
		const url = prepend ? getModelPath(path) : path;
		const known = {};
		if (url.endsWith('.json')) {
			const pos = url.lastIndexOf('/') + 1;
			this.directory = url.slice(0, pos);
			const fileName = url.slice(pos, -5);
			if (fileName !== expected && isKnownName(fileName)) {
				console.warn(`Expected a ${expected}.json file URL, but received a ${fileName}.json file instead.`);
			} else {
				known[expected] = url;
			}
		} else {
			this.directory = url.endsWith('/') ? url : `${url}/`;
		}
		this.modelUrl = known.model || this.getPath('model.json');
	}


	getPath(filename) {
		return isAbsoluteURL(filename) ? filename : this.directory + filename;
	}

	async loadLayersModel(relativePath) {
		const url = relativePath ? this.getPath(relativePath) : this.modelUrl;
		try {
				return await tf.loadLayersModel(url);
		} catch (error) {
				throw new Error(`Error loading model from URL ${url}: ${String(error)}`);
		}
	}
}


export function modelLoader(path, expected, prepend) {
    return new ModelLoader(path, expected, prepend);
}