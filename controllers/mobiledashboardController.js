const admin = require('firebase-admin');
const helpers = require('../helpers');

module.exports.update_image = async (req, res, next) => {
    var db = admin.firestore();
    if (req.body.type == 'product') {
        await helpers.getfolderName('product')
        id =req.body.producttype
        data = {
            imageUrl: await helpers.uploadImage(req.file)
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
    } else if(req.body.type == 'services'){
        await helpers.getfolderName('services/mainUI')
        id =req.body.servicestype
        db.collection("bookingServices").doc(`${id}`).get()
        .then(async (r) => {
            const data = {
            filelink1: r.data().image.split('%2F')[2].split('?')[0]
            }
            filelink = data.filelink1
            await helpers.deleteImage(filelink)
        })
        .catch((err) => {
            console.log("delete err", err)
        });

        data = {
            image: await helpers.uploadImage(req.file)
        }
        db.collection('bookingServices').doc(`${id}`).update(data)
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

    } else if(req.body.type == 'news'){
        await helpers.getfolderName('product')
        id =req.body.resourcetype
        data = {
            imageUrl: await helpers.uploadImage(req.file)
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
    }else {
        id =req.body.resourcetype
        data = {
            imageResource: await helpers.uploadImage(req.file)
        }
        await helpers.getfolderName('product')
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
}

module.exports.update_subui = async (req, res, next) => {
    var db = admin.firestore();
    var id;
    var data;
    if(req.body.type == 'services'){
        await helpers.getfolderName('services/subui')
        id = req.body.subservicetype

        if(req.files[0] && req.files[1]){
            db.collection("serviceDetails").doc(`${id}`).get()
            .then(async (r) => {
            const data = {
            filelink1: r.data().image.split('%2F')[2].split('?')[0],
            filelink2: r.data().pdfUrl.split('%2F')[3].split('?')[0]
            }
            await helpers.deleteImage(data.filelink1)
            await helpers.deletePdf(data.filelink2)
            })
            .catch((err) => {
                console.log("delete err", err)
            });
            data = {
                image: await helpers.uploadImage(req.files[1]),
                pdfUrl: await helpers.uploadImage(req.files[0]),
            }
        }
        else if(req.files[0]){
            if(req.files[0].mimetype == 'application/pdf'){
                db.collection("serviceDetails").doc(`${id}`).get()
                .then(async (r) => {
                const data = {
                filelink1: r.data().pdfUrl.split('%2F')[3].split('?')[0]
                }
                await helpers.deletePdf(data.filelink1)
                })
                .catch((err) => {
                    console.log("delete err", err)
                });
    
                data = {
                    pdfUrl: await helpers.uploadImage(req.files[0]),
                }
            }
            else{
                db.collection("serviceDetails").doc(`${id}`).get()
                .then(async (r) => {
                const data = {
                filelink1: r.data().image.split('%2F')[2].split('?')[0]
                }
                await helpers.deleteImage(data.filelink1)
                })
                .catch((err) => {
                    console.log("delete err", err)
                });
                data = {
                    image: await helpers.uploadImage(req.files[0]),
                }
            }   
        }else{
            res.json({
                status: false,
                status_code: 501,
                message: "nothing to update"
            })
        }

        db.collection('serviceDetails').doc(`${id}`).update(data)
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
    else{
        res.json({
            status: false,
            status_code: 501,
            message: "Internal server error"
        })
    }
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

module.exports.get_services = function (callback) {
    var db = admin.firestore();
    const services_data = [];
    db.collection('bookingServices')
        .get()
        .then((results) => {
            results.docs.forEach((r) => {
                data = {
                    id: r.id,
                    title: r.data().title
                }
                services_data.push(data);
            })
            callback(services_data);
        })
        .catch((err) => {
            callback([]);
        })
}

module.exports.get_sub_services = function (callback) {
    var db = admin.firestore();
    const subservices_data = [];
    db.collection('serviceDetails')
        .get()
        .then((results) => {
            results.docs.forEach((r) => {
                data = {
                    id: r.id,
                    title: r.data().title,
                    serviceRef:r.data().serviceRef
                }
                subservices_data.push(data);
            })
            callback(subservices_data);
        })
        .catch((err) => {
            callback([]);
        })
}
