

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// NOTE : whenever this file updated, please deploy this file to server using "firebase deploy" command 

const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const Busboy = require('busboy');
const os = require('os');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid/v4');

const { Storage } = require('@google-cloud/storage');
const fbAdmin = require('firebase-admin');

const storage = new Storage({
  projectId: 'ionic-angular-f34a9'
});

fbAdmin.initializeApp({
  credential : fbAdmin.credential.cert(
    require('./firebase-cred/ionic-app.json')
  )
})

exports.storeImage = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    if (req.method !== 'POST') {
      return res.status(500).json({ message: 'Not allowed.' });
    }

    if(!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')){
      return res.status(401).json({error :'Unauthorized!'})
    }
    let idToken;
    idToken = req.headers.authorization.split('Bearer ')[1];

    const busboy = new Busboy({ headers: req.headers });
    let uploadData;
    let oldImagePath;

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      const filePath = path.join(os.tmpdir(), filename);
      uploadData = { filePath: filePath, type: mimetype, name: filename };
      file.pipe(fs.createWriteStream(filePath));
    });

    busboy.on('field', (fieldname, value) => {
      oldImagePath = decodeURIComponent(value);
    });

    busboy.on('finish', () => {
      const id = uuid();
      let imagePath = 'images/' + id + '-' + uploadData.name;
      if (oldImagePath) {
        imagePath = oldImagePath;
      }

      return fbAdmin.auth().verifyIdToken(idToken).then(decodedToken=>{
        console.log(uploadData.type);
        return storage
          .bucket('ionic-angular-f34a9.appspot.com')
          .upload(uploadData.filePath, {
            uploadType: 'media',
            destination: imagePath,
            metadata: {
              metadata: {
                contentType: uploadData.type,
                firebaseStorageDownloadTokens: id
              }
            }
          })
      })
        // login to generate uploaded image path 
      .then(() => {
          return res.status(201).json({
            imageUrl:
              'https://firebasestorage.googleapis.com/v0/b/' +
              storage.bucket('ionic-angular-f34a9.appspot.com').name +
              '/o/' +
              encodeURIComponent(imagePath) +
              '?alt=media&token=' +
              id,
            imagePath: imagePath
          });
        })
        .catch(error => {
          console.error('ERROR--->',error);
          return res.status(401).json({ error: 'Unauthorized!' });
        });
    });
    return busboy.end(req.rawBody);
  });
});