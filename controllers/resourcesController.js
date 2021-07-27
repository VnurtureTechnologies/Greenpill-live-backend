const admin = require('firebase-admin');
const helpers = require('../helpers');

module.exports.add_resources = async (req, res, next) => {
    var db = admin.firestore();
    var notifier = "resource notification";
    var notifier_title = req.body.title;
    var notifier_description = req.body.description;
    await helpers.getfolderName('resource')

    const data = {
        title: req.body.title,
        description: req.body.description,
        productRef: req.body.productRef,
        image: await helpers.uploadImage(req.files[1]),
        pdfUrl: await helpers.uploadImage(req.files[0]),
        createdAt: Date.now().toString(),
    }

    db.collection('resources').add(data)
        .then((result) => {
            helpers.sendGenericNotification(notifier, notifier_title, notifier_description)
            res.json({
                status: true,
                status_code: 200,
                message: "Download Added Successfully",
                redirect: '/resources-list'
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

function response(res, resources_list) {

    sorted_resourcesList = resources_list.sort((a, b) => {
        return b.created_at - a.created_at
    })

    res.json({
        status: true,
        status_code: 201,
        data: sorted_resourcesList,
        message: "Resources List Fetched Successfully"
    })
}

module.exports.get_resources_list = async (req, res) => {
    var db = admin.firestore();
    var resources_list = [];

    await db.collection('resources')
        .get()
        .then((result) => {
            result.forEach(async (r) => {
                await db.collection('product').doc(r.data().productRef)
                    .get()
                    .then(async (innerResult) => {
                        var x = innerResult.data().title;
                        var row = {
                            "id": r.id,
                            "title": r.data().title,
                            "description": r.data().description,
                            "product": x,
                            "created_at": r.data().createdAt,
                            "get_download_button": get_download_button(r.data().pdfUrl),
                            "get_action_button": get_action_button(req, res, r)
                        };
                        resources_list.push(row)
                    })
            })
            setTimeout(response, 1000, res, resources_list);
        })
        .catch((err) => {
            console.log(err);
            res.json({
                status: false,
                status_code: 501,
                message: "Something Went Wrong"
            })
        })
}


module.exports.edit_resources = async (req, res, next) => {
    var db = admin.firestore();
    var id = req.params.id;
    var filelink = "";
    var update_data = ""
    await helpers.getfolderName('resource')
    if (req.files.length !== 0) {
        if (req.files[0] && req.files[1]) {
            update_data = {
                'title': req.body.title,
                'description': req.body.description,
                'productRef': req.body.productRef,
                'image': await helpers.uploadImage(req.files[1]),
                'pdfUrl': await helpers.uploadImage(req.files[0]),
            };
        } else {
            if (req.files[0].mimetype == "application/pdf") {
                update_data = {
                    'title': req.body.title,
                    'description': req.body.description,
                    'productRef': req.body.productRef,
                    'pdfUrl': await helpers.uploadImage(req.files[0]),
                };
            } else {
                update_data = {
                    'title': req.body.title,
                    'description': req.body.description,
                    'productRef': req.body.productRef,
                    'image': await helpers.uploadImage(req.files[0]),
                };
            }
        }
        // db.collection("resources")
        //     .doc(`${id}`)
        //     .get()
        //     .then(async (r) => {
        //         const data = {
        //             filelink1: r.data().image
        //         }
        //         filelink = data.filelink1
        //         await helpers.deleteImage(filelink)
        //     })
        //     .catch((err) => {
        //         console.log(err)
        //     });

    } else {
        update_data = {
            'title': req.body.title,
            'description': req.body.description,
            'productRef': req.body.productRef
        }
    }

    db.collection('resources').doc(`${id}`).update(update_data)
        .then((r) => {
            res.json({
                status: true,
                status_code: 200,
                message: "Download Edited Successfully",
                redirect: "/resources-list"
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
    html += '<a class="dt_edit" href="/resources/edit/' + data.id + '" data-toggle="tooltip" title="Edit!"><i class="fa fa-pencil"></i></a>';
    html += '<a class="dt_del delete" href="javascript:void(0);" data-toggle="tooltip" title="Delete!" data-action="trash" data-id="' + data.id + '" ><i class="fa fa-trash"></i></a>';
    html += '</span';
    return html;
}

function get_download_button(data) {
    var html = '';
    html += '<span class="action_tools">';
    html += '<a class="dt_edit" href="' + data + '" target="_blank" data-toggle="tooltip" title="Download!"><i class="fa fa-download"></i></a>';
    html += '</span';
    return html;
}


module.exports.get_resources_data = function (resources_id, callback) {
    var db = admin.firestore();

    db.collection('resources').doc(`${resources_id}`)
        .get()
        .then((r) => {
            const data = {
                id: r.id,
                title: r.data().title,
                productRef: r.data().productRef,
                image: r.data().image,
                description: r.data().description,
                pdfUrl: r.data().pdfUrl,
            }
            callback(data);
        })
        .catch((err) => {
            callback([]);
        })
}
module.exports.delete_resources = async (req, res, next) => {
    var db = admin.firestore();
    var id = req.params.id;
    var filelink = "";
    await helpers.getfolderName('resource')

    db.collection("resources")
        .doc(`${id}`)
        .get()
        .then(async (r) => {
            const data = {
                filelink1: r.data().image
            }
            filelink = data.filelink1
            await helpers.deleteImage(filelink)
        })
        .catch((err) => {
            console.log(err)
        });

    db.collection('resources').doc(`${id}`).delete()
        .then((r) => {
            res.json({
                status: true,
                status_code: 200,
                message: "Download Deleted Successfully",
                redirect: "/resources-list"
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
