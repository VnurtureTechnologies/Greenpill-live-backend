const admin = require('firebase-admin');

module.exports.get_all_partnerp_list = (req,res,next) => {
    var db = admin.firestore();
    var partnerp_data = []
    db.collection('partnerPrograms')
    .get()
    .then( (results) => {
        results.forEach( (r) => {
            var row={
                "id":r.id,
                "name":r.data().name,
                "phone":r.data().phone,
                "email":r.data().email,
                "subject":r.data().subject,
                "message":r.data().message,
                "get_action_button": get_action_button(req,res,r)
            }
            partnerp_data.push(row)
        })
        var output = {
            data: partnerp_data
        }
        res.json(output)
    })
    .catch( (err) => {
        res.json({
            status: false,
            status_code: 501,
            message: "Internal Server Error"
        })
    })
};

function get_action_button(req,res,data) {
    var html = '';
    html += '<span class="action_tools">';
    html += '<a class="dt_del delete" href="javascript:void(0);" data-toggle="tooltip" title="Delete!" data-action="delete" data-id="' + data.id + '" ><i class="fa fa-trash"></i></a>';
    html += '</span';
    return html;
}

module.exports.delete_partnerp = (req,res,next) => {
    var db = admin.firestore();
    var id = req.params.id;
    
    db.collection('partnerPrograms').doc(`${id}`).delete()
    .then( (r) => {
        res.json({
            status: true,
            status_code: 200,
            message: "Program deleted successfully",
            redirect:"/partnerp-list"
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