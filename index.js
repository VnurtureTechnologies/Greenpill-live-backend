const express = require('express');
const hbs = require('hbs');

var app = express();
app.set('view engine', 'html');
app.engine('html', hbs.__express);


app.get('/', function(req,res) {
    res.render("dashboard");
})

const PORT = process.env.PORT || 8080;
app.listen(PORT);