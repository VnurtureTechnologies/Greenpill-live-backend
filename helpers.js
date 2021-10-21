const gc = require('./storage-config/storage');
const admin = require("firebase-admin");
var db = admin.firestore();
var hbs = require('hbs');


var foldername1 = '';
exports.getfolderName = (foldername) => {
    foldername1 = foldername
}

exports.uploadImage = (file) => new Promise((resolve, reject) => {
    const bucket = admin.storage().bucket('greenpill-live.appspot.com');
    const { originalname, buffer } = file;
    const file_name = originalname.replace(/ /g, "_");
    var gcsFileName = "";
    if (file.mimetype == "application/pdf") {
        gcsFileName = `${foldername1}/pdfs/${Date.now()}_${file_name}`;
    }
    else {
        gcsFileName = `${foldername1}/${Date.now()}_${file_name}`;
    }

    const blob = bucket.file(gcsFileName);
    const blobStream = blob.createWriteStream({
        resumable: false
    });

    blobStream.on('finish', async () => {
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(blob.name)}?alt=media&token=998a4e21-aa00-45bb-85a2-a3fca5e8f436`;
        resolve(publicUrl)
    }).on('error', err => {
        console.log(err)
    }).end(buffer);
});

exports.deleteImage = (filelink) => new Promise((resolve, reject) => {
    const bucket = admin.storage().bucket('greenpill-live.appspot.com');
    const filelink1 = filelink;
    bucket.file(`${foldername1}/${filelink1}`).delete();
    resolve('done');
});

exports.deletePdf = (filelink) => new Promise((resolve, reject) => {
    const bucket = admin.storage().bucket('greenpill-live.appspot.com');
    bucket.file(`${foldername1}/pdfs/${filelink}`).delete();
    resolve('done')
})

var selectedServiceId = '';

function setServiceId(sel) {
    selectedServiceId = sel.options[sel.selectedIndex].text;
}

console.log(selectedServiceId);

hbs.registerHelper('isServiceSelected', function(value, options) {
    // console.log(value);
    // console.log(options);
})

exports.sendGenericNotification = async function (notifier, title, description) {
    var db = admin.firestore();

    const notification_options = {
        priority: "high",
        timeToLive: 60 * 60 * 24
    }

    var message = "";

    if (notifier == "general notification") {
        message = {
            notification: {
                title: `Notification - ${title}`,
                body: description
            },
            data: {
                click_action: 'FLUTTER_NOTIFICATION_CLICK',
                status: 'done',
                screen: 'notification'
            }
        }
    }
    else if (notifier == "project notification") {
        message = {
            notification: {
                title: `New project added - ${title}`,
                body: description
            },
            data: {
                click_action: 'FLUTTER_NOTIFICATION_CLICK',
                status: 'done',
                screen: 'product'
            }
        }
    }
    else if (notifier == "news notification") {
        message = {
            notification: {
                title: `News - ${title}`,
                body:  description
            },
            data: {
                click_action: 'FLUTTER_NOTIFICATION_CLICK',
                status: 'done',
                screen: 'news'
            }
        }
    }
    else if (notifier == "resource notification") {
        message = {
            notification: {
                title: `Downloads Notification - ${title}`,
                body: description
            },
            data: {
                click_action: 'FLUTTER_NOTIFICATION_CLICK',
                status: 'done',
                screen: 'resources'
            }
        }
    }
    else {
        console.log("Invalid notifier");
    }

    await db.collection('users')
        .where('isNotify', '==', true)
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
