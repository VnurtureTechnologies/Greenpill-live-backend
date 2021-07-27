const express = require('express');
const hbs = require('hbs');
const path = require('path');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const multer = require('multer');
const session = require('express-session');
const serviceAccount = require("./greenpill-live-firebase-admin");
const flash = require('flash');
const ensureLogin = require('connect-ensure-login');
const passport = require('passport');

var app = express();

/* PASSPORT CONFIG */
passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(async (email, cb) => {
    var db = admin.firestore();
    await db.collection('admin').where('email', '==', email)
        .get()
        .then((r) => {
            r.forEach(rr => {
                if (rr.data().email == email) {
                    cb(null, email);
                }
            })
        })
});

/* Firebase configuration */
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `${process.env.firebase_database_url}`
})

var database = admin.firestore();
database.settings({ ignoreUndefinedProperties: true });

/* common header and footer */
hbs.registerPartials(__dirname + '/views/common');

app.set('view engine', 'html');
app.engine('html', hbs.__express);

app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'uploads')));

/* Bodyparser middleware */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.text());

/* SESSTION CONFIGURATION  */
app.use(session({
    secret: "Aman_V",
    resave: true,
    saveUninitialized: false
}))
app.use(passport.initialize())
require("./storage-config/passport_config")(passport);
app.use(flash());
app.use(passport.session());

/* MULTER CONFIG */
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
})

/* CONTROLLER MODULES IMPORTS */
const userController = require('./controllers/userController');
const productController = require('./controllers/productController');
const productSubCategoryController = require('./controllers/productSubCategoryController')
const projectController = require('./controllers/projectController');
const newsController = require('./controllers/newsController');
const notificationController = require('./controllers/notificationController');
const resourcesController = require('./controllers/resourcesController');
const whatsnewController = require('./controllers/whatsnewController');
const partnerpController = require('./controllers/partnerpController');
const greeniController = require('./controllers/greeniController');
const adminController = require('./controllers/adminController');
const videoController = require('./controllers/videoController');
const mobiledashboardController = require('./controllers/mobiledashboardController');


var data_user;

/* BASE ROUTE */
app.get('/', function (req, res) {
    res.render("login/index");
})

app.get('/register', ensureLogin.ensureLoggedIn(), function (req, res) {
    res.render("register/index");
})
app.post('/register', userController.add_admin)

app.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/',
    failureFlash: 'Invalid email or password'
}), (req, res) => {
    res.status(200).send("All is well")
})

app.get('/forgot-password', function(req, res) {
    res.render('login/forgot_pwd', { title: 'Forgot Password ' });
});

app.post('/forgot-password', adminController.forgot_password);

app.post('/change-password', adminController.change_password);

app.get('/reset/:token', async(req,res) => {
    var db = admin.firestore();

    await db.collection('admin').where('resetPasswordToken', '==', req.params.token)
    .get()
    .then((r) => {
        if(r._size == 0) {
            res.json({
                status: false,
                message: "Invalid token",
                redirect: ('/')
            })
        }
        else if (r.docs[0].data().resetPasswordExpires < Date.now()) {
            res.json({
                status: false,
                message: "The link has expired",
                redirect: ('/')
            })
        }
        else {
            res.render('login/reset_pwd', {title: 'Reset Password'})
        }
    })

})

app.get('/logout', ensureLogin.ensureLoggedIn(), (req, res) => {
    req.logout();
    res.redirect("/");
});

app.get('/login', (req, res) => {
    res.redirect("/");
});

/* DASHBOARD ROUTE */
app.get('/dashboard', ensureLogin.ensureLoggedIn(), function (req, res) {
    data_user = req.user
    var data = []
    userController.get_all_users_count(function (users) {
        data.push({ 'users_count': users })
        userController.get_all_projects_count(function (projects) {
            data.push({ 'projects_count': projects })
            userController.get_all_products_count(function (products) {
                data.push({ 'products_count': products })
                res.render("dashboard/index", {
                    total_users: data[0]['users_count'],
                    total_projects: data[1]['projects_count'],
                    total_products: data[2]['products_count'],
                })
            })
        })
    })
})

