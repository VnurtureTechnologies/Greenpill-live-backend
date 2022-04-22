const admin = require('firebase-admin');
const helpers = require('../helpers');

module.exports.add_app_update = (req, res, next) => {
    var db = admin.firestore();
    var data = {
        version: req.body.version,
        last_date: req.body.last_date.split('-')?.reverse().join('-') || "",
    }

    db.collection('app_update').add(data)
        .then((response) => {
            res.json({
                status_code: 201,
                status: true,
                message: 'App version updated successfully',
                redirect: '/app-update',
            })
        })
        .catch((err) => {
            res.json({
                status_code: 500,
                status: false,
                message: "Something went wrong",
            })
        })
}

module.exports.get_app_update = (req, res, next) => {
    var db = admin.firestore();
    var app_update_list = [];

    db.collection('app_update').get()
        .then((response) => {
            response.forEach((innerResponse) => {

                var row = {
                    "androidVersion": innerResponse.data().androidVersion,
                    "androidDate": innerResponse.data().androidDate,
                    "iosVersion": innerResponse.data().iosVersion,
                    "iosDate": innerResponse.data().iosDate,
                    "last_date": innerResponse.data().last_date,
                    "get_action_button": get_action_button(req, res, innerResponse)
                }

                app_update_list.push(row);

            })

            res.json({
                status: true,
                status_code: 201,
                data: app_update_list,
                message: "App update list fetched successfullly"
            })
        })
        .catch((err) => {
            res.json({
                status: false,
                status_code: 501,
                message: "Something Went Wrong"
            })
        })
}

function get_action_button(req, res, data) {
    var html = '';
    html += '<span class="action_tools">';
    html += '<a class="dt_edit" href="/app-update/edit/' + data.id + '" data-toggle="tooltip" title="Edit!"><i class="fa fa-pencil"></i></a>';
    html += '</span';
    return html;
}

module.exports.get_app_update_data = (id, callback) => {
    var db = admin.firestore();

    db.collection('app_update').doc(`${id}`)
        .get()
        .then((response) => {
            const data = {
                id: response.id,
                version: response.data().version,
                last_date: response.data().last_date.split('-').reverse().join('-'),
                today_date: new Date().toISOString().split('T')[0]
            }
            callback(data)
        })
        .catch((err) => {
            callback([]);
        })
}

module.exports.edit_app_update = (req, res, nex) => {
    var db = admin.firestore();
    var id = req.params.id;
    var notifier = "app update";
    var notifier_title = 'Greenpil Live App Updated';
    var notifier_description = `new version of ${req.body.OStype} - ${data.req.body.version} is available`;

    if (req.body.OStype == "android_version") {
        var data = {
            'androidVersion': req.body.version,
            'androidDate': req.body?.last_date?.split('-').reverse().join('-') || ""
        }
    } else if (req.body.OStype == "ios_version") {
        var data = {
            'iosVersion': req.body.version,
            'iosDate': req.body?.last_date?.split('-').reverse().join('-') || ""
        }
    } else {
        return false
    }

    db.collection('app_update').doc(`${id}`).update(data)
        .then(async (response) => {

            const notifidata = {
                title: 'Grrenpil Live App Updated',
                category: "App Update",
                userId: "all",
                description: `new version of ${req.body.OStype} - ${data.req.body.version} is available`,
                timestamp: Date.now().toString(),
            }

            await db.collection('notifications').add(notifidata)
                .then((result) => {
                    helpers.sendGenericNotification(notifier, notifier_title, notifier_description, result.id);
                }).catch((err) => { console.log(err) })

            res.json({
                status: true,
                status_code: 200,
                message: "App update data successfully",
                redirect: '/app-update'
            })
        })
        .catch((err) => {
            console.log(err);
            res.json({
                status_code: 500,
                status: false,
                message: "Something went wrong"
            })
        })
} 
