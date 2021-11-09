const admin = require("firebase-admin");
const bcrypt = require("bcrypt");

module.exports.get_servicemen_list = (req,res,next) => {
  console.log("in service men")
    var db = admin.firestore();
    var sericemen_data = []
    db.collection('serviceMen')
    .get()
    .then( (results) => {
      console.log("r",results)
        results.forEach( (r) => {
            var row={
                "id":r.id,
                "fullname":r.data().fullname,
                "email":r.data().email,
                "mobile_no":r.data().mobile_no,
                "specialist":r.data().specialist,
                "location": r.data().location,
                "password": r.data().password,
                "get_action_button": get_action_button(req,res,r)
            }
            sericemen_data.push(row)
        })
        setTimeout(response, 1000, res, sericemen_data);
    })
    .catch( (err) => {
        res.json({
            status: false,
            status_code: 501,
            message: "Internal Server Error"
        })
    })
};

module.exports.add_serviceStaff = async (req, res, next) => {
  var db = admin.firestore();
  const data = {
    fullname: req.body.fullname,
    email: req.body.email,
    mobile_no: req.body.mobile_no,
    location: req.body.location,
    speciality: req.body.speciality,
    password: req.body.password,
  };

  db.collection("serviceStaff")
    .add(data)
    .then((result) => {
      res.json({
        status: true,
        status_code: 200,
        redirect: '/dashboard',
        message: "Service Staff Added Successfully",
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

function get_action_button(req, res, data) {
  var html = '';
  html += '<span class="action_tools">';
  html += '<a class="dt_edit" href="/servicestaff/edit/' + data.id + '" data-toggle="tooltip" title="Edit!"><i class="fa fa-pencil"></i></a>';
  html += '<a class="dt_del delete" href="javascript:void(0);" data-toggle="tooltip" title="Delete!" data-action="trash" data-id="' + data.id + '" ><i class="fa fa-trash"></i></a>';
  html += '</span';
  return html;
}

function response(res, resources_list) {

  sorted_resourcesList = resources_list.sort((a, b) => {
      return b.created_at - a.created_at
  })

  res.json({
      status: true,
      status_code: 201,
      data: sorted_resourcesList,
      message: "Resources List Fetched Successfully"
  })
}

