import * as tf from "@tensorflow/tfjs";
import { State } from "../model/state";

// const model_url = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';
// let _model;

// export async function setupModel() {
// 	const loader = modelLoader(model_url, 'model');
// 	_model = await loader.loadLayersModel();
// }

function resample(inputs, sampleRate, onComplete) {

	const interpolate = (sampleRate % 16000 !== 0);
	const multiplier = sampleRate / 16000;

	const original = inputs;

	var index = 0;
	for (let channel = 0; channel < inputs.length; channel += 2) {

		const samples = original[channel];
		State.samples = samples;

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

		onComplete(subsamples, index++);
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