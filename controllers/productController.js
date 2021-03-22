const admin = require('firebase-admin');
const fs = require('fs');
const helpers = require('../helpers');

module.exports.add_product = (req,res,next) => {
    var db = admin.firestore();
    var storage = admin.storage().bucket('gs://greenpill-live.appspot.com');
    const data = {
        title : req.body.product_title,
        description : req.body.product_description,
        image_url: null
    }
    
    // storage.upload('../uploads/product_image.png')
    // .then( (r) =>{
    //     console.log("image uploaded");
    // })

    db.collection('product').add(data)
    .then( (result) => {
        // fs.unlink('../uploads/product_image.png', (err) => {
        //     if(err) {
        //         console.log(err);
        //     }
        // })
        res.json({
            status: true,
            status_code: 200,
            message: "Product added successfully"
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

// async function do_add_product_image(req,res) {
//     var file_keys = Object.keys(req.files);
//     console.log(file_keys);

//     for (let key of file_keys) {
//         const aman = await helpers.uploadImage(req.files[key][0])
//         console.log(aman);
//     }
// }

module.exports.get_products_list = (req,res,next) => {
    var db = admin.firestore();
    var products_list = [];

    db.collection('product')
    .get()
    .then( (results) => {
        results.forEach( (r) => {
            var row = {
                "title" : r.data().title,
                "description" : r.data().description,
                "get_action_button": get_action_button(req,res,r)
            };
            products_list.push(row)
        })
        
        var output = {
            data: products_list
        }
        res.json(output)
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
            description: r.data().description
        }
        callback(data);
    })
    .catch( (err) => {
        callback([]);
    })
}

module.exports.edit_product = (req,res,next) => {
    var db = admin.firestore();
    var id = req.params.id;
    var update_data = {
        'title': req.body.product_title,
        'description': req.body.product_description
    }
    console.log(update_data)
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