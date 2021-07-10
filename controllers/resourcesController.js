const admin = require('firebase-admin');
const helpers = require('../helpers');

module.exports.add_resources = async (req, res, next) => {
    var db = admin.firestore();
    var notifier = "resource notification";

    const data = {
        title: req.body.title,
        description: req.body.description,
        productRef: req.body.productRef,
        image: await helpers.uploadImage(req.file),
        pdfUrl: req.body.pdfUrl,
        createdAt: Date.now(),
    }

    db.collection('resources').add(data)
        .then((result) => {
            helpers.sendGenericNotification(notifier)
            res.json({
                status: true,
                status_code: 200,
                message: "Resource added successfully",
                redirect: '/resources-list'
            })
        })
        .catch((err) => {
            res.json({
                status: false,
                status_code: 501,
                error: err,
                message: "Something went wrong"
            })
        })
}

function response(res, resources_list) {
    res.json({
        status: true,
        status_code: 201,
        data: resources_list,
        message: "Project list fetched successfully"
    })
}

module.exports.get_resources_list = async (req, res) => {
    var db = admin.firestore();
    var resources_list = [];

    await db.collection('resources')
        .get()
        .then((result) => {
            result.forEach(async(r) => {
                await db.collection('product').doc(r.data().productRef)
                .get()
                .then(async (innerResult) => { 
                    var x = innerResult.data().title;
                    var row = {
                        "id": r.id,
                        "title": r.data().title,
                        "description": r.data().description,
                        "product": x,
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
                message: "Something went wrong"
            })
        })
}


module.exports.edit_resources = async (req, res, next) => {
    var db = admin.firestore();
    var id = req.params.id;
    var filelink = "";
    var update_data = ""


    if (req.body.productRef != '') {
        if (req.file) {
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

            update_data = {
                'title': req.body.title,
                'description': req.body.description,
                'productRef': req.body.productRef,
                'image': await helpers.uploadImage(req.file),
                'pdfUrl': req.body.pdfUrl
            };
        } else {
            update_data = {
                'title': req.body.title,
                'description': req.body.description,
                'productRef': req.body.productRef,
                'pdfUrl': req.body.pdfUrl
            }
        }
    }
    else {
        if (req.file) {
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

            update_data = {
                'title': req.body.title,
                'description': req.body.description,
                'image': await helpers.uploadImage(req.file),
                'pdfUrl': req.body.pdfUrl
            };
        } else {
            update_data = {
                'title': req.body.title,
                'description': req.body.description,
                'pdfUrl': req.body.pdfUrl
            }
        }

    }

        db.collection('resources').doc(`${id}`).update(update_data)
            .then((r) => {
                res.json({
                    status: true,
                    status_code: 200,
                    message: "Resources edited successfully",
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
    module.exports.delete_resources = (req, res, next) => {
        var db = admin.firestore();
        var id = req.params.id;
        var filelink = "";
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
                    message: "resources deleted successfully",
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
