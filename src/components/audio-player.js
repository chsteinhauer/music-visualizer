import { State } from "../model/state";
import channel_url from "./channel-processor.js?url";
import visual_url from "./visual-processor.js?url";
import FreeQueue from "../utils/free-queue";
import { QUEUE_SIZE } from "../static/constants";
import { getSampleRate, setAudioBuffer, stream } from "../utils/api";
import { config } from "../model/config";
import { append } from "../utils/utils";

const nodes = {
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

    async prepareAudioData(file, ctx, src, callback) {
        // seperate track
        console.log("begin buffering...");
        let streaming = false;

        const buffering = (load) => (load / file.size) * 100;

        let loaded = 0;
        for await (const chunk of stream(file, ctx)) {
            const length = chunk.length;
            append(chunk, src.buffer, loaded);

            loaded += length;

            if (!streaming) {
                src.start();
                ctx.suspend();
                console.log("ready!");
                streaming = true;
                callback();
            }
        }

        console.log("buffering done!")
    },
    
    async setupContext(file, callback) {
        const sampleRate = await getSampleRate(file);
        const ctx = new AudioContext({ sampleRate });
        const src = ctx.createBufferSource();
        await setAudioBuffer(ctx, src, file);

        const gain = ctx.createGain();
        const splitter = ctx.createChannelSplitter(10);
        const main = ctx.createChannelMerger(2);
        

        // Prepare nodes for audio processing
        // await ctx.audioWorklet.addModule(channel_url);
        await ctx.audioWorklet.addModule(visual_url);
        
        // const c_worklet = new AudioWorkletNode(ctx, 'channel-processor', {
        //     outputChannelCount: [1, 1, 1, 1, 2],
        //     numberOfInputs: 1,
        //     numberOfOutputs: 5,
        // });
        const worklet = new AudioWorkletNode(ctx, 'visual-processor', {
            outputChannelCount: [1, 1, 1, 1],
            numberOfInputs: 4,
            numberOfOutputs: 4,
            processorOptions: data,
        });

        // c_worklet.disconnect();
        worklet.disconnect();

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
            analyser.smoothingTimeConstant = 0.75;

            const merge = ctx.createChannelMerger(1);

            // init state properties
            State.sources[i].analyser = analyser;
            State.sources[i].byteBuffer = new Uint8Array(analyser.frequencyBinCount);
            State.sources[i].floatBuffer = new Float32Array(analyser.frequencyBinCount);

            const channel = i * 2;
            splitter.connect(merge, channel, 0);
            splitter.connect(merge, channel+1, 0);

            merge.connect(filter);
            filter.connect(worklet, 0, i)
            worklet.connect(analyser, i, 0);
        }

        //     // make connections
        //     c_worklet.connect(filter, i, 0);
        //     filter.connect(v_worklet, 0, i);
        //     v_worklet.connect(analyser, i, 0);
        // }
        src.connect(splitter);
        splitter.connect(main, 8, 0);
        splitter.connect(main, 9, 1);
       
        //c_worklet.connect(gain, 4);
        main.connect(gain);
        gain.connect(ctx.destination);

        ctx.suspend();

        this.nodes.context = ctx;
        this.nodes.source = src;

        await this.prepareAudioData(file, ctx, src, callback);
    },

    updateParameter(name, value) {
        // const par = this.nodes.visualWorklet.parameters.get(name);
        // par.value = value;
    },

    async toggleButtonClickHandler() {
        // try {
        //     // If AudioContext doesn't exist, try creating one. 
        //     if (!this.nodes.context) {
        //         button.disabled = true;
        //         await this.setupContext();
        //     }

        //     if (!this.nodes.audioContext) {
        //         this.nodes.audioContext = getAudioContext();
        //     }

        //     button.disabled = false;
        // } catch(error) {
        //     button.disabled = false;
        //     console.error(error);
        //     return;
        // }

        if (!State.isStreaming()) {
            this.start();
            select('#toggle-play').html('<img src="icons/pause.svg" class="icon"></img>');
        } else {
            this.pause();
            select('#toggle-play').html('<img src="icons/play.svg" class="icon"></img>');
        }
    },
}

