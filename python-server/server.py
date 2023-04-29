from flask import Flask, request, send_file
from flask_cors import CORS
import seperator

app = Flask(__name__)
CORS(app)

#python-server/
PATH = "samples/"
name = "american_idiot"

@app.route("/sources", methods=["GET"])
def sources():
    return seperator.sources()

@app.route("/chunk", methods=["GET"])
def chunk():
    # filepath = PATH + name;

    # # checks if file exists
    # if os.path.isfile(filepath + '.json') and os.access(PATH, os.R_OK):
    #     print ("File exists and is readable")

    #     f = open(filepath + '.json')
    #     output = json.loads(f.read())
    # else:
    output = seperator.run(filepath + '.wav')

        # # Serializing json
        # json_object = json.dumps(output, indent=4)
        
        # # Writing to sample.json
        # with open(filepath + ".json", "w") as outfile:
        #     outfile.write(json_object)

    return output


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
    input = list(request.json)
    output = seperator.run(input)
    return output


if __name__ == "__main__":
    app.run(port=3000)
