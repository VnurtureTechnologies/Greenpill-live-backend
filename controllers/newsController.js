const admin = require('firebase-admin');
const helpers = require('../helpers');

module.exports.add_news = async (req, res, next) => {
    var db = admin.firestore();
    var notifier = "news notification";

    await helpers.getfolderName('news&innovation')
    const data = {
        title: req.body.title,
        description: req.body.description,
        productRef: req.body.int_user_id,
        sourceLink: req.body.source_link,
        youtubeUrl: req.body.youtube_url,
        createdAt: Date.now().toString(),
        images: [await helpers.uploadImage(req.file)]
    }

    db.collection('news_and_innovation').add(data)
        .then((result) => {
            helpers.sendGenericNotification(notifier);
            res.json({
                status: true,
                status_code: 200,
                message: "News added successfully",
                redirect: '/news'
            })
        })
        .catch((err) => {
            res.json({
                status: false,
                status_code: 501,
                error: err,
                message: "Something went wrong"
            })
        })
}

function response(res, news_list) {
    res.json({
        status: true,
        status_code: 201,
        data: news_list,
        message: "News list fetched successfully"
    })
}

module.exports.get_news_list = async (req, res) => {
    var db = admin.firestore();
    var news_list = [];

    await db.collection('news_and_innovation')
        .get()
        .then((result) => {
            result.forEach(async (r) => {
                await db.collection('product').doc(r.data().productRef)
                    .get()
                    .then(async (innerResult) => {
                        const x = innerResult.data().title;
                        var row = {
                            "id": r.id,
                            "title": r.data().title,
                            "description": r.data().description,
                            "source link": r.data().sourceLink,
                            "youtube url": r.data().youtubeUrl,
                            "product": x,
                            "get_action_button": get_action_button(req, res, r)
                        };
                        news_list.push(row)
                    })
            })
            setTimeout(response, 1000, res, news_list);
        })
        .catch((err) => {
            console.log(err);
            res.json({
                status: false,
                status_code: 501,
                message: "Something went wrong"
            })
        })
}


module.exports.edit_news = async (req, res, next) => {
    var db = admin.firestore();
    await helpers.getfolderName('news&innovation')
    var id = req.params.id;
    var update_data = '';

    if (req.file) {
        update_data = {
            'title': req.body.title,
            'description': req.body.description,
            'productRef': req.body.int_user_id,
            'sourceLink': req.body.source_link,
            'youtubeUrl': req.body.youtube_url,
            'images': [await helpers.uploadImage(req.file)]
        }
    } else {
        update_data = {
            'title': req.body.title,
            'description': req.body.description,
            'productRef': req.body.int_user_id,
            'sourceLink': req.body.source_link,
            'youtubeUrl': req.body.youtube_url,
        }
    }
    db.collection('news_and_innovation').doc(`${id}`).update(update_data)
        .then((r) => {
            res.json({
                status: true,
                status_code: 200,
                message: "News edited successfully",
                redirect: "/news"
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

function get_action_button(req, res, data) {
    var html = '';
    html += '<span class="action_tools">';
    html += '<a class="dt_edit" href="/news/edit/' + data.id + '" data-toggle="tooltip" title="Edit!"><i class="fa fa-pencil"></i></a>';
    html += '<a class="dt_del delete" href="javascript:void(0);" data-toggle="tooltip" title="Delete!" data-action="trash" data-id="' +
        data.id +
        '" ><i class="fa fa-trash"></i></a>';
    html += '</span';
    return html;
}

module.exports.get_news_data = function (news_id, callback) {
    var db = admin.firestore();

    db.collection('news_and_innovation').doc(`${news_id}`)
        .get()
        .then((r) => {
            const data = {
                id: r.id,
                title: r.data().title,
                description: r.data().description,
                productRef: r.data().productRef,
                sourceLink: r.data().sourceLink,
                youtubeUrl: r.data().youtubeUrl,
                image_url: r.data().images[0]
            }
            callback(data);
        })
        .catch((err) => {
            callback([]);
        })
}
module.exports.delete_news = async (req, res, next) => {
    var db = admin.firestore();
    var id = req.params.id;
    await helpers.getfolderName('news&innovation')
    var filelink = "";
    db.collection("news_and_innovation")
        .doc(`${id}`)
        .get()
        .then(async (r) => {
            const data = {
                filelink1: r.data().images[0]
            }
            filelink = data.filelink1
            await helpers.deleteImage(filelink)
        })
        .catch((err) => {
            console.log(err)
        });

    db.collection('news_and_innovation').doc(`${id}`).delete()
        .then((r) => {
            res.json({
                status: true,
                status_code: 200,
                message: "news deleted successfully",
                redirect: "/news"
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
