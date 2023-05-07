from flask import Flask, request, send_file, Response, jsonify, stream_with_context
from flask_cors import CORS
import seperator
from scipy.io import wavfile
import re
import torchaudio as ta
import wave
import numpy as np
import io

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

@app.route("/seperate", methods=["POST"])
def seperate():


    def generate():
        input = request.files["audio_file"]
        mix, sr = ta.load(input)

        print("ello")

        tmp = io.BytesIO()
        wwav = wave.open(tmp, 'wb')
        # 8 Channels.
        wwav.setnchannels(8)
        # 2 bytes per sample.
        wwav.setsampwidth(2)
        wwav.setframerate(sr)

        rwav = wave.open(tmp, 'rb')

        for row in seperator.separate_sources(mix,sr):
            audio = np.array(row).T
            # Convert to (little-endian) 16 bit integers.
            audio = (audio * (2 ** 15 - 1)).astype("<h")

            n = len(audio)
            wwav.writeframes(audio.tobytes())
            
            wwav.setpos(rwav.getnframes() - n)
            yield rwav.readframes(n)

            
        wwav.close()
        rwav.close()
        tmp.close()


    return app.response_class(stream_with_context(generate()), mimetype="audio/x-wav")



def genHeader(sampleRate, bitsPerSample, channels):
    datasize = 2000*10**6
    o = bytes("RIFF",'ascii')                                               # (4byte) Marks file as RIFF
    o += (datasize + 36).to_bytes(4,'little')                               # (4byte) File size in bytes excluding this and RIFF marker
    o += bytes("WAVE",'ascii')                                              # (4byte) File type
    o += bytes("fmt ",'ascii')                                              # (4byte) Format Chunk Marker
    o += (16).to_bytes(4,'little')                                          # (4byte) Length of above format data
    o += (1).to_bytes(2,'little')                                           # (2byte) Format type (1 - PCM)
    o += (channels).to_bytes(2,'little')                                    # (2byte)
    o += (sampleRate).to_bytes(4,'little')                                  # (4byte)
    o += (sampleRate * channels * bitsPerSample // 8).to_bytes(4,'little')  # (4byte)
    o += (channels * bitsPerSample // 8).to_bytes(2,'little')               # (2byte)
    o += (bitsPerSample).to_bytes(2,'little')                               # (2byte)
    o += bytes("data",'ascii')                                              # (4byte) Data Chunk Marker
    o += (datasize).to_bytes(4,'little')                                    # (4byte) Data size in bytes
    return o

if __name__ == "__main__":
    app.run(port=3000)
