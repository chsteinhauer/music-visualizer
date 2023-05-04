
export const config = {
    sources: [
        {
            title: "voices",
            minPitch: 20,
            maxPitch: 5000,
            cutoff: 1000,
        },
        {
            title: "bass",
            minPitch: 20,
            maxPitch: 1000,
            cutoff: 300,
        },
        {
            title: "drums",
            minPitch: 20,
            maxPitch: 10000,
            cutoff: 5000,
        },
        {
            title: "other",
            minPitch: 100,
            maxPitch: 10000,
            cutoff: 5000,
        }
    ],
};