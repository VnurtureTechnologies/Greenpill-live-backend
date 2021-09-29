const admin = require('firebase-admin');
const helpers = require('../helpers');

module.exports.add_news = async (req, res, next) => {
    var db = admin.firestore();
    var notifier = "news notification";
    var notifier_title = req.body.title;
    var notifier_description = req.body.description;

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
            helpers.sendGenericNotification(notifier, notifier_title, notifier_description);
            res.json({
                status: true,
                status_code: 200,
                message: "News Added Successfully",
                redirect: '/news'
            })
        })
        .catch((err) => {
            res.json({
                status: false,
                status_code: 501,
                error: err,
                message: "Something Went Wrong"
            })
        })
}

function response(res, news_list) {
    
    sorted_newsList = news_list.sort((a,b) => {
        return b.created_at - a.created_at
    })

    res.json({
        status: true,
        status_code: 201,
        data: sorted_newsList,
        message: "News List Fetched Successfully"
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
                            "created_at": r.data().createdAt,
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
                message: "Something Went Wrong"
            })
        })
}


module.exports.edit_news = async (req, res, next) => {
    var db = admin.firestore();
    await helpers.getfolderName('news&innovation')
    var id = req.params.id;
    var update_data = '';

    if (req.file) {

        db.collection("news_and_innovation").doc(`${id}`).get().then(async (r) => {
            let splitted_file_link = r.data().images[0].split('%2F')[1].split("?")
            const data = {
                filelink1: splitted_file_link[0]
            }
            filelink = data.filelink1
            await helpers.deleteImage(filelink)
        })
        .catch((err) => {
            console.log(err);
        });

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
                message: "News Edited Successfully",
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
            let splitted_file_link = r.data().images[0].split('%2F')[1].split("?")
            const data = {
                filelink1: splitted_file_link[0]
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
                message: "News Deleted Successfully",
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
