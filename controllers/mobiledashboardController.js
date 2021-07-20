const admin = require('firebase-admin');
const helpers = require('../helpers');

module.exports.update_image = async (req, res, next) => {
    var id = ''
    var db = admin.firestore();
    await helpers.getfolderName('product')
    var data = '';
    if (req.body.type == 'product') {

        id =req.body.producttype
        data = {
            imageUrl: await helpers.uploadImage(req.file)
        }
    } else if(req.body.type == 'news'){
        id =req.body.resourcetype
        data = {
            imageUrl: await helpers.uploadImage(req.file)
        }

    }else {
        id =req.body.resourcetype
        data = {
            imageResource: await helpers.uploadImage(req.file)
        }
    }
    db.collection('product').doc(`${id}`).update(data)
        .then((r) => {
            res.json({
                status: true,
                status_code: 200,
                message: "Image Added Successfully",
                redirect: "/dashboard"
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

module.exports.get_products_where_type_product = function (callback) {
    var db = admin.firestore();
    const product_data = [];
    db.collection('product')
        .where('type', '==', 'product')
        .get()
        .then((results) => {
            results.docs.forEach((r) => {
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

module.exports.get_products_where_type_newsresources = function (callback) {
    var db = admin.firestore();
    const product_data = [];
    db.collection('product')
        .where('type', '==', 'news & resources')
        .get()
        .then((results) => {
            results.docs.forEach((r) => {
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