/*admin routes */
app.get('/admin', ensureLogin.ensureLoggedIn(), function (req, res) {
    var data = [];
    adminController.get_admin_users(data_user, function (users) {
        data.push({ 'users_data': users })
        res.render('admin/index', {
            title: 'Admin Profile',
            page_title: 'Profile',
            user: users[0]
        })
    })
})


/* USER ROUTE */
app.get('/users/add', ensureLogin.ensureLoggedIn(), function (req, res) {
    res.render('users/add', {
        title: 'Users',
        page_title: 'Add Users'
    })
})

app.get('/user-list', ensureLogin.ensureLoggedIn(), function (req, res) {
    res.render("users/index", {
        title: 'users',
        page_title: 'Users-list'
    })
});

app.get('/users/edit/:id', ensureLogin.ensureLoggedIn(), function (req, res) {
    var id = req.params.id;
    var data = [];

    userController.get_users_data(id, function (users) {
        data.push({ 'users_data': users })
        res.render('users/edit', {
            title: "User Edit",
            page_title: "Edit user",
            user: data[0]['users_data']
        })
    })
})

app.post('/user-list', upload.none(), userController.get_all_users_list);
app.post('/users/do_add', upload.none(), userController.add_users);
app.post('/users/do_edit/:id', upload.none(), userController.edit_user);
app.delete('/users-delete/:id', userController.delete_user);

/* PRODUCT ROUTEs */
app.get('/products/add', ensureLogin.ensureLoggedIn(), function (req, res) {
    res.render('products/add', {
        title: 'Products',
        page_title: 'Add products'
    })
})

app.get('/products', ensureLogin.ensureLoggedIn(), function (req, res) {
    res.render('products/index', {
        title: 'Products',
        page_title: 'Products-list'
    })
})

app.get('/products/edit/:id', ensureLogin.ensureLoggedIn(), function (req, res) {
    var id = req.params.id;
    var data = [];

    productController.get_products_data(id, function (products) {
        data.push({ 'products_data': products })
        res.render('products/edit', {
            title: "Products Edit",
            page_title: "Edit product",
            product: data[0]['products_data']
        })
    })
})

app.post('/product-list', upload.none(), productController.get_products_list);
app.post('/products/do_add', upload.single('product_image'), productController.add_product);
app.post('/products/do_edit/:id', upload.single('product_image'), productController.edit_product);

/* PROJECT ROUTES */
app.get('/projects/add', ensureLogin.ensureLoggedIn(), function (req, res) {
    var data = [];
    productController.get_products_where_type_product(function (products) {
        res.render('projects/add', {
            title: 'Projects',
            page_title: 'Add projects',
            products: products
        })
    })
})

app.get('/projects', ensureLogin.ensureLoggedIn(), (req, res) => {
    res.render('projects/index', {
        title: 'Projects',
        page_title: 'Projects list'
    })
})

app.get('/projects/edit/:id', ensureLogin.ensureLoggedIn(), function (req, res) {
    var id = req.params.id;
    var data = [];

    projectController.get_projects_data(id, function (projects) {
        data.push({ 'projects_data': projects })
        productController.get_products_id(products => {
            res.render('projects/edit', {
                title: "Products Edit",
                page_title: "Edit product",
                project: data[0]['projects_data'],
                products: products
            })
        })
    })
})

app.post('/project-list', upload.none(), projectController.get_projects_list);
app.post('/projects/do_add', upload.single('project_image'), projectController.add_project);
app.post('/projects/do_edit/:id', upload.single('project_image'), projectController.edit_project);
app.delete('/projects-delete/:id', projectController.delete_project);

/* NEWS ROUTES */

app.get('/news', ensureLogin.ensureLoggedIn(), (req, res) => {
    res.render('news/index', {
        title: 'News',
        page_title: 'News list'
    })
})

app.get('/news/add', ensureLogin.ensureLoggedIn(), function (req, res) {
    var data = [];
    productController.get_products_id_type_resource(function (products) {
        res.render('news/add', {
            title: 'News and Innovation',
            page_title: 'Add news and innovation',
            products: products
        })
    })
})


app.get('/news/edit/:id', ensureLogin.ensureLoggedIn(), function (req, res) {
    var id = req.params.id;
    var data = [];

    newsController.get_news_data(id, function (news) {
        data.push({ 'news_data': news })
        productController.get_products_id_type_resource(products => {
            res.render('news/edit', {
                title: "News Edit",
                page_title: "Edit news",
                news: data[0]['news_data'],
                products: products
            })
        })
    })
})

