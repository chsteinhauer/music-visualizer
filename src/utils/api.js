import { wavify } from "./utils";

export async function getSourceNames() {
    const res = await fetch("http://localhost:3000/sources", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    })
    return res.json();
}


export async function getSampleNames() {
    const res = await fetch("http://localhost:3000/samplenames", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    })
    return res.json();
}

export async function getSample(ctx, file_name) {
    return fetch("http://localhost:3000/samples/" + file_name, {
            method: "POST",
            headers: {
                "Content-Type": "audio/wav"
            },
        })
        .then((res) => res.arrayBuffer())
        .then((buf) => ctx.decodeAudioData(buf));
}

/**
 * @param {File} file 
 * @returns sample rate
 */
export async function getSampleRate(file) {
    let form = new FormData();
    form.append("audio_file", file);

    const response = await fetch("http://localhost:3000/samplerate", {
        method: "POST",
        body: form,
    });

    return response.json();
}

/**
 * Reads file as array buffer and sets channel data on the 
 * two last channels in source
 * 
 * @param {AudioContext} ctx 
 * @param {AudioBufferSourceNode} src 
 * @param {File} file 
 */
export async function setAudioBuffer(ctx, src, file) {
    const reader = new FileReader();

    reader.onload = async (e) => {
        const original = await ctx.decodeAudioData(e.target.result);
        const buffer = ctx.createBuffer(10, original.length, ctx.sampleRate);
        buffer.getChannelData(8).set(original.getChannelData(0));
        buffer.getChannelData(9).set(original.getChannelData(1));

        src.buffer = buffer;
    };

    reader.readAsArrayBuffer(file);
}

/**
 * Generator that post a file to server, which response with
 * streaming chunks of seperated sources. All chunks are decoded into
 * an AudioBuffer and yielded to the caller.
 * 
 * @param {File} file 
 * @param {AudioContext} ctx 
 * @yields AudioBuffer
 */
export async function* stream(file, ctx) {
    let form = new FormData();
    form.append("audio_file", file);

    console.log(file);

    const response = await fetch("http://localhost:3000/seperate", {
        method: "POST",
        body: form,
    });

    const reader = response.body.getReader();

    while (true) {
        const { done, value } = await reader.read();

        if (done) return;

        const input = wavify(value.buffer, 8, ctx.sampleRate);
        yield ctx.decodeAudioData(input);
    }
}


