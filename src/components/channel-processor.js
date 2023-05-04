
class ChannelProcessor extends AudioWorkletProcessor{
    constructor(options) {
        super();
    }

    process(inputs, outputs, params) {
        const input = inputs[0];
        const output = outputs;

        for (let i = 0; i < 4; ++i) {
            const out = output[i][0];

            for (let j = 0; j < out.length; ++j) {
                out[j] = input[i][j];
            }
        }

        for (let j = 0; j < input[4].length; ++j) {
            output[4][0][j] = input[4][j];
            output[4][1][j] = input[5][j];
        }

        return true;
    }

}

registerProcessor('channel-processor', ChannelProcessor);