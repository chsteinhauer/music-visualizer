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
        this.outputQueue.pull(output, RENDER_QUANTUM);

        //console.log(input, output);
        
        // Wake up worker to process a frame of data.
        if (this.inputQueue.isFrameAvailable(FRAME_SIZE)) {
            Atomics.notify(this.atomicState, 0, 1);
        }
        
        return true;
    }
}

registerProcessor('visual-processor', VisualProcessor);