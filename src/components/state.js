const MODE = {
    DEFAULT: 0,
    TEST: 1,
}

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
    source.analyser.getByteFrequencyData(data);

    return data;
}

function getFloatWaveform(source) {
    const data = source.floatBuffer;
    source.analyser.getFloatTimeDomainData(data);

    return data;
}

function getByteSpectrum(source) {
    const data = source.byteBuffer;
    source.analyser.getByteFrequencyData(data);

    return data;
}

function getFloatSpectrum(source) {
    const data = source.floatBuffer;
    source.analyser.getFloatFrequencyData(data);

    return data;
}

function getLevel(source) {
    const data = getFloatWaveform(source);

    let sum = 0.0;
    for (const amplitude of data) { 
        const level = amplitude*amplitude;
        sum += level < 0.001 ? 0 : level; 
    }

    return Math.sqrt(sum / data.length);
}

function getLevels(source, bins) {
    const levels = [];

    const freq = getFloatSpectrum(source);
    const chunk = round(freq.length / bins);

    for (let i = 0; i < freq.length; i += chunk) {
        const data = freq.slice(i, i + chunk);

        let sum = 0.0;
        for (const amplitude of data) { 
            const level = amplitude*amplitude;
            sum += level < 0.001 ? 0 : level; 
        }

        levels.push(Math.sqrt(sum / data.length));
    }
    return levels;
}

export const State = {
    state: AudioState.Setup,
    type: AudioType.None,
    sources: [],
    isTesting: false,

    getByteWaveform,
    getFloatWaveform,
    getByteSpectrum,
    getFloatSpectrum,
    getLevel,
    getLevels,

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

