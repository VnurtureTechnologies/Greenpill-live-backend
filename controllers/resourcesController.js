const admin = require('firebase-admin');

module.exports.add_resources = async(req,res,next) => {
    var db = admin.firestore();

    const data = {
        title : req.body.title,
        description: req.body.description,
        pdfUrl: req.body.pdfUrl,
        createdAt: Date.now(),
    }

    db.collection('resources').add(data)
    .then( (result) => {
        res.json({
            status: true,
            status_code: 200,
            message: "Resource added successfully",
            redirect: '/resources-list'
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

module.exports.get_resources_list = async(req,res) => {
    var db = admin.firestore();
    var resources_list = [];

    await db.collection('resources')
    .get()
    .then( (result) => {
        result.forEach(r => {
            var row = {
                "id": r.id,
                "title" : r.data().title,
                "description": r.data().description,
                "get_download_button": get_download_button(r.data().pdfUrl),
                "get_action_button": get_action_button(req,res,r)
            };
            resources_list.push(row)
        })
        res.json({
            status: true,
            status_code: 201,
            data: resources_list,
            message: "Resources fetched successfully"
        })
    })
    .catch( (err) => {
        console.log(err);
        res.json({
            status: false,
            status_code: 501,
            message: "Something went wrong"
        })
    })
}


module.exports.edit_resources = (req,res,next) => {
    var db = admin.firestore();
    var id = req.params.id;
    var update_data = {
        'title': req.body.title,
        'description': req.body.description,
        "pdfUrl": req.body.pdfUrl,
    }
    db.collection('resources').doc(`${id}`).update(update_data)
    .then( (r) => {
        res.json({
            status: true,
            status_code: 200,
            message: "Resources edited successfully",
            redirect: "/resources-list"
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
    html += '<a class="dt_edit" href="/resources/edit/' + data.id + '" data-toggle="tooltip" title="Edit!"><i class="fa fa-pencil"></i></a>';
    html += '<a class="dt_del delete" href="javascript:void(0);" data-toggle="tooltip" title="Delete!" data-action="trash" data-id="' + data.id + '" ><i class="fa fa-trash"></i></a>';
    html += '</span';
    return html;
}

function get_download_button(data) {
    var html = '';
    html += '<span class="action_tools">';
    html += '<a class="dt_edit" href="' + data+ '" target="_blank" data-toggle="tooltip" title="Download!"><i class="fa fa-download"></i></a>';
    html += '</span';
    return html;
}


module.exports.get_resources_data = function(resources_id,callback) {
    var db = admin.firestore();

    db.collection('resources').doc(`${resources_id}`)
    .get()
    .then( (r) => {
        const data = {
            id: r.id,
            title: r.data().title,
            description: r.data().description,
            pdfUrl: r.data().pdfUrl,
        }
        callback(data);
    })
    .catch( (err) => {
        callback([]);
    })
}
module.exports.delete_resources = (req,res,next) => {
    var db = admin.firestore();
    var id = req.params.id;
    
    db.collection('resources').doc(`${id}`).delete()
    .then( (r) => {
        res.json({
            status: true,
            status_code: 200,
            message: "resources deleted successfully",
            redirect:"/resources-list"
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
