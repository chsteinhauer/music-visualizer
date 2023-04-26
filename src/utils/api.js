
export async function sources() {
    const res = await fetch("http://localhost:3000/sources", {
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

