const gc = require('./storage-config/storage');
const admin = require("firebase-admin");

exports.uploadImage = (file) => new Promise((resolve, reject) => {
    const bucket = admin.storage().bucket('greenpill-live.appspot.com');
    const {originalname, buffer} = file;
    const file_name = originalname.replace(/ /g, "_");
    const gcsFileName = `${Date.now()}-${file_name}`;
    const blob = bucket.file(gcsFileName);
    const blobStream = blob.createWriteStream({
        resumable: false
    });
    const urlOptions = {
        version: "v4",
        action: "read",
        expires: Date.now() + 1000 * 60 * 60, // 2 minutes      
      }
      
    blobStream.on('finish', async() => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(publicUrl)
        // await bucket.file(blob.name).getSignedUrl(urlOptions)
        // .then( (url) => {
        //     resolve(url[0]);
        // })
    }).on('error',err => {
        console.log(err)
    }).end(buffer);
});