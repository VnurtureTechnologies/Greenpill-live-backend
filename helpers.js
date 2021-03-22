const path = require('path');
const gc = require('./storage-config/storage');

exports.uploadImage = (file) => new Promise((resolve, reject) => {
    const bucket = gc.bucket('greenpill-live.appspot.com');
    const {originalname, buffer} = file;
        const file_name = originalname.replace(/ /g, "_");
        const gcsFileName = `${Date.now()}-${file_name}`;
        const blob = bucket.file(gcsFileName);
        const blobStream = blob.createWriteStream({
            resumable: false
    });
    blobStream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(publicUrl);
    }).on('error',err => {
        console.log(err)
    }).end(buffer);
});