import { State } from "../model/state";
import url from "./audio-processor.js?url";
import FreeQueue from "../utils/free-queue";
import { QUEUE_SIZE } from "../static/constants";

export const Player = {
    context: null, 
    source: null, 
    workletNode: null,
    inputQueue: new FreeQueue(QUEUE_SIZE, 1),
    outputQueue: new FreeQueue(QUEUE_SIZE, 4),
    atomicState: new Int32Array(
        new SharedArrayBuffer(1 * Int32Array.BYTES_PER_ELEMENT)
    ),

    async createContext() {
        this.context = getAudioContext();
        await this.context.audioWorklet.addModule(url);

        const nInputs = 1;
        const nAnalysers = State.sources.length;
        const nChannels = nAnalysers * nInputs;

        this.workletNode = new AudioWorkletNode(this.context, 'audio-processor', {
            outputChannelCount: new Array(nChannels).fill(1),
            numberOfInputs: nInputs,
            numberOfOutputs: nChannels,
            processorOptions: {
                inputQueue: this.inputQueue,
                outputQueue: this.outputQueue,
                atomicState: this.atomicState
            },
        });

        this.updateParameter("sampleRate", this.context.sampleRate);

        // for (let i = 0; i < nAnalysers; ++i) {
        //     const analyser = this.context.createAnalyser();
        //     analyser.fftSize = 256;
        //     analyser.minDecibels = -90;
        //     analyser.maxDecibels = -10;
        //     analyser.smoothingTimeConstant = 0.65;
        //     this.workletNode.connect(analyser, i + nInputs, 0);
        //     State.sources[i].analyser = analyser;
        // }

        this.source.connect(this.workletNode);
        this.source.connect(this.context.destination);
        this.context.suspend();
    },

    updateParameter(name, value) {
        const par = this.workletNode.parameters.get(name);
        par.value = value;
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
            this.source.start(() => {
                this.context.resume();
                State.setState("play");
                select('#microphone').html('<img src="icons/microphone.svg" class="icon"></img>');
            });
            
        } else {
            this.source.stop();
            this.context.suspend();
            State.setState("stop");

            select('#microphone').html('<img src="icons/microphone-off.svg" class="icon"></img>');
        }

        this.updateParameter("state", State.state);
    },

    init(callback) {
            this.source = new p5.AudioIn();
            
            // Setup microphone button, have "start" and "stop" functionality
            const mic = document.querySelector('#microphone');
            mic.addEventListener('click', async () => await this.toggleButtonClickHandler());

            callback();
        }
    }

