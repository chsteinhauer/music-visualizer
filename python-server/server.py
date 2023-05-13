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
    input = request.files["audio_file"]
    mix, sr = ta.load(input)

    return [sr]


@app.route("/seperate", methods=["POST"])
def seperate():


    def generate():
        
        input = request.files["audio_file"]
        mix, sr = ta.load(input)

        for row in seperator.separate_sources(mix,sr):
            temp = tempfile.NamedTemporaryFile(suffix=".wav")

            audio = np.array(row).T
            soundfile.write(temp, audio, sr)

            # skip header, as it is set on client side
            temp.seek(44)
            yield temp.read()

            temp.close()

    return app.response_class(stream_with_context(generate()), mimetype='audio/x-wav')


if __name__ == "__main__":
    app.run(port=3000)




# @app.route("/file/<source>", methods=["GET"])
# def file(source):
#     file_name = name + "_" + source + ".wav";
#     file_path = PATH + file_name

#     return send_file(
#         file_path,
#         mimetype = "audio/wav",
#         as_attachment = True,
#         download_name = file_name
#     )