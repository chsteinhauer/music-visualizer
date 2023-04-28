import FreeQueue from "../utils/free-queue.js";
import { FRAME_SIZE } from "../static/constants.js";
import { seperate } from "../utils/api.js";


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

        Object.setPrototypeOf(inputQueue, FreeQueue.prototype);
        Object.setPrototypeOf(outputQueue, FreeQueue.prototype);
        
        // buffer for storing data pulled out from queue.
        const input = [
            new Float32Array(FRAME_SIZE),
            new Float32Array(FRAME_SIZE)
        ];
        // loop for processing data.
        while (Atomics.wait(atomicState, 0, 0) === 'ok') {
            
            // pull data out from inputQueue.
            const didPull = inputQueue.pull(input, FRAME_SIZE);
            
            if (didPull) {
                // If pulling data out was successfull, process it and push it to
                // outputQueue
                const result = (await seperate([Array.from(input[0]),Array.from(input[1])]))[0];

                const channels = result.length * 2;
                const output = new Array(channels);

                for (let channel = 0; channel < channels; ++channel) {
                    output[channel] = new Float32Array(FRAME_SIZE);

                    for (let i = 0; i < FRAME_SIZE; ++i) {
                        var c = channel < result.length ? 0 : 1;
                        output[channel][i] = result[channel % result.length][c][i];
                    }
                }
                
                outputQueue.push(output, FRAME_SIZE);
            } 

            Atomics.store(atomicState, 0, 0);
        }
    }
};