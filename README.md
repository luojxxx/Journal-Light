# Journal Light App

##Repo Structure
- The top level folder contains all the backend files. This is to facilitate Github integration with Heroku or AWS.
- One of the top level folders is the frontend folder. This contains all the frontend source code.

##Run your own copy
1. Download/clone repo
2. Using command line interface (CLI) from top-level folder run: ```pip install -r requirements.txt```
3. The backend will require these environment variables:
 - FLASK_DEBUG (a 'true'/'false' boolean)
 - SECRET_KEY (some secret string)
 - ORIGIN (the url of where your frontend is hosted)
 - DATABASE_URL (the database connection string)
 - RECAPTCHA_SECRET (the secret for the Google recaptcha to prevent spamming)
 - SENDGRID\_API\_KEY (the api-key for sending emails to enable journal AI)
4. Then run ```python application.py``` to start running the server locally
5. Now in a new CLI, navigate to frontend folder and run: 
```npm install```
6. Then while in the frontend folder, run either:
 - ```npm run start``` to run the frontend locally
 - ```npm run build``` to generate the bundled html, css, and javascript to deploy online
