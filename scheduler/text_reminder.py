import schedule
import time
import os
import random
import io
from twilio.rest import TwilioRestClient 

ACCOUNT_SID = os.environ.get('TWILIO_SID') 
AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN') 
 
client = TwilioRestClient(ACCOUNT_SID, AUTH_TOKEN) 

scriptpath = os.path.dirname(os.path.realpath(__file__))

def readFile(filepath):
    with io.open(filepath, 'r', encoding='utf8') as f:
        content = f.read().splitlines()
    return content

def journalStarterResponse(scriptpath):
    journalStarters = readFile( os.path.join(scriptpath, 'journalstarters.txt') )
    randomStarter = random.choice(journalStarters)
    return randomStarter

def job():
    print("I'm working...")
    journalPrompt = journalStarterResponse(scriptpath) + ' http://alphadev-dev.sn22bmaivu.us-west-1.elasticbeanstalk.com/'
    client.messages.create(
        to="+4150001001", 
        from_="+4150001000", 
        body=journalPrompt, 
        # media_url="https://c1.staticflickr.com/3/2899/14341091933_1e92e62d12_b.jpg", 
    )

schedule.every().day.at('22:40').do(job)

while True:
    schedule.run_pending()
    time.sleep(1)