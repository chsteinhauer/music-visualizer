from flask import Flask, request
from flask_cors import CORS
import analysis

app = Flask(__name__)
CORS(app)

@app.route("/sources", methods=["GET"])
def sources():
    return analysis.sources()

@app.route("/seperate", methods=["POST"])
def seperate():
    input = list(request.json)
    output = analysis.seperate_batch(input)
    return output

if __name__ == "__main__":
    app.run(port=3000)
