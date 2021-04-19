const admin = require('firebase-admin');

module.exports.get_projects_list = async(req,res) => {
    var db = admin.firestore();
    var project_list = [];

    await db.collection('project')
    .get()
    .then( (result) => {
        result.forEach(r => {
            var row = {
                "id": r.id,
                "title" : r.data().title,
                "work_scope" : r.data().workScope,
                "project_details": r.data().projectDetails,
                "get_action_button": get_action_button(req,res,r)
            };
            project_list.push(row)
        })
        res.json({
            status: true,
            status_code: 201,
            data: project_list,
            message: "Project list fetched successfully"
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


function get_action_button(req,res,data) {
    var html = '';
    html += '<span class="action_tools">';
    html += '<a class="dt_edit" href="/projects/edit/' + data.id + '" data-toggle="tooltip" title="Edit!"><i class="fa fa-pencil"></i></a>';
    html += '<a class="dt_del delete" href="javascript:void(0);" data-toggle="tooltip" title="Delete!" data-action="trash" data-id="' + data.id + '" ><i class="fa fa-trash"></i></a>';
    html += '</span';
    return html;
}

module.exports.get_projects_data = function(project_id,callback) {
    var db = admin.firestore();

    db.collection('project').doc(`${project_id}`)
    .get()
    .then( (r) => {
        const data = {
            id: r.id,
            title: r.data().title,
            projectDetails: r.data().projectDetails,
            workScope: r.data().workScope,
            image_url: r.data().imgUrl1
        }
        callback(data);
    })
    .catch( (err) => {
        callback([]);
    })
}

module.exports.edit_project = (req,res,next) => {
    var db = admin.firestore();
    var id = req.params.id;
    var update_data = {
        'title': req.body.project_title,
        'projectDetails': req.body.project_details,
        'workScope': req.body.work_scope
    }
    db.collection('project').doc(`${id}`).update(update_data)
    .then( (r) => {
        res.json({
            status: true,
            status_code: 200,
            message: "Product edited successfully"
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