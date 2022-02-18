const admin = require('firebase-admin');
const helpers = require('../helpers');


module.exports.add_offer = async (req, res) => {
    var db = admin.firestore();
    await helpers.getfolderName('offer')

    var data = {
        title: req.body.title,
        description: req.body.description,
        start_date: new Date(req.body.start_date),
        end_date: new Date(req.body.end_date),
        category: req.body.category,
        is_paid: (req.body.is_paid == 'true'),
        amount: req.body.is_paid == 'true' ? req.body.amount : 0,
    }

    if (req.files.banner_image && req.files.banner_image[0].fieldname == "banner_image") {
        const imageUrl = await helpers.uploadImage(req.files.banner_image[0]);
        data['banner_img'] = imageUrl;
    }

    if (req.files.detail_image && req.files.detail_image[0].fieldname == "detail_image") {
        const imageUrl = await helpers.uploadImage(req.files.detail_image[0]);
        data['detail_img'] = imageUrl;
    }

    await db.collection('offer')
        .add(data)
        .then((r) => {
            res.json({
                status: true,
                status_code: 200,
                message: "Offer Added Successfully",
                redirect: "/offers-list"
            })
        })
        .catch((err) => {
            res.json({
                status: false,
                status_code: 501,
                message: "Something Went Wrong",
                redirect: "/offers/add"
            })
        })
}

function response(res, list) {

    sorted_List = list.sort((a, b) => {
        return b.created_at - a.created_at
    })

    res.json({
        status: true,
        status_code: 201,
        data: sorted_List,
        message: "List Fetched Successfully"
    })
}

module.exports.get_offer_list = async (req, res) => {
    var db = admin.firestore();
    var offer_list = [];

    await db.collection('offer')
        .get()
        .then((offers) => {
            offers.forEach(async (offer) => {
                var row = {
                    "id": offer.id,
                    "title": offer.data().title,
                    "category": offer.data().category,
                    "amount": offer.data().amount,
                    "description": offer.data().description,
                    "start_date": offer.data().start_date.toDate().toISOString().split("T")[0].split('-').reverse().join('-'),
                    "end_date": offer.data().end_date.toDate().toISOString().split("T")[0].split('-').reverse().join('-'),
                    "is_paid": offer.data().is_paid,
                    "created_at": offer.createTime.seconds,
                    "get_action_button": get_action_button(req, res, offer),
                };
                offer_list.push(row)
            })
            setTimeout(response, 1000, res, offer_list);
        })
        .catch((err) => {
            res.json({
                status: false,
                status_code: 501,
                message: "Something Went Wrong"
            })
        })
}

module.exports.get_booked_offer_list = async (req, res) => {
    var db = admin.firestore();
    var booked_offer_list = [];

    await db.collection('booked_offer')
        .get()
        .then((booked_offers) => {
            booked_offers.forEach(async (booked_offer) => {
                await db.collection('users').doc(booked_offer.data().user_id)
                    .get()
                    .then(async (users) => {
                        var row = {

                            "id": booked_offer.id,
                            "user_name": users.data().firstName,
                            "user_contact": users.data().mobileNumber,
                            "date": booked_offer.data().date,
                            "offer_id": booked_offer.data().offer_id,
                            "offer_title": booked_offer.data().offer_title,
                            "amount": booked_offer.data().amount == '0' ? 'Free' : booked_offer.data().amount,
                            "created_at": booked_offer.data().timestamp,
                        };
                        booked_offer_list.push(row)
                    })
            })
            setTimeout(response, 1000, res, booked_offer_list);
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
    html += '<a class="dt_edit" href="/offer/edit/' + data.id + '" data-toggle="tooltip" title="Edit!"><i class="fa fa-pencil"></i></a>';
    html += '<a class="dt_del delete" href="javascript:void(0);" data-toggle="tooltip" title="Delete!" data-action="trash" data-id="' + data.id + '" ><i class="fa fa-trash"></i></a>';
    html += '</span';
    return html;
}

module.exports.get_offer_data = function (id, callback) {
    var db = admin.firestore();

    db.collection('offer').doc(`${id}`)
        .get()
        .then((offer) => {
            const data = {
                "id": offer.id,
                "title": offer.data().title,
                "category": offer.data().category,
                "description": offer.data().description,
                "start_date": offer.data().start_date.toDate().toISOString().split("T")[0].split('-').join('-'),
                "end_date": offer.data().end_date.toDate().toISOString().split("T")[0].split('-').join('-'),
                "is_paid": offer.data().is_paid,
                "amount": offer.data().amount,
            }
            callback(data);
        })
        .catch((err) => {
            callback([]);
        })
}

module.exports.edit_offer = async (req, res, next) => {
    var db = admin.firestore();
    var id = req.params.id;
    await helpers.getfolderName('offer')

    var data = {
        title: req.body.title,
        description: req.body.description,
        start_date: new Date(req.body.start_date),
        end_date: new Date(req.body.end_date),
        category: req.body.category,
        is_paid: (req.body.is_paid == 'true'),
        amount: req.body.is_paid == 'true' ? req.body.amount : 0,
    }
    if (req.files) {
        await db.collection("offer").doc(`${id}`).get().then(async (r) => {

            if (req.files.banner_image && req.files.banner_image[0].fieldname == "banner_image") {
                helpers.deleteObject(r.data().banner_img)
                const imageUrl = await helpers.uploadImage(req.files.banner_image[0]);
                data['banner_img'] = imageUrl;
            }

            if (req.files.detail_image && req.files.detail_image[0].fieldname == "detail_image") {
                helpers.deleteObject(r.data().detail_img)
                const imageUrl = await helpers.uploadImage(req.files.detail_image[0]);
                data['detail_img'] = imageUrl;
            }

        })
            .catch((err) => {
                console.log(err);
            });
    }

    db.collection('offer').doc(`${id}`).update(data)
        .then((r) => {
            res.json({
                status: true,
                status_code: 200,
                message: "Offer Edited Successfully",
                redirect: '/offers-list'
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

module.exports.delete_offer = async (req, res, next) => {
    var db = admin.firestore();
    var id = req.params.id;

    await db.collection("offer")
        .doc(`${id}`)
        .get()
        .then(async (r) => {
            if (r.data().banner_img) {
                helpers.deleteObject(r.data().banner_img)
            }
            if (r.data().detail_img) {
                helpers.deleteObject(r.data().detail_img)
            }
        })
        .catch((err) => {
            console.log(err);
        });

    await db.collection('offer').doc(`${id}`).delete()
        .then((r) => {
            res.json({
                status: true,
                status_code: 200,
                message: "Offer Deleted Successfully",
                redirect: "/offers-list"
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
