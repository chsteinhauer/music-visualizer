import { drawBasic, setupBasic } from "../visualizers/basic";
import { drawCircles, setupCircles } from "../visualizers/circles";
import { drawConfetti, setupConfetti } from "../visualizers/confetti";
import { drawMarione, setupMarione } from "../visualizers/marione";

export const config = {
    visualizers: [
        {
            title: "basic",
            setup: setupBasic,
            draw: drawBasic,
        },
        {
            title: "marione",
            setup: setupMarione,
            draw: drawMarione,
        },
        {
            title: "circles",
            setup: setupCircles,
            draw: drawCircles,
        },
        {
            title: "confetti",
            setup: setupConfetti,
            draw: drawConfetti,
        },
    ],

    sources: [
        {
            title: "vocals",
            cutoff: 2000,
            fftSize: 1024,
            minDecibels: -50,
            maxDecibels: -10,
            smoothingTimeConstant: 0.75,
        },
        {
            title: "other",
            cutoff: 10000,
            fftSize: 1024,
            minDecibels: -50,
            maxDecibels: -10,
            smoothingTimeConstant: 0.75,
        },
        {
            title: "bass",
            cutoff: 500,
            fftSize: 1024,
            minDecibels: -50,
            maxDecibels: -10,
            smoothingTimeConstant: 0.6,
        },
        {
            title: "drums",
            cutoff: 5000,
            fftSize: 1024,
            minDecibels: -50,
            maxDecibels: -10,
            smoothingTimeConstant: 0.6,
        }
    ],
    examples: [
        {
            title: "alvanoto",
            genre: "noise",
        }, 
        {
            title: "augustgreene",
            genre: "r&b",
        },
        {
            title: "berio",
            genre: "electronic music",
        },
        {
            title: "donaldbyrd",
            genre: "jazz",
        },
        {
            title: "duranduran",
            genre: "new wave",
        },
        {
            title: "fktwigs",
            genre: "avant-pop",

        },
        {
            title: "gnarls",
            genre: "soul",

        },
        {
            title: "opeth",
            genre: "metal",

        },
        {
            title: "saariaho",
            genre: "contemporary music",

        },
        {
            title: "whatalife",
            genre: "pop",
        },
    ],
};