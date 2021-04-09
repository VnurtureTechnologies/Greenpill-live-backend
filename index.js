const express = require('express');
const hbs = require('hbs');
const path = require('path');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const constants = require('constants');
const multer = require('multer');
const serviceAccount = require("./greenpill-live-firebase-admin");


var app = express();

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

/* BASE ROUTE */
app.get('/', function(req,res) {
    res.render("login/index");
})

/* DASHBOARD ROUTE */
app.get('/dashboard', function(req,res) {
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
app.post('/productSubCategory/do_edit/:id', upload.none(), productSubCategoryController.edit_subProduct);
app.post('/productSubCategory/delete/:id',upload.none(), productSubCategoryController.delete_subProduct);


const PORT = process.env.PORT || 8080;
app.listen(PORT);