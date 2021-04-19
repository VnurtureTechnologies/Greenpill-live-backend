const express = require('express');
const hbs = require('hbs');
const path = require('path');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const constants = require('constants');
const multer = require('multer');
const session = require('express-session');
const okta = require('@okta/okta-sdk-nodejs');
const ExpressOIDC = require('@okta/oidc-middleware').ExpressOIDC;
const serviceAccount = require("./greenpill-live-firebase-admin");


var app = express();

// OKTA configuration for User authentication
// var oktaClient = new okta.Client({
//     orgUrl: "https://dev-52468545.okta.com/app/UserHome",
//     token: "00cFm1JzOlbtTioxzZfNq6oIdc706MFB1e6V66KBm4"
// });

// var oidc = new ExpressOIDC({
//     issuer: "https://dev-52468545.okta.com/oauth2/default",
//     client_id: "0oakqwgs6a8CTDHXU5d6",
//     client_secret: "pKQ6Srss-07Yq7RGrLToZnh39iEOtchSF296PdSg",
//     appBaseUrl: "http://localhost:8080",
//     redirect_uri: "http://localhost:8080/users/callback",
//     scope: "openid profile",
//     routes: {
//         login: {
//             path: "/login"
//         },
//         loginCallback: {
//             path: "/users/callback",
//             defaultRedirect: "/dashboard"
//         }
//     }
// })

//common header and footer
hbs.registerPartials(__dirname + '/views/common');

app.set('view engine', 'html');
app.engine('html', hbs.__express);

app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'uploads'))); 

// Bodyparser middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.text());

// SESSTION CONFIGURATION
// app.use(session({
//     secret: "Aman_V",
//     resave: true,
//     saveUninitialized: false
// }))

// app.use(oidc.router);

// app.use((req, res, next) => {
//     if (!req.userinfo) {
//       return next();
//     }
  
//     oktaClient.getUser(req.userinfo.sub)
//       .then(user => {
//         req.user = user;
//         res.locals.user = user;
//         next();
//       }).catch(err => {
//         next(err);
//       });
// });

// function loginRequired(req,res,next) {
//     if(!req.user) {
//         return res.status(401).render("Unauthenticated !! Please login to continue ...")
//     }
//     next();
// }

/* MULTER CONFIG */

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
})

//Firebase configuration

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `${process.env.firebase_database_url}`
})
  
var database = admin.firestore();
database.settings({ ignoreUndefinedProperties: true });
  

/* CONTROLLER MODULES IMPORTS */
const userController = require('./controllers/userController');
const productController = require('./controllers/productController');
const productSubCategoryController = require('./controllers/productSubCategoryController')
const projectController = require('./controllers/projectController');
const newsController = require('./controllers/newsController');

/* BASE ROUTE */
app.get('/', function(req,res) {
    res.render("login/index");
})

app.get('/logout', (req,res) => {
    req.logout();
    res.redirect("/");
});

/* DASHBOARD ROUTE */
app.get('/dashboard',function(req,res) {
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

app.post('/user-list', userController.get_all_users_list);

/* PRODUCT ROUTEs */
app.get('/products/add', function(req,res) {
    res.render('products/add', {
        title: 'Products',
        page_title: 'Add products' 
    })
})

app.get('/products', function(req,res) {
    res.render('products/index', {
        title: 'Products',
        page_title: 'Products-list'
    })
})

app.get('/products/edit/:id', function(req,res) {
    var id = req.params.id;
    var data = [];

    productController.get_products_data(id, function(products) {
        data.push({'products_data': products})
        console.log(data[0]['products_data'])
        res.render('products/edit', {
            title: "Products Edit",
            page_title: "Edit product",
            product: data[0]['products_data']
        })
    })
})

app.post('/product-list', upload.none() ,productController.get_products_list);
app.post('/products/do_add', upload.single('product_image') , productController.add_product);
app.post('/products/do_edit/:id', upload.none() ,productController.edit_product);


/* PRODUCT SUB CATEGORY ROUTES */
app.get('/productSubCategory/add', function(req,res) {
    var data = [];
    productController.get_products_id( function(products) {
        res.render('product-subCategory/add', {
            title: 'Product Subcategory',
            page_title: 'Add subcategory for products' ,
            products: products
        })
    })
})

app.get('/productSubCategory', function(req,res) {
    res.render('product-subCategory/index', {
        title: 'Product Sub Categories',
        page_title: 'Products Sub Categories list'
    })
})

app.get('/productSubCategory/edit/:id', function(req,res) {
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
// app.post('/productSubCategory/do_add', upload.single('productSubCategory_image') , productSubCategoryController.add_productSubCategory);
app.post('/productSubCategory/do_edit/:id', upload.none(), productSubCategoryController.edit_subProduct);


/* PROJECT ROUTES */
app.get('/projects/add', function(req,res) {
    var data = [];
    productSubCategoryController.get_productSubCategory_id( function(productSubCategory) {
        res.render('projects/add', {
            title: 'Projects',
            page_title: 'Add projects' ,
            productSubCategory: productSubCategory
        })
    })
})

app.get('/projects', (req,res) => {
    res.render('projects/index',{
        title: 'Product Sub Categories',
        page_title: 'Products Sub Categories list'
    })
})

app.get('/projects/edit/:id', function(req,res) {
    var id = req.params.id;
    var data = [];

    projectController.get_projects_data(id, function(projects) {
        data.push({'projects_data': projects})
        productSubCategoryController.get_productSubCategory_id(productSubCategory => {
            res.render('projects/edit', {
                title: "Products Edit",
                page_title: "Edit product",
                project: data[0]['projects_data'],
                productSubCategory: productSubCategory
            })
        })
    })
})

app.post('/project-list', upload.none(), projectController.get_projects_list);
// app.post('/projects/do_add', upload.single('project_image') , projectController.add_project);
app.post('/projects/do_edit/:id', upload.none(), projectController.edit_project);

/* NEWS ROUTES */

app.get('/news', (req,res) => {
    res.render('news/index',{
        title: 'News',
        page_title: 'News list'
    })
})

app.get('/news/edit/:id', function(req,res) {
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
app.post("/news/do_edit/:id", upload.none(), newsController.edit_news);


const PORT = process.env.PORT || 8080;
app.listen(PORT);