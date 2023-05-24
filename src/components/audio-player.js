import { State } from "./state";
import url from "./visual-processor.js?url";
import FreeQueue from "../utils/free-queue";
import { QUEUE_SIZE } from "../static/constants";
import { getSample, getSampleRate, setAudioBuffer, stream } from "../utils/api";
import { config } from "../static/config";
import { append } from "../utils/utils";

const nodes = {
    context: null, 
    source: null,
    worklet: null,
}

const data = {
    inputQueue: new FreeQueue(QUEUE_SIZE, 6),
    outputQueue: new FreeQueue(QUEUE_SIZE, 6),
    atomicState: new Int32Array(
        new SharedArrayBuffer(1 * Int32Array.BYTES_PER_ELEMENT)
    ),
}

/**
 * Controls the state and nodes in the audio processing chain. Manages
 * buffers and all that stuff
 */
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
        // if (this.nodes.source)
        //     this.nodes.source.stop();
        if (this.nodes.context) {
            this.nodes.context.suspend();
            this.nodes.context.close();
        }

        State.setState("pause");
        select('#toggle-play').html('<img src="icons/play.svg" class="icon"></img>');
    },

    /**
     * Fills up buffer by receiving streams of chunks from
     * server - after first chunk is received and set, the 
     * audio can be played
     * 
     * @param {File} file 
     * @param {AudioContext} ctx 
     * @param {AudioBufferSourceNode} src 
     * @param {Function} callback 
     */
    async fillBuffer(file, ctx, src, callback) {
        console.log("begin buffering...");
        let streaming = false;

        let loaded = 0;
        for await (const chunk of stream(file, ctx)) {
            const length = chunk.length;
            append(chunk, src.buffer, loaded);

            loaded += length;

            // Make audio playable
            if (!streaming) {
                src.start();
                ctx.suspend();

                streaming = true;
                callback();

                console.log("ready to play!");
            }
        }

        console.log("buffering done!", ctx.currentTime)
    },


    async setupFromFile(file, callback) {
        const sampleRate = await getSampleRate(file);
        const ctx = new AudioContext({ sampleRate });
        const src = ctx.createBufferSource();

        await setAudioBuffer(ctx, src, file);
        await this.setupContext(src, ctx);
        await this.fillBuffer(file, ctx, src, callback);
    },

    async setupFromExample(file_name, callback) {
        const ctx = new AudioContext({ sampleRate: 44100 });
        const src = ctx.createBufferSource();

        src.buffer = await getSample(ctx, file_name);
        await this.setupContext(src, ctx);

        src.start();
        ctx.suspend();
        callback();
    },
    
    /**
     * Setup audio processing chain from source to destination
     * 
     * @param {File} file 
     * @param {Function} callback 
     */
    async setupContext(src, ctx) {
        const gain = ctx.createGain();
        const splitter = ctx.createChannelSplitter(10);
        const main = ctx.createChannelMerger(2);
        
        await ctx.audioWorklet.addModule(url);
        const worklet = new AudioWorkletNode(ctx, 'visual-processor', {
            outputChannelCount: [1, 1, 1, 1, 1, 1],
            numberOfInputs: 6,
            numberOfOutputs: 6,
            processorOptions: data,
        });

        worklet.disconnect();

        // Connect analyser to each source channel
        for (const [i, s] of State.sources.entries()) {
            const _config = config.sources.find(c => c.title === s.title);

            // setup low pass
            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.value = _config.cutoff;

            // setup analyser
            const analyser = ctx.createAnalyser();
            analyser.fftSize = _config.fftSize;
            analyser.minDecibels = _config.minDecibels;
            analyser.maxDecibels = _config.maxDecibels;
            analyser.smoothingTimeConstant = _config.smoothingTimeConstant;

            const merge = ctx.createChannelMerger(1);

            // init state properties
            s.analyser = analyser;
            s.byteBuffer = new Uint8Array(analyser.frequencyBinCount);
            s.floatBuffer = new Float32Array(analyser.frequencyBinCount);

            const channel = i * 2;
            splitter.connect(merge, channel, 0);
            splitter.connect(merge, channel+1, 0);

            merge.connect(worklet, 0, i);
            //filter.connect(worklet, 0, i)
            worklet.connect(analyser, i, 0);
        }

        src.connect(splitter);
        splitter.connect(worklet, 8, 4);
        splitter.connect(worklet, 9, 5);
        worklet.connect(main, 4, 0);
        worklet.connect(main, 5, 1);
        main.connect(gain);
        gain.connect(ctx.destination);

        ctx.suspend();

        src.loop = !State.isTesting;
        src.onended = () => {
            const duration = src.buffer.duration;
            const time = ctx.currentTime;

            //if (time >= duration) {
                //this.stop();

            //}
        };

        this.nodes.context = ctx;
        this.nodes.source = src;
        this.nodes.worklet = worklet;
    },

    /**
     * Handler for clicking the play/pause button
     */
    async toggleButtonClickHandler() {
        if (!State.isStreaming()) {
            this.start();
            select('#toggle-play').html('<img src="icons/pause.svg" class="icon"></img>');
        } else {
            this.pause();
            select('#toggle-play').html('<img src="icons/play.svg" class="icon"></img>');
        }
    },

    hasEnded() {
        if (!this.nodes.source || !this.nodes.context) return true;
        const duration = this.nodes.source.buffer.duration;
        const time = this.nodes.context.currentTime;

        console.log(duration, time);

        return duration < time;
    }
}

