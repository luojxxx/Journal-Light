from flask import Flask, jsonify, render_template, request
from flask_cors import CORS, cross_origin
import io
import os
import random

app = Flask(__name__)
CORS(app)
FLASK_DEBUG = 'true'

scriptpath = os.path.dirname(os.path.realpath(__file__))
def readFile(filepath):
    with io.open(filepath, 'r', encoding='utf8') as f:
        content = f.read().splitlines()
    return content


@app.route('/')
def index():
    return render_template('test_page.html')

@app.route('/api/v2/response',methods=['POST'])
# @requires_auth
def apiResponse():
    postData = request.get_json()
    entryValue = str(postData['entryValue'])

    if entryValue[-1:]=='\n':
        journalStarters = readFile( os.path.join(scriptpath, 'misc', 'journalstarters.txt') )
        randomStarter = random.choice(journalStarters)

        return jsonify({ 'response': randomStarter })

    else:
        continuations = readFile( os.path.join(scriptpath, 'misc', 'continuations.txt') )
        randomContinuation = random.choice(continuations)

        return jsonify({ 'response': randomContinuation })

if __name__ == "__main__":
    app.run()