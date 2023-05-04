import { State } from "../model/state";
import channel_url from "./channel-processor.js?url";
import visual_url from "./visual-processor.js?url";
import FreeQueue from "../utils/free-queue";
import { QUEUE_SIZE } from "../static/constants";
import { getOriginalData, getSourceData } from "../utils/api";
import { config } from "../model/config";

const nodes = {
    // AudioContext of primary audio stream
    context: null, 
    source: null,
    worklet: null,
}

const data = {
    inputQueue: new FreeQueue(QUEUE_SIZE, 4),
    outputQueue: new FreeQueue(QUEUE_SIZE, 4),
    atomicState: new Int32Array(
        new SharedArrayBuffer(1 * Int32Array.BYTES_PER_ELEMENT)
    ),
}

export const Player = {
    nodes,
    data,

    start() {
        this.nodes.context.resume();
        State.setState("play");
    },

    pause() {
        State.setState("pause");
        this.nodes.context.suspend();
    },

    stop() {

    },

    async prepareAudioData(ctx, src) {
        // seperate track
        console.log("get data...");
        const original = await getOriginalData(ctx);
        const sources = await getSourceData(ctx);
        console.log("data fetched!")

        const size = sources[0].length;
        const sampleRate = sources[0].sampleRate;
        const N = sources.length;
        const length = size * N;
        const buffer = ctx.createBuffer(N+2, length, sampleRate);

        // populate buffer with data
        for (let i = 0; i < N; ++i) {
            const data = buffer.getChannelData(i);
            data.set(sources[i].getChannelData(0))
        }

        buffer.getChannelData(N).set(original.getChannelData(0));
        buffer.getChannelData(N+1).set(original.getChannelData(1));

        src.buffer = buffer;
    },
    
    async setupContext() {
        const ctx = getAudioContext();
        const src = ctx.createBufferSource();
        const merge = ctx.createChannelMerger(4);
        const gain = ctx.createGain();
        
        await this.prepareAudioData(ctx, src);

        // Prepare nodes for audio processing
        await ctx.audioWorklet.addModule(channel_url);
        await ctx.audioWorklet.addModule(visual_url);
        
        const c_worklet = new AudioWorkletNode(ctx, 'channel-processor', {
            outputChannelCount: [1, 1, 1, 1, 2],
            numberOfInputs: 1,
            numberOfOutputs: 5,
        });
        const v_worklet = new AudioWorkletNode(ctx, 'visual-processor', {
            outputChannelCount: [1, 1, 1, 1],
            numberOfInputs: 4,
            numberOfOutputs: 4,
            processorOptions: data,
        });

        c_worklet.disconnect();
        v_worklet.disconnect();

        // Connect analyser to each orig source channel
        for (const [i, s] of config.sources.entries()) {
            // setup low pass
            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.value = s.cutoff;

            // setup analyser
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 1024;
            analyser.minDecibels = -50;
            analyser.maxDecibels = -10;
            analyser.smoothingTimeConstant = 0.1;

            // init state properties
            State.sources[i].analyser = analyser;
            State.sources[i].byteBuffer = new Uint8Array(analyser.frequencyBinCount);
            State.sources[i].floatBuffer = new Float32Array(analyser.frequencyBinCount);

            // make connections
            c_worklet.connect(filter, i, 0);
            filter.connect(v_worklet, 0, i);
            v_worklet.connect(analyser, i, 0);
        }

        src.connect(c_worklet);
        c_worklet.connect(gain, 4);
        gain.connect(ctx.destination);
        src.start();
        ctx.suspend();

        this.nodes.context = ctx;
        this.nodes.source = src;
        //this.nodes.visualWorklet = v_worklet;
    },

    updateParameter(name, value) {
        // const par = this.nodes.visualWorklet.parameters.get(name);
        // par.value = value;
    },

    display() {
        // const mic = document.querySelector('#microphone');
        // mic.classList.remove("hide");
    },

    async toggleButtonClickHandler(button) {
        try {
            // If AudioContext doesn't exist, try creating one. 
            if (!this.nodes.context) {
                button.disabled = true;
                await this.setupContext();
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

