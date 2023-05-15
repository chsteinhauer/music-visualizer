from flask import Flask, request, stream_with_context, send_file
from flask_cors import CORS
import seperator
import torchaudio as ta
import numpy as np
import tempfile
import soundfile
import noisereduce as nr
import os
  

app = Flask(__name__)
CORS(app)

PATH = "./samples/"

@app.route('/samplenames', methods = ['GET'])
def sample_names():
    return os.listdir("./python-server/samples/")

@app.route('/samples/<string:filename>', methods = ['POST'])
def samples(filename):
    return send_file(
            PATH + filename, 
            mimetype="audio/wav", 
            as_attachment=True, 
            download_name=filename,
    )



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
        mix, rate = ta.load(input)

        for row in seperator.separate_sources_generator(mix, rate):
            # we make a temporary file as .wav format to store
            # the data chunk in
            chunk = tempfile.NamedTemporaryFile(suffix=".wav")

            audio = nr.reduce_noise(y=row, sr=rate)
            audio = np.array(audio).T
            audio = (audio * (2 ** 15 - 1)).astype("<h")
            soundfile.write(chunk, audio, rate)

            # skip header, as it is set on client side - because
            # web audio api is rude and does not support streaming
            chunk.seek(44)

            # send chunk to client
            yield chunk.read()

            chunk.close()

    return app.response_class(stream_with_context(generate()), mimetype='audio/x-wav')


if __name__ == "__main__":
    app.run(port=3000)
