import { detectPitch } from "../utils/pitch-detector";

// make smoothning

const AudioType = {
    None: 0,
    Mic: 1,
    Media: 2,
}

const AudioState = {
    Stop: 0,
    Play: 1,
    Pause: 2,
    Loading: 3,
    Default: 4,
}

function getByteWaveform(source) {
    const data = source.byteBuffer;
    //source.analyser.getFloatTimeDomainData(data);
    source.analyser.getByteFrequencyData(data);

    return data;
}

function getFloatWaveform(source) {
    const data = source.floatBuffer;
    //source.analyser.getFloatTimeDomainData(data);
    source.analyser.getFloatFrequencyData(data);

    return data;
}

function getByteSpectrum(source) {
    const data = source.byteBuffer;
    //source.analyser.getFloatFrequencyData(data);
    source.analyser.getByteFrequencyData(data);

    return data;
}

function getFloatSpectrum(source) {
    const data = new Float32Array(source.analyser.frequencyBinCount); // source.floatBuffer;
    //source.analyser.getFloatFrequencyData(data);
    source.analyser.getFloatFrequencyData(data);

    return data;
}

function getEnvelope(source) {
    const data = source.envelopeBuffer;
    source.envelope.getFloatTimeDomainData(data);

    return data;
}

function getPitch(source) {
    const data = getFloatWaveform(source);
    return detectPitch(data);
}

export const State = {
    state: AudioState.Setup,
    type: AudioType.None,
    sources: [],

    getByteWaveform,
    getFloatWaveform,
    getByteSpectrum,
    getFloatSpectrum,
    getEnvelope,
    getPitch,

    isStreaming() {
        return this.state === AudioState.Play;
    },

    isLoading() {
        return this.state === AudioState.Loading;
    },

    isMicrophone() {
        return this.type === AudioType.Mic;
    },

    isMedia() {
        return this.type === AudioType.Media;
    },

    source(options = {}) {
        return {
            // signifies if source is currently enabled to play
            active: false,
            // string, percussive, voice etc.
            type: null,
            // fundemental frequency
            frequency: null,

            frequencyQueue: [],
            // harmonic overtones
            overtones: [],
    
            buffer: null,
            // AnalyserNode for this source
            analyser: null,
            // additional custom properties
            ...options,
        }
    },

    add(options = {}) {
        this.sources.push(this.source(options));
    },

    setState(state) {
        switch (state) {
            case 'play':
                this.state = AudioState.Play;
                break;

            case 'stop':
                this.state = AudioState.Stop;
                break;

            case 'pause':
                this.state = AudioState.Pause;
                break;

            case 'loading':
                this.state = AudioState.Loading;
                break;

            case 'default':
                this.state = AudioState.Default;
                break;
        }
    },
}

