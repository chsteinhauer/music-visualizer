export class PitchDetector {
    pitch;
    loaded = false;
    freq;

    constructor() {}

    startPitch(model, context, stream, callback = () => {}) {
        this.pitch = ml5.pitchDetection(
            model, 
            context, 
            stream, 
            () => this.modelLoaded(callback),
        );
    }

    modelLoaded(callback) {
        callback();
        this.loaded = true;
    }

    getPitch() {
        if (!this.loaded || !this.pitch) return;

        this.pitch.getPitch((err, frequency) => {
            if (err) {
                console.error(err);
            } 

            this.freq = frequency;
        });


        return this.freq;
    }
}

