import { FRAME_SIZE, RENDER_QUANTUM } from "../static/constants";
import FreeQueue from "../utils/free-queue";

class VisualProcessor extends AudioWorkletProcessor{
    constructor(options) {
        super();

        this.inputQueue = options.processorOptions.inputQueue;
        this.outputQueue = options.processorOptions.outputQueue;
        this.atomicState = options.processorOptions.atomicState;
        Object.setPrototypeOf(this.inputQueue, FreeQueue.prototype);
        Object.setPrototypeOf(this.outputQueue, FreeQueue.prototype);
    }

    process(inputs, outputs, params) {
        const input = inputs.flat();
        const output = outputs.flat();

        this.inputQueue.push(input, RENDER_QUANTUM);
        
        // Wake up worker to process a frame of data.
        if (this.inputQueue.isFrameAvailable(FRAME_SIZE)) {
            Atomics.notify(this.atomicState, 0, 1);
        }

        for (let i = 0; i < output.length; i++) {
            for (let j = 0; j < output[i].length; j++) {
                output[i][j] = input[i][j];
            }
        }
        
        return true;
    }
}

registerProcessor('visual-processor', VisualProcessor);