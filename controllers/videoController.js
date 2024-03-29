const admin = require("firebase-admin");
const fs = require("fs");
const helpers = require("../helpers");

module.exports.add_video = async (req, res, next) => {
  var db = admin.firestore();
  await helpers.getfolderName('videoGallery')
  var notifier = "video notification";
  var notifier_title = req.body.title;
  var notifier_description = 'New Video Published. click here... ';

  var today = new Date();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June",
    "July", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const mon = monthNames[today.getMonth()];
  const date = today.getDate();
  const year = today.getFullYear();
  const today1 = mon + ' ' + date + ' ' + year;
  const data = {
    createdAt: today1,
    link: req.body.link,
    timestamp: Date.now().toString(),
    title: req.body.title,
  };
  db.collection("videoGallery")
    .add(data)
    .then(async (result) => {
      const notifidata = {
        title: req.body.title,
        category: "Video",
        refId: result.id,
        userId: "all",
        timestamp: Date.now().toString(),
      }
      await db.collection('notifications').add(notifidata)
        .then((result) => { }).catch((err) => { console.log(err) })

      helpers.sendGenericNotification(notifier, notifier_title, notifier_description, result.id);

      res.json({
        status: true,
        status_code: 200,
        message: "Video Added Successfully",
        redirect: "/video/list"
      });
    })
    .catch((err) => {
      res.json({
        status: false,
        status_code: 501,
        error: err,
        message: "Something Went Wrong",
      });
    });
};


function response(res, news_list) {

  sorted_newsList = news_list.sort((a, b) => {
    return b.created_at - a.created_at
  })

  res.json({
    status: true,
    status_code: 201,
    data: sorted_newsList,
    message: "list fetched successfully"
  })
}


module.exports.get_video_list = (req, res) => {
  var db = admin.firestore();
  var video_list = [];

  db.collection("videoGallery")
    .get()
    .then((results) => {
      results.forEach((r) => {
        var row = {
          id: r.id,
          title: r.data().title,
          createdAt: r.data().createdAt,
          get_link: get_link(r.data().link),
          get_action_button: get_action_button(req, res, r),
          created_at: r.data().timestamp,
        };
        video_list.push(row);
      });

      setTimeout(response, 1000, res, video_list);
    })
    .catch((err) => {
      res.json({
        status: false,
        status_code: 501,
        message: "Internal Server Error",
      });
    });
};

function get_link(data) {
  var html = "";
  html += '<span class="action_tools">';
  html +=
    '<a class="dt_edit" href="' + data + '" data-toggle="tooltip" title="Edit!" target="_blank" >Video link...</a>';
  html += "</span";
  return html;
}

function get_action_button(req, res, data) {
  var html = "";
  html += '<span class="action_tools">';
  html +=
    '<a class="dt_edit" href="/video/edit/' +
    data.id +
    '" data-toggle="tooltip" title="Edit!"><i class="fa fa-pencil"></i></a>';
  html +=
    '<a class="dt_del delete" href="javascript:void(0);" data-toggle="tooltip" title="Delete!" data-action="trash" data-id="' +
    data.id +
    '" ><i class="fa fa-trash"></i></a>';
  html += "</span";
  return html;
}

module.exports.get_video_data = function (video_id, callback) {
  var db = admin.firestore();

  db.collection("videoGallery")
    .doc(`${video_id}`)
    .get()
    .then((r) => {
      const data = {
        id: r.id,
        title: r.data().title,
        createdAt: r.data().createdAt,
        link: r.data().link
      };
      callback(data);
    })
    .catch((err) => {
      callback([]);
    });
};

module.exports.edit_video = async (req, res, next) => {

  var db = admin.firestore();
  var id = req.params.id;
  var update_data = "";

  update_data = {
    'title': req.body.title,
    'createdAt': req.body.createdAt,
    'link': req.body.link
  };

  db.collection("videoGallery")
    .doc(`${id}`)
    .update(update_data)
    .then((r) => {
      res.json({
        status: true,
        status_code: 200,
        message: "video Data Edited Successfully",
        redirect: "/video/list"
      });
    })
    .catch((err) => {
      res.json({
        status: false,
        status_code: 501,
        message: "Internal server error",
      });
    });
};

module.exports.delete_video = async (req, res, next) => {
  var db = admin.firestore();
  var id = req.params.id;

  db.collection('videoGallery').doc(`${id}`).delete()
    .then((r) => {
      res.json({
        status: true,
        status_code: 200,
        message: "Video Deleted Successfully",
        redirect: "/video/list"
      })
    })
    .catch((err) => {
      res.json({
        status: false,
        status_code: 501,
        message: "Internal server error",
      })
    })
};
