import { seperate } from "../utils/api";
import FreeQueue from "../utils/free-queue";
import { RENDER_QUANTUM, FRAME_SIZE } from "../static/constants.js";


let queue = 0;

class AudioProcessor extends AudioWorkletProcessor{
    constructor(options) {
        super();
        
        this.inputQueue = options.processorOptions.inputQueue;
        this.outputQueue = options.processorOptions.outputQueue;
        this.atomicState = options.processorOptions.atomicState;
        Object.setPrototypeOf(this.inputQueue, FreeQueue.prototype);
        Object.setPrototypeOf(this.outputQueue, FreeQueue.prototype);

    }

    static get parameterDescriptors() {
        return [
            {
                name: "state",
                defaultValue: 0,
            },
            {
                name: "sampleRate",
                defaultValue: 41000,
            }
        ];
    }

    // handleMessage = (event) => {
    //     switch (event.data.message) {
    //         case 'modelLoaded':
                
    //             break;
        
    //         default:
    //             break;
    //     }
    // }

    process(inputs, outputs, params) {


        var input = inputs[0];
        
        // Push data from input into inputQueue.
        this.inputQueue.push(input, RENDER_QUANTUM);

        var output = outputs;

        // // Try to pull data out of outputQueue and store it in output.
        const didPull = this.outputQueue.pull(output.flat(2), RENDER_QUANTUM);
        if (didPull) {
            console.log(outputs);
        }
        
        // Wake up worker to process a frame of data.
        if (this.inputQueue.isFrameAvailable(FRAME_SIZE)) {
            Atomics.notify(this.atomicState, 0, 1);
        }

        return true;
    }

    async processBuffer(inputs, outputs, params) {
        if (inputs[0].length < 1 ||queue > 3) return;

        var sr = params["sampleRate"][0];

        AudioProcessor.resample(inputs, sr, async (resampled) => {
            queue++;
            var results = (await seperate(Array.from(resampled))).flat(2);
            queue--;

            const size = outputs[0][0].length;

            for (let i = 0; i < results.length; i++) {
                var data = results[i];

                if (data) {
                    for (let j = 0; j < size; ++j) {
                        outputs[i + 2][0][j] = data[j];
                    }
                }
            }
        });
    }

    static resample(inputs, sampleRate, onComplete) {
        // const interpolate = (sampleRate % 16000 !== 0);
        // const multiplier = sampleRate / 16000;

        // const original = inputs[0];
        // const subsamples = new Float32Array(1024);

        // for (let i = 0; i < 1024; i += 1) {
        //     if (!interpolate) {
        //         subsamples[i] = original[i * multiplier];
        //     } else {
        //         const left = Math.floor(i * multiplier);
        //         const right = left + 1;
        //         const p = (i * multiplier) - left;
        //         subsamples[i] = (((1 - p) * original[left]) + (p * original[right]));
        //     }
        // }

        const subsamples = inputs[0];

        onComplete(subsamples);
    }
}

registerProcessor('audio-processor', AudioProcessor);