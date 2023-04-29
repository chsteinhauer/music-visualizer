import { State } from "../model/state";

export async function getSourceNames() {
    const res = await fetch("http://localhost:3000/sources", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    })
    return res.json();
}

export async function getSourceData(ctx) {
    let data = []

    for (var s of State.sources) {
        const promise = fetch("http://localhost:3000/file/" + s.title, {
            method: "GET",
            headers: {
                "Content-Type": "audio/wav"
            },
        }).then((res) => res.arrayBuffer())
        .then((buf) => ctx.decodeAudioData(buf));

        data.push(promise)
    }
    
    return Promise.all(data)
}

export async function getData() {
    const res = await fetch("http://localhost:3000/chunk", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    })
    return res.json();
}

export async function seperate(data) {
    const res = await fetch("http://localhost:3000/seperate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    return res.json();
}

