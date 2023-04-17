
const AudioType = {
    None: 0,
    Mic: 1,
    Stream: 2,
}

const AudioState = {
    Stop: 0,
    Play: 1,
    Pause: 2,
}

export class AudioPlayer {
    atype = AudioType.None; 
    astate = AudioState.Stop;
    context; mic;

    constructor() { 
        this.mic = new p5.AudioIn();
    }

    startMic(callback) {
        this.atype = AudioType.Mic;
        this.astate = AudioState.Play;
        select('#microphone').html('<img src="icons/microphone.svg" class="icon"></img>');

        this.context = getAudioContext();
        this.mic.start(() => callback(this.context, this.mic));
        this.context.resume();
    }

    stopMic() {
        this.astate = AudioState.Stop;
        select('#microphone').html('<img src="icons/microphone-off.svg" class="icon"></img>');

        this.mic.stop();
    }

    setup(callback) {
        
        // Setup microphone button, have "start" and "stop" functionality
        document.querySelector('#microphone').addEventListener('click', (e) => {
            if (this.atype === AudioType.Mic) {
                if (this.astate === AudioState.Stop) {
                    this.startMic(callback);
                } else {
                    this.stopMic();
                }
            } else {
                this.startMic(callback);
            }
        })
    }
}
