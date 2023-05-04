from flask import Flask, request, send_file
from flask_cors import CORS
import seperator
from scipy.io import wavfile

app = Flask(__name__)
CORS(app)

#python-server/
PATH = "samples/"
name = "american_idiot"

@app.route("/sources", methods=["GET"])
def sources():
    return seperator.sources()


@app.route("/file/<source>", methods=["GET"])
def file(source):
    file_name = name + "_" + source + ".wav";
    file_path = PATH + file_name

    return send_file(
        file_path, 
        mimetype = "audio/wav", 
        as_attachment = True, 
        download_name = file_name
    )

@app.route("/pitch/<source>", methods=["GET"])
def pitch(source):
    file_name = name + "_" + source + ".wav";
    file_path = "python-server/" + PATH + file_name

    sr, audio = wavfile.read(file_path)

    return _pitch.detect(audio, sr)

@app.route("/seperate", methods=["POST"])
def seperate():
    input = list(request.json)
    output = seperator.run(input)
    return output


if __name__ == "__main__":
    app.run(port=3000)
