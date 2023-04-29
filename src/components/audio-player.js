import { State } from "../model/state";
import audio_url from "./audio-processor.js?url";
import visual_url from "./visual-processor.js?url";
import FreeQueue from "../utils/free-queue";
import { QUEUE_SIZE } from "../static/constants";
import { getSourceData } from "../utils/api";

const nodes = {
    // AudioContext of primary audio stream
    audioContext: null,
    audioSource: null,
    // Also an AudioContext, but contains info for visualizers
    // with a sample rate of 8000
    visualContext: null, 
    visualSource: null,
    visualWorklet: null,
    analysers: [],
}

const data = {
    inputQueue: new FreeQueue(QUEUE_SIZE, 2),
    outputQueue: new FreeQueue(QUEUE_SIZE, 8),
    atomicState: new Int32Array(
        new SharedArrayBuffer(1 * Int32Array.BYTES_PER_ELEMENT)
    ),
}

export const Player = {
    nodes,
    data,

    start() {
        this.nodes.visualContext.resume();
        State.setState("play");
    },

    pause() {
        State.setState("pause");
        this.nodes.visualContext.suspend();
    },

    stop() {

    },

    async prepareAudioData(ctx, src) {
        // seperate track
        console.log("get data...");
        const sources = await getSourceData(ctx);
        console.log("data fetched!")

        const size = sources[0].length;
        const sampleRate = sources[0].sampleRate;
        const N = sources.length;
        const length = size * N;
        const buffer = ctx.createBuffer(N, length, sampleRate);

        // populate buffer with data
        for (let i = 0; i < N; ++i) {
            const data = buffer.getChannelData(i);
            data.set(sources[i].getChannelData(0))
        }

        src.buffer = buffer;
    },
    
    async setupVisualContext() {
        const ctx = getAudioContext();
        const src = ctx.createBufferSource();
        const merge = ctx.createChannelMerger(4);

        await this.prepareAudioData(ctx, src);

        // Prepare nodes for audio processing
        await ctx.audioWorklet.addModule(visual_url);

        const worklet = new AudioWorkletNode(ctx, 'visual-processor', {
            outputChannelCount: [1, 1, 1, 1],
            numberOfInputs: 1,
            numberOfOutputs: 4,
            // processorOptions: {
            //     inputQueue: this.inputQueue,
            //     outputQueue: this.outputQueue,
            //     atomicState: this.atomicState
            // },
        });

        // Connect analyser to each source channel
        for (let i = 0; i < worklet.numberOfOutputs; ++i) {
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            analyser.minDecibels = -70;
            analyser.maxDecibels = -10;
            analyser.smoothingTimeConstant = 0.75;

            worklet.connect(analyser, i, 0);

            State.sources[i].analyser = analyser;
            State.sources[i].buffer = new Uint8Array(analyser.frequencyBinCount);
        }

        src.connect(worklet);
        
        worklet.connect(merge, 0, 0);
        worklet.connect(merge, 1, 0);
        worklet.connect(merge, 2, 1);
        worklet.connect(merge, 3, 1);

        merge.connect(ctx.destination);
        src.start();
        ctx.suspend();

        this.nodes.visualContext = ctx;
        this.nodes.visualSource = src;
        this.nodes.visualWorklet = worklet;
    },

    updateParameter(name, value) {
        const par = this.nodes.visualWorklet.parameters.get(name);
        par.value = value;
    },

    display() {
        // const mic = document.querySelector('#microphone');
        // mic.classList.remove("hide");
    },

    async toggleButtonClickHandler(button) {
        try {
            // If AudioContext doesn't exist, try creating one. 
            if (!this.nodes.visualContext) {
                button.disabled = true;
                await this.setupVisualContext();
            }

            if (!this.nodes.audioContext) {
                this.nodes.audioContext = getAudioContext();
            }

            button.disabled = false;
        } catch(error) {
            button.disabled = false;
            console.error(error);
            return;
        }

        if (!State.isStreaming()) {
            this.start();
            select('#toggle-play').html('<img src="icons/pause.svg" class="icon"></img>');
        } else {
            this.pause();
            select('#toggle-play').html('<img src="icons/play.svg" class="icon"></img>');
        }
    },

    async init(callback) {     
            // Setup play button, have "start" and "stop" functionality
            const toggle = document.querySelector('#toggle-play');
            toggle.addEventListener('click', async () => await this.toggleButtonClickHandler(toggle));

            callback();
        }
    }

