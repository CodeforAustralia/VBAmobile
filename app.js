var express     = require('express');
var bodyParser  = require('body-parser');
var session     = require('express-session');

var morgan      = require('morgan');
var exphbs      = require('express-handlebars');
var connect     = require('connect');
var jwt         = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config      = require('./config'); // get our config file
var Session     = require('./session');
var app         = express();
var port        = process.env.PORT || 3000;

// Package curently not being used : 
// var mongoose    = require('mongoose');
// var path        = require('path');
// var User        = require('./models/user.js'); // get our mongoose model


app.use(session({secret: config.secret, 
                 saveUninitialized: true,
                 resave: true })
);

app.use(bodyParser.json());         
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(connect.bodyParser());
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.static('views')); //serve static files from /views

app.use(morgan('dev')); //morgan to logs all request to the console

// mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// Routes
var staticSite = require('./routes/staticSite.js');


var session = new Session();
app.use('/', staticSite);

app.get('/api', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

// app.get('/', function(req, res) {
// 	console.log('logged in as ' + session.username);
//   // console.log(req.headers)
// 	res.render('index',{
//   		loggedIn : session.loggedIn,
//   		helpers : {
//   			username : session.username
//   		}
//   	});
//   // res.sendFile(path.join(__dirname + '/vbamobile.webflow/index.html'));
// });

// app.get('/login', function(req, res) {
// 	res.render('login',{
//   		loggedIn : session.loggedIn,
//   		helpers : {
//   			username : session.username
//   		}
//   	});
// });

// app.get('/project', function(req, res) {
//   console.log('requested project page')
// 	res.render('project',{
//   		loggedIn : session.loggedIn,
//   		helpers : {
//   			username : session.username
//   		}
//   	});
// });

app.post('/project', function(req, res) {
	console.log(req.body);
	res.redirect('/');
});

app.post('/newproject', function(req, res) {

});

// app.post('/login', function (req, res) {
//   // var session = new Session();
//   console.log('Login request for ' + req.body.username);
//   var credential = {
//   	username : req.body.username,
//   	password : req.body.password
//   }
//   var expressRes = function (){
//   	res.redirect('/');
//   }
//   session.login(credential, expressRes);
// });

app.listen(port, function () {
  console.log('Example app listening on port 3000!');
});