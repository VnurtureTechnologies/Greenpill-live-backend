const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

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

module.exports.forgot_password = [ async(req,res,next) => {
    const db = admin.firestore();

    await db.collection('admin').where('email', '==', req.body.email)
        .get()
        .then((result) => {
        if(result._size == 0) {
            res.json({
                status: false,
                message: "This email is not registered, please try with a valid email",
                redirect: ('/')
            })
        }
        else {
            crypto.randomBytes(20, async(err,buf) => {
                var token = buf.toString('hex');

                var data = {
                    resetPasswordToken : token,
                    resetPasswordExpires : Date.now() + 1800000 
                }

                await db.collection('admin').doc(result.docs[0].id).update(data)
                .then((r) => {
                    var smtpTransport = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 587,
                        secure: false,
                        auth: {
                            type: 'OAuth2',
                            user: 'success20technology@gmail.com',                            
                            clientId: '337729940011-jcab50h6smm5fu0mj7h78j2jf4ru6e8b.apps.googleusercontent.com',
                            clientSecret: 'MzxSnrMqoKC_9cohy4XdwATs',
                            refreshToken: '1//04tc9VYtGfg3sCgYIARAAGAQSNwF-L9IrOgn6jtzyzhNdXo4NVR8YAhfij8sZjF_DhC_onnPF536igmjn87swNvPHkbxqJll42sw',
                            accessToken: 'ya29.a0ARrdaM_hBVWFmV6qr64cgPIhAqVUL1586Tn2zVHytOL58hU36KdFrMiJ6c7hw-CEsg-Hs7m4R8Vumd5juzdIz8lz_kKXDxZ7yu3CNMZ3_BKVxV3wQY_pIxV1lwgpE1RhBT9sbxXMzjTirZzo3gecyhvqmOKR'
                        }
                    });
                        
                    var mailOptions = {
                        from: "Greenpill Admin",
                        to: req.body.email,
                        subject: "Green pill password reset",
                        html: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                        'If you did not request this, please ignore this email and your password will remain unchanged.\n' +
                        'This link will expire in 30 minutes.\n'
                    };
                        
                    smtpTransport.sendMail(mailOptions, function (error, response) {
                        if (error) {
                            console.log(error);
                            res.json({
                                status: false,
                                message: error
                            });
                        } else {
                            res.json({
                                status: true,
                                message: 'Reset Password Link has been sent!, Please check your spam folder ...',
                                redirect: ('/')
                            });
                        }
                
                        smtpTransport.close();
                    });
                })
            })
        }
    })
}]

module.exports.change_password = [async(req,res,next) => {
    const db = admin.firestore();

    const data = {
        password : req.body.password
    }

    const salt = await bcrypt.genSalt(10);
    data.password=await bcrypt.hash(data.password, salt);

    await db.collection('admin').where('email', '==', req.body.email)
    .get()
    .then(async(r) => {
        if(r._size == 0) {
            res.json({
                status: true,
                message: 'Invalid email',
                redirect: ('/')
            });
        }
        else {
            await db.collection('admin').doc(r.docs[0].id).update(data)
            .then((r) => {
                res.json({
                    status: true,
                    message: 'Password changed successfully',
                    redirect: ('/')
                });
            })
        }
    })
}]