const express 		= require('express');
const bodyParser  = require('body-parser');
const session     = require('express-session');
const morgan      = require('morgan');
const exphbs      = require('express-handlebars');

const config      = require('./config'); // get our config file

const app         = express();
const port        = process.env.PORT || 3000;

// app.use( function(req, res, next) {
// 	if ( req.header['x-forwarded-proto'] != 'https' ) {
// 		// console.log(req)
//     res.redirect(`https://${req.headers.host}${req.url}`) }
//   else
//     next()
// 	});

app.use(
	session({
		secret: config.secret, 
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
const staticSite = require('./routes/staticSite.js');


app.use('/', staticSite);
app.get('/api', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

app.listen(port, function () {
  console.log('Vba mobile server listening on port http://localhost:'+ port + '!');
});