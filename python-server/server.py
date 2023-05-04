from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/analyze", methods=["POST"])
def analyze():
    print(request.json)
    request.json["test"] = "test"
    return request.json

if __name__ == "__main__":
    app.run(port=3000)