import { drawBasic, setupBasic } from "../visualizers/basic";
import { drawCircles, setupCircles } from "../visualizers/circles";
import { drawConfetti, setupConfetti } from "../visualizers/confetti";
import { drawMarione, setupMarione } from "../visualizers/marione";

export const config = {
    visualizers: [
        {
            title: "confetti",
            setup: setupConfetti,
            draw: drawConfetti,
        },
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
    ],

    sources: [
        {
            title: "vocals",
            minPitch: 20,
            maxPitch: 5000,
            cutoff: 2000,
            fftSize: 1024,
            minDecibels: -50,
            maxDecibels: -10,
            smoothingTimeConstant: 0.75,
        },
        {
            title: "other",
            minPitch: 100,
            maxPitch: 10000,
            cutoff: 10000,
            fftSize: 1024,
            minDecibels: -50,
            maxDecibels: -10,
            smoothingTimeConstant: 0.75,
        },
        {
            title: "bass",
            minPitch: 20,
            maxPitch: 1000,
            cutoff: 400,
            fftSize: 1024,
            minDecibels: -50,
            maxDecibels: -10,
            smoothingTimeConstant: 0.6,
        },
        {
            title: "drums",
            minPitch: 20,
            maxPitch: 10000,
            cutoff: 5000,
            fftSize: 1024,
            minDecibels: -50,
            maxDecibels: -10,
            smoothingTimeConstant: 0.6,
        }
    ],
};