var express = require('express');
var bodyParser = require('body-parser');
var exphbs  = require('express-handlebars');
var path = require('path');
var Session = require('./session');

var app = express();

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());         
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('views'));

var session = new Session();

app.get('/', function(req, res) {
	console.log('logged in as ' + session.username);
	res.render('index',{
  		loggedIn : session.loggedIn,
  		helpers : {
  			username : session.username
  		}
  	});
  // res.sendFile(path.join(__dirname + '/vbamobile.webflow/index.html'));
});

app.get('/login', function(req, res) {
	res.render('login',{
  		loggedIn : session.loggedIn,
  		helpers : {
  			username : session.username
  		}
  	});
});

app.post('/login', function (req, res) {
  // var session = new Session();
  console.log('Login request for' + req.body.username);
  var credential = {
  	username : req.body.username,
  	password : req.body.password
  }
  var expressRes = function (){
  	res.redirect('/');
  }
  session.login(credential, expressRes);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});