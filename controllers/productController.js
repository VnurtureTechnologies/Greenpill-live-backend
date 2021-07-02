const admin = require('firebase-admin');
const fs = require('fs');
const helpers = require('../helpers');

module.exports.add_product = async(req,res,next) => {
    var db = admin.firestore();

    const data = {
        title : req.body.product_title,
        type: req.body.type,
        image_url: await helpers.uploadImage(req.file)
    }
    
    db.collection('product').add(data)
    .then( (result) => {
        res.json({
            status: true,
            status_code: 200,
            message: "Product added successfully",
            redirect: '/dashboard'
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


module.exports.get_products_list = (req,res) => {
    var db = admin.firestore();
    var products_list = [];

    db.collection('product')
    .get()
    .then( (results) => {
        results.forEach( (r) => {
            db.collection('project').where(`productRef`, '==', `${r.id}`)
            .get()
            .then((result) => {
                var row = {
                    "id": r.id,
                    "title" : r.data().title,
                    "type" : r.data().type,
                    "no_of_projects": result._size,
                    "get_action_button": get_action_button(req,res,r)
                };
                products_list.push(row)
            })
        })

        setTimeout(function() {var output = {
            data: products_list
        }
        res.json(output)},1000);
    })
    .catch ( (err) => {
        console.log(err);
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
    html += '<a class="dt_edit" href="/products/edit/' + data.id + '" data-toggle="tooltip" title="Edit!"><i class="fa fa-pencil"></i></a>';
    html += '<a class="dt_del delete" href="javascript:void(0);" data-toggle="tooltip" title="Delete!" data-action="trash" data-id="' + data.id + '" ><i class="fa fa-trash"></i></a>';
    html += '</span';
    return html;
}

module.exports.get_products_data = function(product_id,callback) {
    var db = admin.firestore();

    db.collection('product').doc(`${product_id}`)
    .get()
    .then( (r) => {
        const data = {
            id: r.id,
            title: r.data().title,
            type: r.data().type,
            image_url: r.data().image_url
        }
        callback(data);
    })
    .catch( (err) => {
        callback([]);
    })
}

module.exports.get_products_id = function(callback) {
    var db = admin.firestore();
    const products_data = [];
    db.collection('product')
    .get()
    .then( (results) => {
        results.docs.forEach( (r) => {
            data = {
                id: r.id,
                title: r.data().title
            }
            products_data.push(data);
        })
        callback(products_data);
    })
    .catch( (err) => {
        callback([]);
    })
}

module.exports.get_products_where_type_product = function(callback) {
    var db = admin.firestore();
    const product_data = [];
    db.collection('product')
    .where('type', '==', 'product' )
    .get()
    .then((results) => {
        results.docs.forEach( (r) => {
            data = {
                id: r.id,
                title: r.data().title
            }
            product_data.push(data);
        })
        callback(product_data);
    })
    .catch((err) => {
        callback([]);
    })
}

module.exports.edit_product = async(req,res,next) => {
    var db = admin.firestore();
    var id = req.params.id;
    var update_data = {
        'title': req.body.product_title,
        'type': req.body.product_type,
        'image_url': await helpers.uploadImage(req.file),
    }

    db.collection('product').doc(`${id}`).update(update_data)
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