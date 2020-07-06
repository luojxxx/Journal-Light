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
import jwt
import base64
from functools import wraps

import flask
from flask import request, Response, send_file, render_template, make_response, flash
from flask import session, redirect, send_from_directory, jsonify, _request_ctx_stack
from flask import Flask
from flask_cors import CORS, cross_origin
from werkzeug.local import LocalProxy

import urlparse
from sqlalchemy import create_engine, desc, asc, and_, or_
from sqlalchemy.orm import sessionmaker
from database_setup import Base, User 

import sendgrid
from sendgrid.helpers.mail import *

# import twilio.twiml
import responselogic


# Getting server filepath
scriptpath = os.path.dirname(os.path.realpath(__file__))

# Create the Flask app
application = flask.Flask(__name__)
application.config['DEBUG'] = os.environ['FLASK_DEBUG'] == 'true'
application.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
cors = CORS(application, origins=os.environ.get('ORIGIN') )

# Get RDS connection info and setting up database connection+session
urlparse.uses_netloc.append("postgres")
url = urlparse.urlparse(os.environ["DATABASE_URL"])

if 'HEROKU_INSTANCE' in os.environ:
    DATABASES = {
        'default': {
            'NAME': url.path[1:],
            'USER': url.username,
            'PASSWORD': url.password,
            'HOST': url.hostname,
            'PORT': url.port
        }
    }

engine = create_engine('postgresql://%s:%s@%s:%s/%s' % (
    DATABASES['default']['USER'],
    DATABASES['default']['PASSWORD'],
    DATABASES['default']['HOST'],
    DATABASES['default']['PORT'],
    DATABASES['default']['NAME'],
    ), echo=True)
Base.metadata.bind = engine
DBSession = sessionmaker(bind=engine)
dbsession = DBSession()

# Authentication annotation
# current_user = LocalProxy(lambda: _request_ctx_stack.top.current_user)

# # Authentication attribute/annotation
# def authenticate(error):
#   resp = jsonify(error)

#   resp.status_code = 401

#   return resp

# def requires_auth(f):
#   @wraps(f)
#   def decorated(*args, **kwargs):
#     auth = request.headers.get('Authorization', None)
#     if not auth:
#       return authenticate({'code': 'authorization_header_missing', 'description': 'Authorization header is expected'})

#     parts = auth.split()

#     if parts[0].lower() != 'bearer':
#       return {'code': 'invalid_header', 'description': 'Authorization header must start with Bearer'}
#     elif len(parts) == 1:
#       return {'code': 'invalid_header', 'description': 'Token not found'}
#     elif len(parts) > 2:
#       return {'code': 'invalid_header', 'description': 'Authorization header must be Bearer + \s + token'}

#     token = parts[1]
#     try:
#         payload = jwt.decode(
#             token,
#             base64.b64decode(os.environ['AUTH0_JWT_CLIENT_SECRET'].replace("_","/").replace("-","+")),
#             audience=os.environ['AUTH0_JWT_CLIENT_ID']
#         )
#     except jwt.ExpiredSignature:
#         return authenticate({'code': 'token_expired', 'description': 'token is expired'})
#     except jwt.InvalidAudienceError:
#         return authenticate({'code': 'invalid_audience', 'description': 'incorrect audience, expected: 67PeMjFB2OGEVLCH6fs3B0EMTdkQqhIr'})
#     except jwt.DecodeError:
#         return authenticate({'code': 'token_invalid_signature', 'description': 'token signature is invalid'})

#     _request_ctx_stack.top.current_user = user = payload
#     return f(*args, **kwargs)

#   return decorated

# def requires_auth(f):
#   @wraps(f)
#   def decorated(*args, **kwargs):
#     postData = request.get_json()
#     uid = str(postData['uid'])
#     password = str(postData['password'])

#     try: 
#         userInfo = dbsession.query(User).filter_by(name=uid).one()

#         if userInfo.password == password:
#             return f(*args, **kwargs)
#         else:
#             return jsonify({ 'response': 'Wrong password' })

#     except:
#         traceback.print_exc()
#         dbsession.rollback()
#         return jsonify({ 'response': 'Can not find user' })

#   return decorated

#Client authentication functions
def password_generator(size=10, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(size))

def addNewUser(uid, password):
    newUser = User(
        email='none@gmail.com', 
        phonenumber='+3335558888', 
        name=str(uid), 
        password=str(password),
        signupdate='2016-09-22', 
        paymentdate='2016-09-22',
        quota=10)

    dbsession.add(newUser)
    dbsession.commit()

@application.route('/api/v2/emailauth',methods=['POST'])
def apiEmailAuth():
    postData = request.get_json()
    userEmail = str(postData['email'])
    uid = str(postData['uid'])
    uid = re.escape( uid[-10:] )

    recaptchaKey = str(postData['recaptchaKey'])
    recaptchaSecret = os.environ.get('RECAPTCHA_SECRET')
    r = requests.post('https://www.google.com/recaptcha/api/siteverify', data = {'secret':recaptchaSecret, 'response':recaptchaKey})
    r = r.json()
    if r['success'] != True:
        return jsonify({ 'response': 'Failed recaptcha verification' })

    #Generates password, and creates a new user or changes password to current one
    password = password_generator()

    try: 
        editeduserInfo = dbsession.query(User).filter_by(name=uid).one()
        editeduserInfo.password = password
        dbsession.add(editeduserInfo)
        dbsession.commit()

    except:
        traceback.print_exc()
        dbsession.rollback()
        addNewUser(uid, password)

    #Sends password to email
    sg = sendgrid.SendGridAPIClient(apikey=os.environ.get('SENDGRID_API_KEY'))
    from_email = Email("admin@email.journallight.com")
    subject = "Journal Light: Here's your password!"
    to_email = Email(userEmail)
    content = Content("text/plain", "Hello, your password is %s" % password)
    mail = Mail(from_email, subject, to_email, content)
    response = sg.client.mail.send.post(request_body=mail.get())

    return jsonify({ 'response': 'Ok' })

