import { modelLoader } from "./utils";

const model_url = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';
let _model;

export async function setupModel() {
	const loader = modelLoader(model_url, 'model');
	_model = await loader.loadLayersModel();
}

export async function detectPitch(data, model) {
	await tf.nextFrame();

	resample(data, 48000, (resampled, index) => {
		const centMapping = tf.add(tf.linspace(0, 7180, 360), tf.tensor(1997.3794084376191));

		tf.tidy(() => {
			const frame = tf.tensor(resampled.slice(0, 1024));
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

			State.sources[index].frequency = (confidence > 0.3) ? predictedHz : null;
		});
	});
}