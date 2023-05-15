
export const config = {
    sources: [
        {
            title: "vocals",
            minPitch: 20,
            maxPitch: 5000,
            cutoff: 2000,
        },
        {
            title: "other",
            minPitch: 100,
            maxPitch: 10000,
            cutoff: 10000,
        },
        {
            title: "bass",
            minPitch: 20,
            maxPitch: 1000,
            cutoff: 400,
        },
        {
            title: "drums",
            minPitch: 20,
            maxPitch: 10000,
            cutoff: 5000,
        }
    ],
};