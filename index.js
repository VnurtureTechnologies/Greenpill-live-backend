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
passport.serializeUser(function(user, cb) {
    cb(null, user);
});
  
passport.deserializeUser(async (email, cb) => {
    var db = admin.firestore();
    await db.collection('admin').where('email', '==', email)
    .get()
    .then((r) => {
        r.forEach( rr => {
            if(rr.data().email == email) {
                cb(null,email);
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
app.use(bodyParser.urlencoded({extended: true}));
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
const   upload = multer({
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
const whatsnewController = require('./controllers/whatsnewController');



const partnerpController = require('./controllers/partnerpController');
const greeniController = require('./controllers/greeniController');
/* BASE ROUTE */
app.get('/', function(req,res) {
    res.render("login/index");
})

app.get('/register',ensureLogin.ensureLoggedIn(), function(req,res) {
    res.render("register/index");
})
app.post('/register',userController.add_admin)

app.post('/login',passport.authenticate('local',{
    successRedirect:'/dashboard',
    failureRedirect:'/',
    failureFlash: 'Invalid email or password'
}), (req,res) => {
        res.status(200).send("All is well")
})

app.get('/logout', ensureLogin.ensureLoggedIn(), (req,res) => {
    req.logout();
    res.redirect("/");
});

app.get('/login',(req,res) => {
    res.redirect("/");
});

/* DASHBOARD ROUTE */
app.get('/dashboard', ensureLogin.ensureLoggedIn(), function(req,res) {
    var data = []
    userController.get_all_users_count( function(users) {
        data.push({'users_count': users})
        userController.get_all_projects_count( function (projects) {
            data.push({'projects_count': projects})
            userController.get_all_products_count( function(products) {
                data.push({'products_count': products})
                    res.render("dashboard/index", {
                        total_users: data[0]['users_count'],
                        total_projects: data[1]['projects_count'],
                        total_products: data[2]['products_count']
                })
            })
        })
    })
})


/* USER ROUTE */
app.get('/users/add', ensureLogin.ensureLoggedIn(),function(req,res) {
    res.render('users/add', {
        title: 'Users',
        page_title: 'Add Users' 
    })
})

app.get('/user-list', ensureLogin.ensureLoggedIn(),function(req,res){
    res.render("users/index", {
        title: 'users',
        page_title: 'Users-list'
    })
});

app.get('/users/edit/:id', ensureLogin.ensureLoggedIn(),function(req,res) {
    var id = req.params.id;
    var data = [];

    userController.get_users_data(id, function(users) {
        data.push({'users_data': users})
        res.render('users/edit', {
            title: "User Edit",
            page_title: "Edit user",
            user: data[0]['users_data']
        })
    })
})

app.post('/user-list',upload.none(),userController.get_all_users_list);
app.post('/users/do_add',upload.none(),userController.add_users);
app.post('/users/do_edit/:id', upload.none() ,userController.edit_user);
app.delete('/users-delete/:id', userController.delete_user);

/* PRODUCT ROUTEs */
app.get('/products/add', ensureLogin.ensureLoggedIn(),function(req,res) {
    res.render('products/add', {
        title: 'Products',
        page_title: 'Add products' 
    })
})

app.get('/products', ensureLogin.ensureLoggedIn(), function(req,res) {
    res.render('products/index', {
        title: 'Products',
        page_title: 'Products-list'
    })
})

app.get('/products/edit/:id', ensureLogin.ensureLoggedIn(),function(req,res) {
    var id = req.params.id;
    var data = [];

    productController.get_products_data(id, function(products) {
        data.push({'products_data': products})
        res.render('products/edit', {
            title: "Products Edit",
            page_title: "Edit product",
            product: data[0]['products_data']
        })
    })
})

app.post('/product-list', upload.none() ,productController.get_products_list);
app.post('/products/do_add', upload.single('product_image') , productController.add_product);
app.post('/products/do_edit/:id', upload.single('product_image') ,productController.edit_product);

/* PROJECT ROUTES */
app.get('/projects/add',ensureLogin.ensureLoggedIn(), function(req,res) {
    var data = [];
    productController.get_products_where_type_product( function(products) {
        res.render('projects/add', {
            title: 'Projects',
            page_title: 'Add projects' ,
            products: products
        })
    })
})

app.get('/projects',ensureLogin.ensureLoggedIn(), (req,res) => {
    res.render('projects/index',{
        title: 'Projects',
        page_title: 'Projects list'
    })
})

app.get('/projects/edit/:id',ensureLogin.ensureLoggedIn(), function(req,res) {
    var id = req.params.id;
    var data = [];

    projectController.get_projects_data(id, function(projects) {
        data.push({'projects_data': projects})
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
app.post('/projects/do_add', upload.single('project_image') , projectController.add_project);
app.post('/projects/do_edit/:id', upload.single('project_image'), projectController.edit_project);

/* NEWS ROUTES */

app.get('/news',ensureLogin.ensureLoggedIn(), (req,res) => {
    res.render('news/index',{
        title: 'News',
        page_title: 'News list'
    })
})

app.get('/news/add',ensureLogin.ensureLoggedIn(), function(req,res) {
    var data = [];
    productController.get_products_id( function(products) {
        res.render('news/add', {
            title: 'News and Innovation',
            page_title: 'Add news and innovation' ,
            products: products
        })
    })
})


app.get('/news/edit/:id',ensureLogin.ensureLoggedIn(), function(req,res) {
    var id = req.params.id;
    var data = [];

    newsController.get_news_data(id, function(news) {
        data.push({'news_data': news})
            res.render('news/edit', {
                title: "News Edit",
                page_title: "Edit news",
                news: data[0]['news_data'],
            })
        })
})

app.post('/news-list', upload.none(), newsController.get_news_list);
app.post('/news/do_add', upload.single('news_image'), newsController.add_news);
app.post("/news/do_edit/:id", upload.none(), newsController.edit_news);


/* WHATSNEW ROUTES */
app.get('/whatsnew/add', ensureLogin.ensureLoggedIn(),function(req,res) {
    res.render('whatsnew/add', {
        title: 'Whatsnew Idea',
        page_title: 'Add New Idea'
    })
})


app.get('/whatsnew/list', ensureLogin.ensureLoggedIn(), function(req,res) {
    res.render('whatsnew/index', {
        title: 'whatsnew',
        page_title: 'Whatsnew-Idea-List'
    })
})

app.get('/whatsnew/edit/:id', ensureLogin.ensureLoggedIn(),function(req,res) {
    var id = req.params.id;
    var data = [];

    whatsnewController.get_whatsnew_data(id, function(whatsnew) {
        data.push({'whatsnew_data': whatsnew})
        console.log(data[0]['whatsnew_data'])
        res.render('whatsnew/edit', {
            title: "Whats New Idea Edit",
            page_title: "Edit Idea",
            whatsnew: data[0]['whatsnew_data']
        })
    })
})


app.post('/whatsnew-list', upload.none() ,whatsnewController.get_whatsnew_list);
app.post('/whatsnew/do_add', upload.single('whatsnew_image') , whatsnewController.add_whatsnew);
app.post('/whatsnew/do_edit/:id', upload.single('whatsnew_image') ,whatsnewController.edit_whatsnew);
app.delete('/whatsnew-delete/:id', whatsnewController.delete_whatsnew);

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
app.get('/partnerp-list', ensureLogin.ensureLoggedIn(),function(req,res){
    res.render("partnerp/index", {
        title: 'partner program',
        page_title: 'Partner Program'
    })
});

app.post('/partnerp-list',upload.none(),partnerpController.get_all_partnerp_list);

app.delete('/partnerp-delete/:id', partnerpController.delete_partnerp);

app.get('/greeni-list', ensureLogin.ensureLoggedIn(),function(req,res){
    res.render("greeni/index", {
        title: 'green idea',
        page_title: 'Green Idea'
    })
});

app.post('/greeni-list',upload.none(),greeniController.get_all_greeni_list);

app.delete('/greeni-delete/:id', greeniController.delete_greeni);

const PORT = process.env.PORT || 8080;
app.listen(PORT);
console.log('Server is listening on port 8080');
