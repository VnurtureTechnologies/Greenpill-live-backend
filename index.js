const express = require('express');
const hbs = require('hbs');
const path = require('path');

var app = express();

//common header and footer
hbs.registerPartials(__dirname + '/views/common');

app.set('view engine', 'html');
app.engine('html', hbs.__express);

app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'uploads')));

app.get('/', function(req,res) {
    res.render("login/index");
})

app.get('/dashboard', function(req,res) {
    res.render("dashboard/index")
})

const PORT = process.env.PORT || 8080;
app.listen(PORT);