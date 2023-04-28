import { State } from "../model/state";
import url from "./audio-processor.js?url";
import FreeQueue from "../utils/free-queue";
import { QUEUE_SIZE } from "../static/constants";

import * as ort from "onnxruntime-web";

const onnxurl = "models/conv_tasnet.onnx";

export const Player2 = {
    context: null, 
    source: null, 
    session: null,
    workletNode: null,
    gain: null,
    inputQueue: new FreeQueue(QUEUE_SIZE, 1),
    outputQueue: new FreeQueue(QUEUE_SIZE, 4),
    atomicState: new Int32Array(
        new SharedArrayBuffer(1 * Int32Array.BYTES_PER_ELEMENT)
    ),


    async createContext(source) {

        const nInputs = 1;
        const nAnalysers = State.sources.length;
        const nChannels = nAnalysers * nInputs;


        this.context = getAudioContext();
        await this.context.audioWorklet.addModule(url);
        this.workletNode = new AudioWorkletNode(this.context, 'audio-processor', {
            // outputChannelCount: new Array(nChannels).fill(1),
            numberOfInputs: 1,
            numberOfOutputs: 6,
            // processorOptions: {
            //     inputQueue: this.inputQueue,
            //     outputQueue: this.outputQueue,
            //     atomicState: this.atomicState
            // },
        });

        const script = this.context.createScriptProcessor(512, 1, 1);
        const merger = this.context.createChannelMerger();

        script.onaudioprocess = async (e) => {
            const raw = e.inputBuffer.getChannelData(0);//.map(Math.abs);
            const data = new ort.Tensor('float32', raw, [1, 1, 2, 256]);
            const results = await this.session.run({ "input.1": data });

            const sources = 4;
            const size = results["4117"].size / sources;
            const t_out = results["4117"].data.buffer;

            console.log(results["4117"]);
            // const output = [];
            // for (let i = 4; i > 0; i--) {
            //     output.push(t_out.splice(0, t_out.length / i));
            // }
            // console.log(output);

            for (let c = 0; c < sources; ++c) {
                const channel = e.outputBuffer.getChannelData(c);

                for (let i = 0; i < size; ++i) {
                    channel[i] = t_out[i * (c + 1)];
                }
            }
        }
        
        //this.source.connect(this.workletNode);
        source.connect(script);
        script.connect(this.workletNode);
        //this.source.connect(this.context.destination);

        for (let i = 0; i < nAnalysers; ++i) {
            const analyser = this.context.createAnalyser();
            analyser.fftSize = 256;
            // analyser.minDecibels = -90;
            // analyser.maxDecibels = -10;
            //analyser.smoothingTimeConstant = 0.65;
            this.workletNode.connect(analyser, i, 0);
            State.sources[i].analyser = analyser;
            State.sources[i].buffer = new Uint8Array(analyser.frequencyBinCount);
        }

        this.workletNode.connect(merger, 4, 0);
        this.workletNode.connect(merger, 5, 1);

        merger.connect(this.context.destination);
        this.context.suspend();

    },

    updateParameter(name, value) {
        // const par = this.workletNode.parameters.get(name);
        // par.value = value;
    },

    display() {
        // const mic = document.querySelector('#microphone');
        // mic.classList.remove("hide");
    },

    async toggleButtonClickHandler() {
        // If AudioContext doesn't exist, try creating one. 
        if (!this.context) {
            try {
                var mic = new p5.AudioIn();
                await this.createContext(mic);
                this.source = mic;
                //this.context = getAudioContext();

            } catch(error) {
                console.error(error);
                return;
            }
        }

        if (!State.isStreaming()) {
            State.setState("play");
            this.source.start();
            this.context.resume();

            select('#microphone').html('<img src="icons/microphone.svg" class="icon"></img>');
        } else {
            State.setState("stop");
            select('#microphone').html('<img src="icons/microphone-off.svg" class="icon"></img>');
            this.source.stop();
            this.context.suspend();
        }

        this.updateParameter("state", State.state);
    },

    getLevel() {
        return 0;//this.source.getLevel();
    },

    async init(callback) {            
            // Setup microphone button, have "start" and "stop" functionality
            const mic = document.querySelector('#microphone');
            mic.addEventListener('click', async () => await this.toggleButtonClickHandler());

            this.session = await ort.InferenceSession.create(onnxurl, {executionProviders: ['wasm']});
            console.log(this.session);

            callback();
        }
    }

