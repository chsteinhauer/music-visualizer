import FreeQueue from "../utils/free-queue.js";
import { FRAME_SIZE, RENDER_QUANTUM } from "../static/constants.js";

import * as Pitchfinder from "pitchfinder";

/**
 * Copied from github, link:
 * https://github.com/GoogleChromeLabs/web-audio-samples/blob/main/src/audio-worklet/free-queue/examples/simple-passthrough/worker.js
 * 
 * Worker message event handler.
 * This will initialize worker with FreeQueue instance and set loop for audio
 * processing. 
 */


self.onmessage = async (msg) => {
    if (msg.data.type === "init") {
        let { inputQueue, outputQueue, atomicState } = msg.data.data;

        const detectPitch = Pitchfinder.ACF2PLUS({
            sampleRate: 48000, //TODO: send samplerate here
        });

        Object.setPrototypeOf(inputQueue, FreeQueue.prototype);
        Object.setPrototypeOf(outputQueue, FreeQueue.prototype);
        
        // buffer for storing data pulled out from queue.
        const input = new Array(4).fill(null).map(_ => new Float32Array(FRAME_SIZE));

        // loop for processing data.
        while (Atomics.wait(atomicState, 0, 0) === 'ok') {
            
            // pull data out from inputQueue.
            const didPull = inputQueue.pull(input, FRAME_SIZE);
            
            if (didPull) {
                const frequencies = [];
                for (let i = 0; i < input.length; ++i) {
                    frequencies.push(detectPitch(input[i]));
                }
                self.postMessage(frequencies);
                outputQueue.push(input, FRAME_SIZE);
            }
            
            Atomics.store(atomicState, 0, 0);
        }
    }
};