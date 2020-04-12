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
+ add googleAPI and firebase API keys by copy from respective websites to the environment folder 


## PUBLISH
+ Generate Icons and Splash screens through https://apetools.webprofusion.com/#/tools/imagegorilla
+ Ionic iOS Publishing Docs: https://ionicframework.com/docs/publishing/app-store
+ Ionic Android Publishing Docs: https://ionicframework.com/docs/publishing/play-store
+ Ionic PWA Publishing Docs: https://ionicframework.com/docs/publishing/progressive-web-app

## PRODUCTION URL 
+ https://ionic-angular-f34a9.web.app/

## HOW TO DEPLOY LOCALLY BUILD and TEST 
+ ng build 
+ ionic capacitor add android 
+ ionic capacitor copy android 
+ ionic capacitor run android 
+ by running this command , it will open android studio , then if you connected android device already , then click on play button on android studio, then application will launch on the connected device 
+ for information please check the udemy video section : Building Native Apps with Capacitor