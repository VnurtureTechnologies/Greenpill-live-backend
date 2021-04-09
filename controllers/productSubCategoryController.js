const admin = require('firebase-admin');
const fs = require('fs');
const helpers = require('../helpers');

module.exports.get_sub_products_list = (req,res) => {
    var db = admin.firestore();
    var subProducts_list = [];

    db.collection('productSubcategory')
    .get()
    .then( (results) => {
        results.forEach( r => {
            var row = {
                "id": r.id,
                "title" : r.data().title,
                "category": r.data().category,
                "short description" : r.data().shortDescription,
                "long description" : r.data().longDescription,
                "get_action_button": get_action_button(req,res,r)
            };
            subProducts_list.push(row)
        })

        var output = {
            data: subProducts_list
        }
        res.json(output)
    })
    .catch ( (err) => {
        res.json({
            status: false,
            status_code: 501,
            message: "Internal Server Error"
        })
    })
}


function get_action_button(req,res,data) {
    var html = '';
    html += '<span class="action_tools">';
    html += '<a class="dt_edit" href="/productSubCategory/edit/' + data.id + '" data-toggle="tooltip" title="Edit!"><i class="fa fa-pencil"></i></a>';
    html += '<a class="dt_del delete" href="javascript:void(0);" data-toggle="tooltip" title="Delete!" data-action="trash" data-id="' + data.id + '" ><i class="fa fa-trash"></i></a>';
    html += '</span';
    return html;
}

module.exports.get_subProducts_data = function(product_id,callback) {
    var db = admin.firestore();

    db.collection('productSubcategory').doc(`${product_id}`)
    .get()
    .then( (r) => {
        const data = {
            id: r.id,
            title: r.data().title,
            category: r.data().category,
            shortDescription: r.data().shortDescription,
            longDescription: r.data().longDescription,
            image_url: r.data().image_url
        }
        callback(data);
    })
    .catch( (err) => {
        callback([]);
    })
}

module.exports.edit_subProduct = (req,res,next) => {
    var db = admin.firestore();
    var id = req.params.id;
    var update_data = {
        'title': req.body.product_title,
        'category': req.body.category,
        'shortDescription': req.body.shortDescription,
        "longDescription": req.body.longDescription,
    }
    console.log(update_data)
    db.collection('productSubCategory').doc(`${id}`).update(update_data)
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
