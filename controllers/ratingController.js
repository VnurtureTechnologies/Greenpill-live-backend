const admin = require('firebase-admin');
const helpers = require('../helpers');

function response(res, rating_list) {

    sorted_ratingList = rating_list.sort((a, b) => {
        return b.createdAt - a.createdAt
    })

    res.json({
        status: true,
        status_code: 201,
        data: sorted_ratingList,
        message: "Rating List Fetched Successfully"
    })
}

module.exports.get_rating_list = async (req, res) => {
    var db = admin.firestore();
    var rating_list = [];

    await db.collection('rating')
        .get()
        .then((ratings) => {
            ratings.forEach(async (rating) => {
                await db.collection("users").doc(rating.data().id)
                    .get()
                    .then(async (user) => {
                        var row = {
                            "id": rating.id,
                            "date": rating.data().date,
                            "name": user.data().name,
                            "rating": rating.data().rating,
                            "message": rating.data().message,
                            "get_action_button": get_action_button(req, res, rating),
                            "createdAt": rating.createTime.seconds
                        };
                        rating_list.push(row)
                    })

            })
            setTimeout(response, 1000, res, rating_list);

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
    // html += '<a class="dt_edit" href="/rating-list/edit/' + data.id + '" data-toggle="tooltip" title="Edit!"><i class="fa fa-pencil"></i></a>';
    html += '<a class="dt_del delete" href="javascript:void(0);" data-toggle="tooltip" title="Delete!" data-action="trash" data-id="' + data.id + '" ><i class="fa fa-trash"></i></a>';
    html += '</span';
    return html;
}

module.exports.delete_rating = async (req, res, next) => {
    var db = admin.firestore();

    await db.collection('rating').doc(`${req.params.id}`).delete()
        .then((r) => {
            res.json({
                status: true,
                status_code: 200,
                message: "Rating Deleted Successfully",
                redirect: "/rating-list"
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
