### HOW TO DEPLOY APP TO PHONE 

## COMMANDS

### ANDROID 
+ ionic capacitor run android 

### IOS
+ ionic capacitor run ios

#### NOTE:
+ after changing anything in the functions/index.js, should deploy to firebase server using firebase deploy command , because this file runs on firebase server

## HOW TO RUN APP LOCALLY 
+ Download firebase private key from https://console.firebase.google.com/project/ionic-angular-f34a9/settings/serviceaccounts/adminsdk then place the downloaded file in functions/firebase-cred by renaming to ionic-app.json
+ add googleAPI and firebase API keys by copy from respective websites 
