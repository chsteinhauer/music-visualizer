
class VisualProcessor extends AudioWorkletProcessor{
    constructor(options) {
        super();
    }

    static get parameterDescriptors() {
        return [
            {
                name: "state",
                defaultValue: 0,
            },
        ];
    }

    process(inputs, outputs, params) {
        var input = inputs[0];
        var output = outputs;

        for (let i = 0; i < output.length; ++i) {
            var out = output[i][0]

            for (let j = 0; j < out.length; ++j) {
                out[j] = input[i][j];
            }
        }
        
        return true;
    }
}

registerProcessor('visual-processor', VisualProcessor);