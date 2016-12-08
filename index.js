'use strict';

const PORT = 3000;

let express = require('express');
let app = express();
let path = require('path');
let cookieParser = require('cookie-parser');


app.use(cookieParser());

//========= handlebars ===========
let hbs = require('express-handlebars');

app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'mainLayout', layoutsDir: __dirname + '/views/layouts/'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
// config ===========================

app.use(express.static(__dirname + '/public'));

//========= ROUTES ===========


var routes = require('./routes/requests');
app.use("/", routes);


app.listen(PORT);

