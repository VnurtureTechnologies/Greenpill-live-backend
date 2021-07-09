const admin = require('firebase-admin');
const helpers = require('../helpers');

module.exports.add_news = async(req,res,next) => {
    var db = admin.firestore();

    const data = {
        title : req.body.title,
        description: req.body.description,
        productRef: `Product/${req.body.int_user_id}`,
        sourceLink: req.body.source_link,
        youtubeUrl: req.body.youtube_url,
        createdAt: Date.now(),
        image_url: await helpers.uploadImage(req.file)
    }

    db.collection('news_and_innovation').add(data)
    .then( (result) => {
        helpers.sendNewsNotification();
        res.json({
            status: true,
            status_code: 200,
            message: "Product added successfully",
            redirect: '/news'
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

module.exports.get_news_list = async(req,res) => {
    var db = admin.firestore();
    var news_list = [];

    await db.collection('news_and_innovation')
    .get()
    .then( (result) => {
        result.forEach(r => {
            var row = {
                "id": r.id,
                "title" : r.data().title,
                "description": r.data().description,
                "source link": r.data().sourceLink,
                "youtube url": r.data().youtubeUrl,
                "get_action_button": get_action_button(req,res,r)
            };
            news_list.push(row)
        })
        res.json({
            status: true,
            status_code: 201,
            data: news_list,
            message: "News list fetched successfully"
        })
    })
    .catch( (err) => {
        console.log(err);
        res.json({
            status: false,
            status_code: 501,
            message: "Something went wrong"
        })
    })
}


module.exports.edit_news = (req,res,next) => {
    var db = admin.firestore();
    var id = req.params.id;
    var update_data = {
        'title': req.body.product_title,
        'shortDescription': req.body.short_description,
        "longDescription": req.body.long_description,
        "pdfUrl": req.body.pdf_url,
        "webUrl": req.body.web_url
    }
    db.collection('news').doc(`${id}`).update(update_data)
    .then( (r) => {
        res.json({
            status: true,
            status_code: 200,
            message: "News edited successfully",
            redirect: "/news"
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

function get_action_button(req,res,data) {
    var html = '';
    html += '<span class="action_tools">';
    html += '<a class="dt_edit" href="/news/edit/' + data.id + '" data-toggle="tooltip" title="Edit!"><i class="fa fa-pencil"></i></a>';
    html += '<a class="dt_del delete" href="javascript:void(0);" data-toggle="tooltip" title="Delete!" data-action="trash" data-id="' + data.id + '" ><i class="fa fa-trash"></i></a>';
    html += '</span';
    return html;
}

module.exports.get_news_data = function(news_id,callback) {
    var db = admin.firestore();

    db.collection('news').doc(`${news_id}`)
    .get()
    .then( (r) => {
        const data = {
            id: r.id,
            title: r.data().title,
            shortDescription: r.data().shortDescription,
            longDescription: r.data().longDescription,
            pdfUrl: r.data().pdfUrl,
            webUrl: r.data().webUrl,
            image_url: r.data().image_url
        }
        callback(data);
    })
    .catch( (err) => {
        callback([]);
    })
}
