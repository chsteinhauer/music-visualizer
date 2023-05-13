from flask import Flask, request, stream_with_context
from flask_cors import CORS
import seperator
import torchaudio as ta
import numpy as np
import tempfile
import soundfile
  

app = Flask(__name__)
CORS(app)


@app.route("/sources", methods=["GET"])
def sources():
    return seperator.sources()


@app.route("/samplerate", methods=["POST"])
def samplerate():
    # i dunno how to get sample rate in javascript, so here we are
    input = request.files["audio_file"]
    mix, sr = ta.load(input)

    return [sr]


@app.route("/seperate", methods=["POST"])
def seperate():

    # make generator for source seperation to stream the sources 
    # back to the client, as the model is heavy and slow
    def generate():
        input = request.files["audio_file"]
        mix, sr = ta.load(input)

        for row in seperator.separate_sources(mix,sr):
            # we make a temporary file as .wav format to store
            # the data chunk in
            chunk = tempfile.NamedTemporaryFile(suffix=".wav")

            audio = np.array(row).T
            soundfile.write(chunk, audio, sr)

            # skip header, as it is set on client side - because
            # web audio api is rude and does not support streaming
            chunk.seek(44)

            # send chunk to client
            yield chunk.read()

            chunk.close()

    return app.response_class(stream_with_context(generate()), mimetype='audio/x-wav')


if __name__ == "__main__":
    app.run(port=3000)
