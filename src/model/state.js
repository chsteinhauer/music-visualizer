
function source(options = {}) {
    return {
        // signifies if source is currently playing
        active: false,
        // string, percussive, voice etc.
        type: null, 
        // raw input of source identified from input stream
        input: [],
        // fundemental frequency
        frequency: null,
        // harmonic overtones
        overtones: [],
        // additional custom properties
        ...options,
    }
}


export const state = {
    // raw input data
    buffer: [],
    // length of buffer
    bufferLength: 0,
    // frequency buffer
    frequencies: [],
    // level buffer
    level: [],
    // array of source elements
    sources: []
};
