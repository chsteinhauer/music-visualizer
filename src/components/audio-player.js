import { State } from "../model/state";
import url from "./audio-processor.js?url";
import FreeQueue from "../utils/free-queue";
import { QUEUE_SIZE } from "../static/constants";

export const Player = {
    context: null, 
    file: null,
    source: null, 
    workletNode: null,
    inputQueue: new FreeQueue(QUEUE_SIZE, 2),
    outputQueue: new FreeQueue(QUEUE_SIZE, 8),
    atomicState: new Int32Array(
        new SharedArrayBuffer(1 * Int32Array.BYTES_PER_ELEMENT)
    ),


    async createContext() {
        const n_inputs = 1;
        const n_analysers = State.sources.length;
        const n_channels = n_analysers;

        this.context = getAudioContext();
        this.source = this.context.createBufferSource();
        this.source.buffer = this.file.buffer;


        await this.context.audioWorklet.addModule(url);
        this.workletNode = new AudioWorkletNode(this.context, 'audio-processor', {
            outputChannelCount: [2, 2, 2, 2],
            numberOfInputs: n_inputs,
            numberOfOutputs: n_channels,
            processorOptions: {
                inputQueue: this.inputQueue,
                outputQueue: this.outputQueue,
                atomicState: this.atomicState
            },
        });


        for (let i = 0; i < n_analysers; ++i) {
            const analyser = this.context.createAnalyser();
            analyser.fftSize = 256;

            this.workletNode.connect(analyser, i, 0);
            State.sources[i].analyser = analyser;
            State.sources[i].buffer = new Uint8Array(analyser.frequencyBinCount);
        }

        this.source.connect(this.workletNode);
        this.workletNode.connect(this.context.destination);

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
                
                await this.createContext();

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
    },

    async init(callback) {     
            this.file = await loadSound("examples/Queen - Dont Stop Me Now.mp3");
            console.log(this.file);
            // Setup microphone button, have "start" and "stop" functionality
            const mic = document.querySelector('#microphone');
            mic.addEventListener('click', async () => await this.toggleButtonClickHandler());

            callback();
        }
    }

