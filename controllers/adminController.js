const admin = require('firebase-admin');

module.exports.get_admin_users = async function(users_name,callback) {
    var db = admin.firestore();
    const admin_data = [];
    await db.collection('admin').where('email', '==', users_name)
    .get()
    .then( (r) => {
        r.docs.forEach( (r) => {
            data = {
                id: r.id,
                name: r.data().name,
                email: r.data().email,
            }
            admin_data.push(data);
        })
        callback(admin_data);
    })
    .catch( (err) => {
        callback([]);
    })
}
