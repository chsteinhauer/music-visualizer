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

export async function getOriginalData(ctx) {
    const promise = fetch("http://localhost:3000/file/original", {
        method: "GET",
        headers: {
            "Content-Type": "audio/wav"
        },
    }).then((res) => res.arrayBuffer())
    .then((buf) => ctx.decodeAudioData(buf));
    
    return promise;
}

export async function stream(file, ctx) {
    let form = new FormData();
    form.append("audio_file", file);
    let streaming = false;

    const response = await fetch("http://localhost:3000/seperate", {
        method: "POST",
        body: form,
    });

    const reader = response.body.getReader();
    while (true) {
        const { done, value } = await reader.read();
        console.log(value);
        //ctx.decodeAudioData(value.buffer).then((val) => console.log(val));

        if (done) {
            // Do something with last chunk of data then exit reader
            return;
        }
        
        // if (!streaming) {
        //     src.start();
        //     streaming = true;
        // }
    }
}


// export async function getData() {
//     const res = await fetch("http://localhost:3000/chunk", {
//         method: "GET",
//         headers: {
//             "Content-Type": "application/json"
//         },
//     })
//     return res.json();
// }

// export async function seperate(data) {
//     const res = await fetch("http://localhost:3000/seperate", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify(data)
//     })
//     return res.json();
// }