# #Response AI functions
@application.route('/api/v2/response',methods=['POST'])
def apiResponse():
    postData = request.get_json()
    entryValue = str(postData['entryValue'])
    priorResponse = str(postData['priorResponse'])
    uid = str(postData['uid'])
    password = str(postData['password'])
    quotaCheck = (str(postData['quotaCheck']) == 'True')

    #Limit value lengths and autoescaping especially when going into database
    entryValue = entryValue[-4000:]
    priorResponse = priorResponse[-2000:]
    uid = re.escape( uid[-10:] )
    password = re.escape( password[-15:] )

    try: 
        userInfo = dbsession.query(User).filter_by(name=uid).one()

        if userInfo.password != password:
            return jsonify({ 'response': 'Wrong password' })

    except:
        traceback.print_exc()
        dbsession.rollback()
        return jsonify({ 'response': 'Can not find user' })

    if quotaCheck:
        return jsonify({ 'response': '', 'quota': userInfo.quota }) 

    if userInfo.quota <= 0:
        return jsonify({ 'response': '', 'quota': 0 })

    userInfo.quota -= 1
    dbsession.add(userInfo)
    dbsession.commit()

    response = test_responselogic.responselogic(entryValue)

    return jsonify({ 'response': response['response'], 'quota': userInfo.quota })


##### Webpage and API Routes #####
# @application.route('/')
# @application.route('/about')
# @application.route('/journal')
# def chatapp():
#     return render_template('index.html')

# def getUserData(userEmail):
#     try: 
#         userInfo = dbsession.query(User).filter_by(email=userEmail).first().serialize
#         userId = userInfo['id']

#         userData = dbsession.query(UserData).filter_by(user_id=userId).order_by(asc(UserData.datetime_code))
#         userDataOrder = dbsession.query(UserDataOrder).filter_by(user_id=userId).first().serialize

#         return userData, userDataOrder, userId

#     except:
#         dbsession.rollback()

    # currentdatetime = datetime.datetime.now()
    # newUserData = UserData(
    #     data_id = 1,
    #     datetime_code = currentdatetime.strftime('20%y%m%d%H%M%S'),
    #     ai_response = False,
    #     datetime_precision = 'minute',
    #     content = 'Welcome to your journal AI',
    #     user_id = userId,
    #     )
    # dbsession.add(newUserData)
    # dbsession.commit()

    # newUserDataOrder = UserDataOrder(
    #     data_order = [1],
    #     user_id = userId,
    #     )

    # dbsession.add(newUserDataOrder)
    # dbsession.commit()




# @application.route('/api/v2/getuserdata',methods=['GET'])
# @requires_auth
# def apiGetUserData():
#     userEmail = request.args.get('loginEmail')
#     userName = request.args.get('loginName')

#     try: 
#         userInfo = dbsession.query(User).filter_by(email=userEmail).first().serialize

#     except:
#         dbsession.rollback()
#         addNewUser(userEmail, userName)
    
#     userData, userDataOrder, userId = getUserData(userEmail)

#     userDataList = [i.serialize for i in userData]
#     userDataObject = {'datalist': userDataList, 'dataorder': userDataOrder, 'userId': userId }

#     return jsonify(userDataObject)


# @application.route('/api/v2/postuserdata',methods=['POST'])
# @requires_auth
# def apiPostUserData():
#     postData = request.get_json()

#     userEmail = postData['loginEmail']
#     # userEmail = 'luo.j2010@gmail.com'
#     print userEmail

#     userInfo = dbsession.query(User).filter_by(email=userEmail).first().serialize
#     userId = userInfo['id']
    
#     updateData = postData['updateData']
#     newData = postData['newData']
#     deleteData = postData['deleteData']
#     databaseOrder = postData['databaseOrder']

#     for dataId in updateData:
#         if dataId in newData or deleteData:
#             continue

#         editedItem = dbsession.query(UserData).filter_by(user_id=userId, data_id=dataId).one()
#         editedItem.content = updateData[dataId]['content']
#         editedItem.datetime_code = updateData[dataId]['datetime_code']
#         editedItem.datetime_precision = updateData[dataId]['datetime_precision']
#         dbsession.add(editedItem)

#     for dataId in newData:
#         if dataId in deleteData:
#             continue

#         newDataEle = newData[dataId]
#         newUserDataEntry = UserData(
#             data_id = newDataEle['data_id'], 
#             datetime_code = newDataEle['datetime_code'], 
#             datetime_precision = newDataEle['datetime_precision'], 
#             content = newDataEle['content'], 
#             user_id = newDataEle['user_id'], 
#             ai_response = newDataEle['ai_response'], 
#             )
#         dbsession.add(newUserDataEntry)

#     for dataId in deleteData:
#         deletedItem = dbsession.query(UserData).filter_by(user_id=userId, data_id=dataId).one()
#         dbsession.delete(deletedItem)

#     editedOrder = dbsession.query(UserDataOrder).filter_by(user_id=userId).one()
#     editedOrder.data_order = databaseOrder
#     dbsession.add(editedOrder)

#     dbsession.commit()

#     return jsonify({'Status': 'Okay'})


# App stuff
if __name__ == '__main__':
    application.run(host='0.0.0.0', port=int(5000))