app.post('/news-list', upload.none(), newsController.get_news_list);
app.post('/news/do_add', upload.single('news_image'), newsController.add_news);
app.post("/news/do_edit/:id", upload.single('news_image'), newsController.edit_news);
app.delete('/news-delete/:id', newsController.delete_news);

/*notification routes*/
app.get('/notification-list', ensureLogin.ensureLoggedIn(), function (req, res) {
    res.render("notification/index", {
        title: 'Notification',
        page_title: 'Notification list'
    })
});

app.get('/notification/add', ensureLogin.ensureLoggedIn(), function (req, res) {
    res.render('notification/add', {
        title: 'notification',
        page_title: 'Add Notification'
    })
})

app.get('/notification/edit/:id', ensureLogin.ensureLoggedIn(), function (req, res) {
    var id = req.params.id;
    var data = [];

    notificationController.get_notification_data(id, function (notification) {
        data.push({ 'notification_data': notification })
        res.render('notification/edit', {
            title: "Notification Edit",
            page_title: "Edit notification",
            notification: data[0]['notification_data']
        })
    })
})

app.post('/notification-list', upload.none(), notificationController.get_notification_list);
app.post('/notification/do_add', upload.none(), notificationController.add_notification);
app.post('/notification/do_edit/:id', upload.none(), notificationController.edit_notification);
app.delete('/notification-delete/:id', notificationController.delete_notification);


/*resources routes*/
app.get('/resources-list', ensureLogin.ensureLoggedIn(), function (req, res) {
    res.render("resources/index", {
        title: 'Resources',
        page_title: 'Resources list'
    })
});

app.get('/resources/add', ensureLogin.ensureLoggedIn(), function (req, res) {
    productController.get_products_id_type_resource(function (products) {
        res.render('resources/add', {
            title: 'resources',
            page_title: 'resources',
            products: products
        })
    })
})

app.get('/resources/edit/:id', ensureLogin.ensureLoggedIn(), function (req, res) {
    var id = req.params.id;
    var data = [];
    resourcesController.get_resources_data(id, function (resources) {
        data.push({ 'resources_data': resources })
        productController.get_products_id_type_resource(products => {
            res.render('resources/edit', {
                title: "Resources Edit",
                page_title: "Edit resources",
                resources: data[0]['resources_data'],
                products: products
            })
        })
    })
})

app.post('/resources-list', upload.none(), resourcesController.get_resources_list);
app.post('/resources/do_add', upload.array('resource-image',2), resourcesController.add_resources);
app.post('/resources/do_edit/:id', upload.array('resources-image',2), resourcesController.edit_resources);
app.delete('/resources-delete/:id', resourcesController.delete_resources);


/* WHATSNEW ROUTES */
app.get('/whatsnew/add', ensureLogin.ensureLoggedIn(), function (req, res) {
    res.render('whatsnew/add', {
        title: 'Add a Trending Idea',
        page_title: 'Add New Idea'
    })
})


app.get('/whatsnew/list', ensureLogin.ensureLoggedIn(), function (req, res) {
    res.render('whatsnew/index', {
        title: 'whatsnew',
        page_title: 'Trending List'
    })
})

app.get('/whatsnew/edit/:id', ensureLogin.ensureLoggedIn(), function (req, res) {
    var id = req.params.id;
    var data = [];

    whatsnewController.get_whatsnew_data(id, function (whatsnew) {
        data.push({ 'whatsnew_data': whatsnew })
        res.render('whatsnew/edit', {
            title: "Whats New Idea Edit",
            page_title: "Edit Idea",
            whatsnew: data[0]['whatsnew_data']
        })
    })
})

app.post('/whatsnew-list', upload.none(), whatsnewController.get_whatsnew_list);
app.post('/whatsnew/do_add', upload.single('whatsnew_image'), whatsnewController.add_whatsnew);
app.post('/whatsnew/do_edit/:id', upload.single('whatsnew_img'), whatsnewController.edit_whatsnew);
app.delete('/whatsnew-delete/:id', whatsnewController.delete_whatsnew);
/* VIDEO ROUTES */
app.get('/video/add', ensureLogin.ensureLoggedIn(), function (req, res) {
    res.render('video/add', {
        title: 'video add',
        page_title: 'Add New Video'
    })
})


