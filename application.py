# -*- coding: utf-8 -*-
import os
import sys
import json
import random
import datetime
import string
import traceback
import requests
import io
import re
import base64
from functools import wraps

import flask
from flask import request, Response, send_file, render_template, make_response, flash
from flask import session, redirect, send_from_directory, jsonify, _request_ctx_stack
from flask import Flask
from flask_cors import CORS, cross_origin
from dotenv import load_dotenv

from response_logic import generate_response

# Load environ variables
load_dotenv()

# Getting server filepath
scriptpath = os.path.dirname(os.path.realpath(__file__))

# Create the Flask app
app = flask.Flask(__name__)
app.config['DEBUG'] = os.getenv('FLASK_DEBUG') == 'true'
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
cors = CORS(app, origins=os.getenv('ORIGIN') )

# #Response AI functions
@app.route('/api/v2/response',methods=['POST'])
def apiResponse():
    postData = request.form
    entryValue = str(postData['entryValue'])
    response = generate_response(entryValue)

    return jsonify({ 'response': response['response'] })

# App stuff
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)