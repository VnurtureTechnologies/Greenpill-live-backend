const admin = require("firebase-admin");
const bcrypt = require("bcrypt");

module.exports.get_servicestaff_list = (req,res,next) => {
    var db = admin.firestore();
    var sericemen_data = []
    db.collection('serviceStaff')
    .get()
    .then( (results) => {
        results.forEach( (r) => {
            var row={
                "id":r.id,
                "fullname":r.data().fullname,
                "email":r.data().email,
                "mobile_no":r.data().mobile_no,
                "location": r.data().location,
                "speciality":r.data().speciality,
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
  var data
  if(Array.isArray(req.body.speciality)){
    data = {
      fullname: req.body.fullname,
      email: req.body.email,
      mobile_no: req.body.mobile_no,
      location: req.body.location,
      speciality: req.body.speciality,
      password: req.body.password,
    }; 
  }
  else{
    data = {
      fullname: req.body.fullname,
      email: req.body.email,
      mobile_no: req.body.mobile_no,
      location: req.body.location,
      speciality: [req.body.speciality],
      password: req.body.password,
    }; 
  }
  
  db.collection("serviceStaff")
    .add(data)
    .then((result) => {
      res.json({
        status: true,
        status_code: 200,
        redirect: '/servicestaff-list',
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
      message: "Staff List Fetched Successfully"
  })
}


module.exports.delete_serviceStaff = async (req, res, next) => {
  var db = admin.firestore();
  var id = req.params.id;

  db.collection('serviceStaff').doc(`${id}`).delete()
      .then((r) => {
          res.json({
              status: true,
              status_code: 200,
              message: "Staff Deleted Successfully",
              redirect: "/servicestaff-list"
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

module.exports.get_servicestaff_data = async function (id, callback) {
  var db = admin.firestore();
  var services_data = []

  await db.collection("bookingServices").get()
  .then((results) => {
      results.docs.forEach((r) => {
        services_data.push(r.data().title);
      })
  })
  .catch((err) => {
      console.log("err",err)
  });
  await db.collection("serviceStaff")
    .doc(`${id}`)
    .get()
    .then((r) => {
      const data = {
        id: r.id,
        email: r.data().email,
        fullname: r.data().fullname,
        location: r.data().location,
        mobile_no: r.data().mobile_no,
        password: r.data().password,
        speciality: r.data().speciality,
      };
      data["services"] = services_data.filter((id1) => !data.speciality.some((id2) => id2 === id1));
      console.log("data",data)
      callback(data);
    })
    .catch((err) => {
      callback([]);
    });
};

module.exports.edit_serviceStaff = async(req,res,next)=>{
  var db = admin.firestore();
  var id = req.params.id
  var update_data
  if(Array.isArray(req.body.speciality)){
    update_data = {
      'email':req.body.email,
      'fullname':req.body.fullname,
      'location':req.body.location,
      'mobile_no':req.body.mobile_no,
      'password':req.body.password,
      'speciality':req.body.speciality
    }
  }else{
    update_data = {
      'email':req.body.email,
      'fullname':req.body.fullname,
      'location':req.body.location,
      'mobile_no':req.body.mobile_no,
      'password':req.body.password,
      'speciality':[req.body.speciality]
    }
  }

  db.collection('serviceStaff').doc(`${id}`).update(update_data).then((r)=>{
    res.json({
      status:true,
      status_code:200,
      message:"Staff updated Successfully",
      redirect: "/servicestaff-list"
    })
  }).catch((err)=>{
    res.json({
      status:false,
      status_code:501,
      message:"Internal Server Error"
    })
  })
}
