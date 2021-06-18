const admin = require("firebase-admin");
const fs = require("fs");
const helpers = require("../helpers");

module.exports.add_whatsnew = async (req, res, next) => {
  var db = admin.firestore();

  const data = {
    title: req.body.title,
    description: req.body.description,
    type: req.body.type,
    sourceLink: req.body.sourcelink,
    img: await helpers.uploadImage(req.file),
  };
  console.log(data);
  db.collection("whatsnew")
    .add(data)
    .then((result) => {
      res.json({
        status: true,
        status_code: 200,
        message: "Idea added successfully",
        redirect: "/whatsnew/add",
      });
    })
    .catch((err) => {
      res.json({
        status: false,
        status_code: 501,
        error: err,
        message: "Something went wrong",
      });
    });
};

module.exports.get_whatsnew_list = (req, res) => {
  var db = admin.firestore();
  var whatsnew_list = [];

  db.collection("whatsnew")
    .get()
    .then((results) => {
      results.forEach((r) => {
        var row = {
          id: r.id,
          title: r.data().title,
          description: r.data().description,
          type: r.data().type,
          get_action_button: get_action_button(req, res, r),
        };
        whatsnew_list.push(row);
      });

      var output = {
        data: whatsnew_list,
      };
      res.json(output);
    })
    .catch((err) => {
      console.log(err);
      res.json({
        status: false,
        status_code: 501,
        message: "Internal Server Error",
      });
    });
};

function get_action_button(req, res, data) {
  var html = "";
  html += '<span class="action_tools">';
  html +=
    '<a class="dt_edit" href="/whatsnew/edit/' +
    data.id +
    '" data-toggle="tooltip" title="Edit!"><i class="fa fa-pencil"></i></a>';
  html +=
    '<a class="dt_del delete" href="javascript:void(0);" data-toggle="tooltip" title="Delete!" data-action="trash" data-id="' +
    data.id +
    '" ><i class="fa fa-trash"></i></a>';
  html += "</span";
  return html;
}

module.exports.get_whatsnew_data = function (whatsnew_id, callback) {
  var db = admin.firestore();

  db.collection("whatsnew")
    .doc(`${whatsnew_id}`)
    .get()
    .then((r) => {
      const data = {
        id: r.id,
        title: r.data().title,
        description: r.data().description,
        type: r.data().type,
        sourceLink: r.data().sourceLink,
        img: r.data().img,
      };
      callback(data);
    })
    .catch((err) => {
      callback([]);
    });
};

module.exports.edit_whatsnew = async (req, res, next) => {
  
  var db = admin.firestore();
  var id = req.params.id;
  var update_data = "";
  if (req.file) {
    update_data = {
      'title': req.body.title,
      'description': req.body.description,
      'type': req.body.type,
      'sourceLink': req.body.sourcelink,
      'img': await helpers.uploadImage(req.file)
    };
  } else {
    update_data = {
      'title': req.body.title,
      'description': req.body.description,
      'type': req.body.type,
      'sourceLink': req.body.sourcelink
    };
  }

  db.collection("whatsnew")
    .doc(`${id}`)
    .update(update_data)
    .then((r) => {
      res.json({
        status: true,
        status_code: 200,
        message: "Idea edited successfully",
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
