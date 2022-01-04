const admin = require('firebase-admin');
const helpers = require('../helpers');

module.exports.add_notification = async (req, res, next) => {
    var db = admin.firestore();
    var notifier = "general notification";
    var notifier_title = req.body.title;
    var notifier_description = req.body.shortdescription;

    const data = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        timestamp: Date.now().toString(),
    }

    db.collection('notifications').add(data)
        .then((result) => {
            helpers.sendGenericNotification(notifier, notifier_title, notifier_description)
            res.json({
                status: true,
                status_code: 200,
                message: "Notification Added Successfully",
                redirect: '/notification-list'
            })
        })
        .catch((err) => {
            res.json({
                status: false,
                status_code: 501,
                error: err,
                message: "Something Went Wrong"
            })
        })
}

module.exports.get_notification_list = async (req, res) => {
    var db = admin.firestore();
    var notification_list = [];

    await db.collection('notifications')
        .get()
        .then((result) => {
            result.forEach(r => {
                var row = {
                    "id": r.id,
                    "title": r.data().title,
                    "description": r.data().description,
                    "category": r.data().category,
                    "created_at": r.data().timestamp,
                    "get_action_button": get_action_button(req, res, r)
                };
                notification_list.push(row)
            })
            sorted_list = notification_list.sort((a, b) => {
                return b.created_at - a.created_at;
            })
            res.json({
                status: true,
                status_code: 201,
                data: sorted_list,
                message: "Notification Fetched Successfully"
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


module.exports.edit_notification = (req, res, next) => {
    var db = admin.firestore();
    var id = req.params.id;
    var update_data = {
        'title': req.body.title,
        'description': req.body.description,
        'category': req.body.category,
    }
    db.collection('notifications').doc(`${id}`).update(update_data)
        .then((r) => {
            res.json({
                status: true,
                status_code: 200,
                message: "Notification Edited Successfully",
                redirect: "/notification-list"
            })
        })
        .catch((err) => {
            res.json({
                status: false,
                status_code: 501,
                message: "Internal server error"
            })
        })
}

function get_action_button(req, res, data) {
    var html = '';
    html += '<span class="action_tools">';
    html += '<a class="dt_edit" href="/notification/edit/' + data.id + '" data-toggle="tooltip" title="Edit!"><i class="fa fa-pencil"></i></a>';
    html += '<a class="dt_del delete" href="javascript:void(0);" data-toggle="tooltip" title="Delete!" data-action="trash" data-id="' + data.id + '" ><i class="fa fa-trash"></i></a>';
    html += '</span';
    return html;
}

module.exports.get_notification_data = function (notification_id, callback) {
    var db = admin.firestore();

    db.collection('notifications').doc(`${notification_id}`)
        .get()
        .then((r) => {
            const data = {
                id: r.id,
                title: r.data().title,
                description: r.data().description,
                category: r.data().category,
            }
            callback(data);
        })
        .catch((err) => {
            callback([]);
        })
}
module.exports.delete_notification = (req, res, next) => {
    var db = admin.firestore();
    var id = req.params.id;

    db.collection('notifications').doc(`${id}`).delete()
        .then((r) => {
            res.json({
                status: true,
                status_code: 200,
                message: "Notification Deleted Successfully",
                redirect: "/notification-list"
            })
        })
        .catch((err) => {
            res.json({
                status: false,
                status_code: 501,
                message: "Internal server error",
            })
        })
}
