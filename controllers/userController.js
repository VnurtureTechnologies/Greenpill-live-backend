const admin = require('firebase-admin');

module.exports.add_users = async(req,res,next) => {
    var db = admin.firestore();

    const data = {
        firstName : req.body.user_firstname,
        lastName : req.body.user_lastname,
        mobileNumber : req.body.user_mobilenumber,
        role : req.body.user_role,
        companyName : req.body.user_companyname,
    }
    
    db.collection('users').add(data)
    .then( (result) => {
        res.json({
            status: true,
            status_code: 200,
            message: "User added successfully",
            redirect:"/users/add"
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



module.exports.get_all_users_list = (req,res,next) => {
    var db = admin.firestore();
    var user_data = []
    db.collection('users')
    .get()
    .then( (results) => {
        results.forEach( (r) => {
            var row={
                "id":r.id,
                "firstName":r.data().firstName,
                "lastName":r.data().lastName,
                "mobileNumber":r.data().mobileNumber,
                "email":r.data().email,
                "role":r.data().role,
                "companyName":r.data().companyName,
                "get_action_button": get_action_button(req,res,r)
            }
            user_data.push(row)
        })
        var output = {
            data: user_data
        }
        res.json(output)
    })
    .catch( (err) => {
        res.json({
            status: false,
            status_code: 501,
            message: "Internal Server Error"
        })
    })
    .catch((err) => {
      res.json({
        status: false,
        status_code: 501,
        message: "Internal Server Error",
      });
    });
};

function get_action_button(req,res,data) {
    var html = '';
    html += '<span class="action_tools">';
    html += '<a class="dt_edit" href="/users/edit/' + data.id + '" data-toggle="tooltip" title="Edit!"><i class="fa fa-pencil"></i></a>';
    html += '<a class="dt_del delete" href="javascript:void(0);" data-toggle="tooltip" title="Delete!" data-action="delete" data-id="' + data.id + '" ><i class="fa fa-trash"></i></a>';
    html += '</span';
    return html;
}

module.exports.get_users_data = function(users_id,callback) {
    var db = admin.firestore();

    db.collection('users').doc(`${users_id}`)
    .get()
    .then( (r) => {
        const data = {
            id:r.id,
            firstName:r.data().firstName,
            lastName:r.data().lastName,
            mobileNumber:r.data().mobileNumber,
            role:r.data().role,
            companyName:r.data().companyName,
                
        }
        callback(data);
    })
    .catch( (err) => {
        callback([]);
    })
}



/* 
    Function to get count of all the users in the 
    firestore database
*/
module.exports.get_all_users_count = function (callback) {
  var db = admin.firestore();

  db.collection("users")
    .get()
    .then((results) => {
      callback(results._size);
    })
    .catch((err) => {
      callback([]);
    });
};

/* 
    Function to get count of all the products in the 
    firestore database
*/
module.exports.get_all_products_count = function (callback) {
  var db = admin.firestore();

  db.collection("product")
    .get()
    .then((results) => {
      callback(results._size);
    })
    .catch((err) => {
      callback([]);
    });
};

/* 
    Function to get count of all the projects in the 
    firestore database
*/
module.exports.get_all_projects_count = function (callback) {
  var db = admin.firestore();

  db.collection("project")
    .get()
    .then((results) => {
      callback(results._size);
    })

    .catch((err) => {
        callback([]);
      });
};

module.exports.edit_user = (req,res,next) => {
    var db = admin.firestore();
    var id = req.params.id;
    var update_data = ""
    if(req.body.role!=""){
      update_data = {
        'firstName' : req.body.firstName,
        'lastName' : req.body.lastName,
        'mobileNumber' : req.body.mobileNumber,
        'role' : req.body.role,
        'companyName' : req.body.companyName,
    }
    }else{update_data = {
      'firstName' : req.body.firstName,
      'lastName' : req.body.lastName,
      'mobileNumber' : req.body.mobileNumber,
      'companyName' : req.body.companyName,
  }}
    
    
    
    db.collection('users').doc(`${id}`).update(update_data)
    .then( (r) => {
        res.json({
            status: true,
            status_code: 200,
            message: "user edited successfully",
            redirect:"/user-list"
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

module.exports.delete_user = (req,res,next) => {
    var db = admin.firestore();
    var id = req.params.id;
    
    db.collection('users').doc(`${id}`).delete()
    .then( (r) => {
        res.json({
            status: true,
            status_code: 200,
            message: "user deleted successfully",
            redirect:"/user-list"
        })
    })
    .catch( (err) => {
        res.json({
            status: false,
            status_code: 501,
            message: "Internal server error",
        })
    })
}

module.exports.add_admin = async (req, res, next) => {
  var db = admin.firestore();

  const data = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  };
  const salt = await bcrypt.genSalt(10);
  data.password=await bcrypt.hash(data.password, salt);

  const users = await db
    .collection("admin")
    .where("email", "==", data.email)
    .get()
    .then((results) => {
      if (results.size == 0) {
        db.collection("admin")
          .add(data)
          .then((result) => {
            res.render("register/index", {
              status: true,
              status_code: 200,
              message: "Admin added auccessfully",
            });
          })
          .catch((err) => {
            res.render("register/index", {
              status: false,
              status_code: 501,
              error: err,
              message: "Something went wrong",
            });
          });
      } else {
        res.render("register/index", {
          status: true,
          status_code: 200,
          message: "Already Exist",
        });
      }
    });
};
