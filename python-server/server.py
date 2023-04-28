from flask import Flask, request
from flask_cors import CORS
import analysis
import seperator

app = Flask(__name__)
CORS(app)

tmpurl = "python-server/samples/american_idiot.wav"

@app.route("/sources", methods=["GET"])
def sources():
    return seperator.sources()

@app.route("/chunk", methods=["GET"])
def chunk():
    return seperator.run(tmpurl)


@app.route("/seperate", methods=["POST"])
def seperate():
    input = list(request.json)
    output = seperator.run(input)
    return output

if __name__ == "__main__":
    app.run(port=3000)
