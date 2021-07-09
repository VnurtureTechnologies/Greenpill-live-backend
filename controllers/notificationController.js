const admin = require('firebase-admin');

module.exports.add_notification = async(req,res,next) => {
    var db = admin.firestore();

    const data = {
        title : req.body.title,
        shortDescription: req.body.shortdescription,
        category: req.body.category,
        createdAt: Date.now().toString(),
    }

    db.collection('notifications').add(data)
    .then( (result) => {
        res.json({
            status: true,
            status_code: 200,
            message: "Notification added successfully",
            redirect: '/notification-list'
        })
    })
    .catch( (err) => {
        res.json({
            status: false,
            status_code: 501,
            error: err,
            message: "Something went wrong"
        })
    })
}

module.exports.get_notification_list = async(req,res) => {
    var db = admin.firestore();
    var notification_list = [];

    await db.collection('notifications')
    .get()
    .then( (result) => {
        result.forEach(r => {
            var row = {
                "id": r.id,
                "title" : r.data().title,
                "shortdescription": r.data().shortDescription,
                "category" : r.data().category,
                "get_action_button": get_action_button(req,res,r)
            };
            notification_list.push(row)
        })
        res.json({
            status: true,
            status_code: 201,
            data: notification_list,
            message: "Notification fetched successfully"
        })
    })
    .catch( (err) => {
        res.json({
            status: false,
            status_code: 501,
            message: "Something went wrong"
        })
    })
}


module.exports.edit_notification = (req,res,next) => {
    var db = admin.firestore();
    var id = req.params.id;
    var update_data = {
        'title': req.body.title,
        'shortDescription': req.body.shortdescription,
        'category': req.body.category,
    }
    db.collection('notifications').doc(`${id}`).update(update_data)
    .then( (r) => {
        res.json({
            status: true,
            status_code: 200,
            message: "Notification edited successfully",
            redirect: "/notification-list"
        })
    })
    .catch( (err) => {
        res.json({
            status: false,
            status_code: 501,
            message: "Internal server error"
        })
    })
}

function get_action_button(req,res,data) {
    var html = '';
    html += '<span class="action_tools">';
    html += '<a class="dt_edit" href="/notification/edit/' + data.id + '" data-toggle="tooltip" title="Edit!"><i class="fa fa-pencil"></i></a>';
    html += '<a class="dt_del delete" href="javascript:void(0);" data-toggle="tooltip" title="Delete!" data-action="trash" data-id="' + data.id + '" ><i class="fa fa-trash"></i></a>';
    html += '</span';
    return html;
}

module.exports.get_notification_data = function(notification_id,callback) {
    var db = admin.firestore();

    db.collection('notifications').doc(`${notification_id}`)
    .get()
    .then( (r) => {
        const data = {
            id: r.id,
            title: r.data().title,
            shortdescription: r.data().shortDescription,
            category: r.data().category,
        }
        callback(data);
    })
    .catch( (err) => {
        callback([]);
    })
}
module.exports.delete_notification = (req,res,next) => {
    var db = admin.firestore();
    var id = req.params.id;
    
    db.collection('notifications').doc(`${id}`).delete()
    .then( (r) => {
        res.json({
            status: true,
            status_code: 200,
            message: "notification deleted successfully",
            redirect:"/notification-list"
        })
    })
    .catch( (err) => {
        res.json({
            status: false,
            status_code: 501,
            message: "Internal server error",
        })
    })
}
