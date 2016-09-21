var express = require('express');
var staticSite = express.Router();
var staticSiteCtrl = require('../controllers/staticSiteCtrl.js');
// var jwt = require('jsonwebtoken');
// var config = require('../config');

// look for and decode token, then add it to req.decoded
// staticSite.use(function(req, res, next) {
//   var token = req.body.token || req.query.token ||req.headers['x-access-token'];

// 	console.log("Token received :" + token)

//   if(token) {
//     jwt.verify(token, secret, function(err, decoded) {      
//       if (err) {
//         return res.json({ success: false, message: 'Failed to authenticate token.' });    
//       }else {
//         // if everything is good, save to request for use in other routes
//         req.decoded = decoded;    
//         next();
//       }
//     });
//  	} else {
//  		req.decoded = null;
//  		next();
//  	}
// })

staticSite.get('/', function(req, res) {
	return staticSiteCtrl.landingPage(req, res);
});

staticSite.get('/project', function(req, res) {
	// console.log('requested project page from staticSite route')
	return staticSiteCtrl.projectPage(req, res);
});

staticSite.get('/login', function(req, res) {
	res.render('login')
});

staticSite.post('/login', function(req, res) {
	return staticSiteCtrl.login(req, res);
})

staticSite.post('/project', function(req, res) {
	return staticSiteCtrl.newProject(req, res);
})



module.exports = staticSite;