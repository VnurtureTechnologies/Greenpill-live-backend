/*
    UTILITY FILE THAT RENAMES FILES IN STORAGE

    USE ONLY WHEN NEEDED - AMAN SUTARIYA
*/

const admin = require('firebase-admin');

exports.rename_storage_files = async function() {
    const db = admin.firestore();
    const bucket = admin.storage().bucket('greenpill-live.appspot.com');

    await db.collection('whatsnew').get()
    .then((result) => {
        result.forEach((data) => {

            let splitted_file_link = data.data().img.split('%2F')[1].split("?")
            let jpeg_ext = splitted_file_link[0].split('.');
            let file_name = `whatsnew/${jpeg_ext[0]}_${data.data().createdAt}.${jpeg_ext[1]}`;
            
            bucket.file(`whatsnew/${splitted_file_link[0]}`).rename(`whatsnew/${jpeg_ext[0]}_${data.data().createdAt}.${jpeg_ext[1]}`);

            update_data = {
                'img': `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file_name)}?alt=media&token=998a4e21-aa00-45bb-85a2-a3fca5e8f436`
            }

            db.collection('whatsnew').doc(data.id).update(update_data)
        })
    })

};