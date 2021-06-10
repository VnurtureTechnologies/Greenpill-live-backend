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
    
    blobStream.on('finish', async() => {
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(blob.name)}?alt=media&token=998a4e21-aa00-45bb-85a2-a3fca5e8f436`;
        resolve(publicUrl)
    }).on('error',err => {
        console.log(err)
    }).end(buffer);
});