const admin = require('firebase-admin');

module.exports.get_all_users_list = (req,res,next) => {
    var db = admin.firestore();
    var user_data = []
    db.collection('users')
    .get()
    .then( (results) => {
        results.forEach( (r) => {
            user_data.push(r.data())
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
}

/* 
    Function to get count of all the users in the 
    firestore database
*/
module.exports.get_all_users_count = function(callback) {
    var db = admin.firestore();
    
    db.collection('users')
    .get()
    .then( (results) => {
        callback(results._size);
    })
    .catch( (err) => {
        callback([])
    })
}

/* 
    Function to get count of all the products in the 
    firestore database
*/
module.exports.get_all_products_count = function(callback) {
    var db = admin.firestore();
    
    db.collection('product')
    .get()
    .then( (results) => {
        callback(results._size);
    })
    .catch( (err) => {
        callback([])
    })
}

/* 
    Function to get count of all the projects in the 
    firestore database
*/
module.exports.get_all_projects_count = function(callback) {
    var db = admin.firestore();
    
    db.collection('project')
    .get()
    .then( (results) => {
        callback(results._size);
    })
    .catch( (err) => {
        callback([])
    })
}