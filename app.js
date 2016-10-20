var express 		= require('express');
var bodyParser  = require('body-parser');
var session     = require('express-session');
var morgan      = require('morgan');
var exphbs      = require('express-handlebars');

var config      = require('./config'); // get our config file
var Session     = require('./session');

var app         = express();
var port        = process.env.PORT || 3000;

// Package curently not being used : 
// var jwt         = require('jsonwebtoken'); // used to create, sign, and verify tokens
// var mongoose    = require('mongoose');
// var path        = require('path');
// var User        = require('./models/user.js'); // get our mongoose model
// var connect     = require('connect');


app.use(session(
	{secret: config.secret, 
   saveUninitialized: true,
   resave: true
 })
);

app.use(bodyParser.json());         
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('views')); //serve static files from /views
app.use(morgan('dev')); //morgan to logs all request to the console

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// mongoose.connect(config.database); // connect to database
// app.set('superSecret', config.secret); // secret variable

// Routes
var staticSite = require('./routes/staticSite.js');


// var session = new Session();
app.use('/', staticSite);

app.get('/api', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

app.listen(port, function () {
  console.log('Vba mobile server listening on port http://localhost:'+ port + '!');
});