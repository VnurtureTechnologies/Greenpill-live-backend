const gc = require('./storage-config/storage');
const admin = require("firebase-admin");
var db = admin.firestore();


var foldername1='';
exports.getfolderName=(foldername)=>{
    foldername1=foldername
}

exports.uploadImage = (file) => new Promise((resolve, reject) => {
    const bucket = admin.storage().bucket('greenpill-live.appspot.com');
    const {originalname, buffer} = file;
    console.log(originalname)
    const file_name = originalname.replace(/ /g, "_");
    const gcsFileName = `${foldername1}/${file_name}`;
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

exports.deleteImage = (filelink) => new Promise((resolve, reject) => {
    // var filename = filelink.split('/o/')[1].split('?')[0]
    const bucket = admin.storage().bucket('greenpill-live.appspot.com');
    const filelink1 = filelink;
    bucket.file(`${foldername1}/${filelink1}`).delete();
});

exports.sendProjecttNotification = async function() {
    var db = admin.firestore();

    const notification_options = {
        priority: "high",
        timeToLive: 60 * 60 *24
    }

    const message = {
        notification: {
           title: "New project notification",
           body:  "New project added"
        }
    };
   
    await db.collection('users')
    .where('isNotify' , '==', true)
    .get()
    .then((result) => {
        result.forEach((r) => {
            admin.messaging().sendToDevice(r.data().fcmtoken, message, notification_options)
            .then((messagingResult) => {
                console.log(messagingResult);
            })
            .catch(err => {
                console.log(err);
            })
        })
    })
    .catch((err) => {
        console.log(err);
    })
}

exports.sendResourcetNotification = async function() {
    var db = admin.firestore();

    const notification_options = {
        priority: "high",
        timeToLive: 60 * 60 *24
    }

    const message = {
        notification: {
           title: "New resource notification",
           body:  "New resource added"
        }
    };
   
    await db.collection('users')
    .where('isNotify' , '==', true)
    .get()
    .then((result) => {
        result.forEach((r) => {
            admin.messaging().sendToDevice(r.data().fcmtoken, message, notification_options)
            .then((r) => {
                console.log(r);
            })
            .catch(err => {
                console.log(err);
            })
        })
    })
    .catch((err) => {
        console.log(err);
    })
}

exports.sendNewsNotification = async function() {
    var db = admin.firestore();

    const notification_options = {
        priority: "high",
        timeToLive: 60 * 60 *24
    }

    const message = {
        notification: {
           title: "New news notification",
           body:  "New news added"
        }
    };
   
    await db.collection('users')
    .where('isNotify' , '==', true)
    .get()
    .then((result) => {
        result.forEach((r) => {
            admin.messaging().sendToDevice(r.data().fcmtoken, message, notification_options)
            .then((r) => {
                console.log(r);
            })
            .catch(err => {
                console.log(err);
            })
        })
    })
    .catch((err) => {
        console.log(err);
    })
}