app.get('/video/list', ensureLogin.ensureLoggedIn(), function (req, res) {
    res.render('video/index', {
        title: 'video',
        page_title: 'video-List'
    })
})

app.get('/video/edit/:id', ensureLogin.ensureLoggedIn(), function (req, res) {
    var id = req.params.id;
    var data = [];

    videoController.get_video_data(id, function (video) {
        data.push({ 'video_data': video })
        res.render('video/edit', {
            title: "video edit",
            page_title: "Edit video",
            video: data[0]['video_data']
        })
    })
})

app.post('/video:list', upload.none(), videoController.get_video_list);
app.post('/video/do_add', upload.single('video_image'), videoController.add_video);
app.post('/video/do_edit/:id', upload.single('video_image'), videoController.edit_video);
app.delete('/video-delete/:id', videoController.delete_video);

/* PRODUCT SUB CATEGORY ROUTES */
/* NOT NEEDED FOR NOW UNCOMMENT WHEN IN NEED
app.get('/productSubCategory/add',ensureLogin.ensureLoggedIn(), function(req,res) {
    var data = [];
    productController.get_products_id( function(products) {
        res.render('product-subCategory/add', {
            title: 'Product Subcategory',
            page_title: 'Add subcategory for products' ,
            products: products
        })
    })
})

app.get('/productSubCategory', ensureLogin.ensureLoggedIn(),function(req,res) {
    res.render('product-subCategory/index', {
        title: 'Product Sub Categories',
        page_title: 'Products Sub Categories list'
    })
})

app.get('/productSubCategory/edit/:id',ensureLogin.ensureLoggedIn(), function(req,res) {
    var id = req.params.id;
    var data = [];

    productSubCategoryController.get_subProducts_data(id, function(products) {
        data.push({'products_data': products})
        productController.get_products_id(products => {
            res.render('product-subCategory/edit', {
                title: "Products Edit",
                page_title: "Edit product",
                product: data[0]['products_data'],
                products: products
            })
        })
    })
})

app.post('/productSubCategory-list', upload.none(), productSubCategoryController.get_sub_products_list);
app.post('/productSubCategory/do_add', upload.single('productSubCategory_image') , productSubCategoryController.add_productSubCategory);
app.post('/productSubCategory/do_edit/:id', upload.none(), productSubCategoryController.edit_subProduct);
*/

/* partner program routes */
app.get('/partnerp-list', ensureLogin.ensureLoggedIn(), function (req, res) {
    res.render("partnerp/index", {
        title: 'partner program',
        page_title: 'Partner Program'
    })
});

app.post('/partnerp-list', upload.none(), partnerpController.get_all_partnerp_list);

app.delete('/partnerp-delete/:id', partnerpController.delete_partnerp);

app.get('/greeni-list', ensureLogin.ensureLoggedIn(), function (req, res) {
    res.render("greeni/index", {
        title: 'green idea',
        page_title: 'Green Idea'
    })
});

app.post('/greeni-list', upload.none(), greeniController.get_all_greeni_list);

app.delete('/greeni-delete/:id', greeniController.delete_greeni);

/* mobile dashboard routes */
app.get('/mobiledashboard', ensureLogin.ensureLoggedIn(), function (req, res) {
    var data = []
    mobiledashboardController.get_products_where_type_product(function (products) {
        data.push({ 'product': products })
        mobiledashboardController.get_products_where_type_newsresources(function (newsResources) {
            data.push({ 'NewsResources': newsResources })
            res.render("mobiledashboard/index", {
                title: 'Add image',
                page_title: 'Add image to Mobile Dashboard',
                products: data[0]['product'],
                newsResources: data[1]['NewsResources'],
            })
        })  
    })
});


// app.post('/mobiledashboard/do_add',upload.single('image'),mobiledashboardController.update_image);
app.post('/mobiledashboard/do_add', upload.single('image'), mobiledashboardController.update_image);



const PORT = process.env.PORT || 8080;
app.listen(PORT);
console.log('Server is listening on port 8080');
