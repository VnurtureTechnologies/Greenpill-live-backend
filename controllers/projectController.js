const admin = require('firebase-admin');
const helpers = require('../helpers');


module.exports.add_project = async (req, res) => {
    var db = admin.firestore();
    var notifier = "project notification";
    var notifier_title = req.body.title;
    var notifier_description = req.body.short_description;

    await helpers.getfolderName('projects')

    var data = {
        createdAt: Date.now().toString(),
        title: req.body.title,
        longDesc: req.body.long_description,
        shortDesc: req.body.short_description,
        productRef: req.body.product_id,
        images: [await helpers.uploadImage(req.file)]
    }

    await db.collection('project')
        .add(data)
        .then(async (r) => {
            const notifidata = {
                title: req.body.title,
                category: "Project",
                refId: r.id,
                userId: "all",
                timestamp: Date.now().toString(),
            }
            await db.collection('notifications').add(notifidata)
                .then((result) => { }).catch((err) => { console.log(err) })
            helpers.sendGenericNotification(notifier, notifier_title, notifier_description, r.id);
            res.json({
                status: true,
                status_code: 200,
                message: "Project Added Successfully",
                redirect: "/projects"
            })
        })
        .catch((err) => {
            res.json({
                status: false,
                status_code: 501,
                message: "Something Went Wrong",
                redirect: "/projects/add"
            })
        })
}

function response(res, project_list) {

    sorted_projectList = project_list.sort((a, b) => {
        return b.created_at - a.created_at
    })

    res.json({
        status: true,
        status_code: 201,
        data: sorted_projectList,
        message: "Project List Fetched Successfully"
    })
}

module.exports.get_projects_list = async (req, res) => {
    var db = admin.firestore();
    var project_list = [];

    await db.collection('project')
        .get()
        .then((outerResult) => {
            outerResult.forEach(async (result) => {
                await db.collection('product').doc(result.data().productRef)
                    .get()
                    .then(async (innerResult) => {
                        const x = innerResult.data().title;
                        var row = {
                            "id": result.id,
                            "title": result.data().title,
                            "long_description": result.data().longDesc,
                            "short_description": result.data().shortDesc,
                            "product": x,
                            "created_at": result.data().createdAt,
                            "get_action_button": get_action_button(req, res, result)
                        };
                        project_list.push(row)
                    })
            })
            setTimeout(response, 1000, res, project_list);
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
    html += '<a class="dt_edit" href="/projects/edit/' + data.id + '" data-toggle="tooltip" title="Edit!"><i class="fa fa-pencil"></i></a>';
    html += '<a class="dt_del delete" href="javascript:void(0);" data-toggle="tooltip" title="Delete!" data-action="trash" data-id="' + data.id + '" ><i class="fa fa-trash"></i></a>';
    html += '</span';
    return html;
}

module.exports.get_projects_data = function (project_id, callback) {
    var db = admin.firestore();

    db.collection('project').doc(`${project_id}`)
        .get()
        .then((r) => {
            const data = {
                id: r.id,
                title: r.data().title,
                long_description: r.data().longDesc,
                productRef: r.data().productRef,
                short_description: r.data().shortDesc,
                image_url: r.data().images[0]
            }
            callback(data);
        })
        .catch((err) => {
            callback([]);
        })
}

module.exports.edit_project = async (req, res, next) => {
    var db = admin.firestore();
    var id = req.params.id;
    var update_data = "";
    var filelink = "";
    await helpers.getfolderName('projects');

    if (req.file) {
        db.collection("project").doc(`${id}`).get().then(async (r) => {
            let splitted_file_link = r.data().images[0].split('%2F')[1].split("?")
            const data = {
                filelink1: splitted_file_link[0]
            }
            filelink = data.filelink1
            await helpers.deleteImage(filelink)
        })
            .catch((err) => {
                console.log(err);
            });

        update_data = {
            'title': req.body.project_title,
            'longDesc': req.body.long_description,
            'shortDesc': req.body.short_description,
            'productRef': req.body.product_id,
            'images': [await helpers.uploadImage(req.file)]
        }
    }
    else {
        update_data = {
            'title': req.body.project_title,
            'longDesc': req.body.long_description,
            'shortDesc': req.body.short_description,
            'productRef': req.body.product_id
        }
    }

    db.collection('project').doc(`${id}`).update(update_data)
        .then((r) => {
            res.json({
                status: true,
                status_code: 200,
                message: "Project Edited Successfully",
                redirect: '/projects'
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

module.exports.delete_project = async (req, res, next) => {
    var db = admin.firestore();
    var id = req.params.id;
    await helpers.getfolderName('projects');
    var filelink = "";

    db.collection("project")
        .doc(`${id}`)
        .get()
        .then(async (r) => {
            let splitted_file_link = r.data().images[0].split('%2F')[1].split("?")
            const data = {
                filelink1: splitted_file_link[0]
            }
            filelink = data.filelink1
            await helpers.deleteImage(filelink)
        })
        .catch((err) => {
            console.log(err);
        });

    db.collection('project').doc(`${id}`).delete()
        .then((r) => {
            res.json({
                status: true,
                status_code: 200,
                message: "Project Deleted Successfully",
                redirect: "/projects"
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
