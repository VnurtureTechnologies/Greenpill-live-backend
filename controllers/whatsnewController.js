const admin = require("firebase-admin");
const fs = require("fs");
const helpers = require("../helpers");

module.exports.add_whatsnew = async (req, res, next) => {
  var db = admin.firestore();
  await helpers.getfolderName('whatsnew')
  const data = {
    title: req.body.title,
    description: req.body.description,
    type: req.body.type,
    sourceLink: req.body.sourcelink,
    createdAt: Date.now().toString(),
    img: await helpers.uploadImage(req.file)
  };
  db.collection("whatsnew")
    .add(data)
    .then((result) => {
      res.json({
        status: true,
        status_code: 200,
        message: "Idea Added Successfully",
        redirect: "/whatsnew/list"
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
    
  sorted_newsList = news_list.sort((a,b) => {
      return b.created_at - a.created_at
  })

  res.json({
      status: true,
      status_code: 201,
      data: sorted_newsList,
      message: "list fetched successfully"
  })
}


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
          show: get_checkbox_for_showing(r),
          created_at: r.data().createdAt,
          get_action_button: get_action_button(req, res, r),
        };
        whatsnew_list.push(row);
      });

      setTimeout(response, 1000, res, whatsnew_list);
    })
    .catch((err) => {
      res.json({
        status: false,
        status_code: 501,
        message: "Internal Server Error",
      });
    });
};

function get_checkbox_for_showing(r) {
  var html = "";

  if(r.data().show == true) {
    html += '<span style="margin-left: 20px">';
    // html += '<a href="/whatsnew/editShow">';
    html += '<input type="checkbox" id="show_check" checked data-id="' + r.id + '" />';
    // html += '</a>';
    html += "</span>"    
  } else {
    html += '<span style="margin-left: 20px">';
    // html += '<a href="/whatsnew/editShow">';
    html += '<input type="checkbox" id="show_check" data-id="' + r.id + '" />';
    // html += '</a>';
    html += "</span>"    
  }

  return html
}

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

module.exports.edit_trending_show = async(req, res, next) => {
  var db = admin.firestore();
  var id = req.params.id;
  var flag = req.params.flag;
  var data = "";

  if(flag == 'true') {
    data = {
      'show': true
    }
  } else if(flag == 'false') {
    data = {
      'show': false
    }
  }

  await db.collection('whatsnew').doc(`${id}`)
  .update(data)
  .then((r) => {
    res.send("Trending flag set successfully");
  })
  .catch((err) => {
    console.log(err);
  })
}

module.exports.edit_whatsnew = async (req, res, next) => {
  await helpers.getfolderName('whatsnew')
  var db = admin.firestore();
  var id = req.params.id;
  var update_data = "";
  if (req.file) {
    db.collection("whatsnew")
      .doc(`${id}`)
      .get()
      .then(async (r) => {
        const data = {
          filelink1: r.data().img
        }
        filelink = data.filelink1
        await helpers.deleteImage(filelink)
      })
      .catch((err) => {
        console.log("delete err", err)
      });

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
        message: "Idea Edited Successfully",
        redirect: "/whatsnew/list"
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

module.exports.delete_whatsnew = async (req, res, next) => {
  var db = admin.firestore();
  await helpers.getfolderName('whatsnew')
  var id = req.params.id;
  var filelink = "";
  db.collection("whatsnew")
    .doc(`${id}`)
    .get()
    .then(async (r) => {
      const data = {
        filelink1: r.data().img
      }
      filelink = data.filelink1
      await helpers.deleteImage(filelink)
    })
    .catch((err) => {
      console.log(err)
    });

  db.collection('whatsnew').doc(`${id}`).delete()
    .then((r) => {
      res.json({
        status: true,
        status_code: 200,
        message: "Idea Deleted Successfully",
        redirect: "/whatsnew/list"
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