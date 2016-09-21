var express = require('express');
var request = require('request');
// var jwt = require('jsonwebtoken');
var config = require('../config');
var session = require('express-session')

// var     = require('../models/user.js'); // get our mongoose model

var app = express();

exports.landingPage = function(req, res) {
	let session = req.session;
	let username = req.session.username

	!!username ? console.log("welcome back " + req.session.username) : console.log('new session');

	res.render('index', {
  		loggedIn : !!username,
  		helpers : {
  			username : session.username
  		}
	});
};

exports.login = function(req, res) {
	console.log('Login request for ' + req.body.username);

	let username = req.body.username;
	let jar = request.jar();
	let url = 'https://vba.dse.vic.gov.au/vba/login';

	//Lets configure and request
	let header = {
		'Host': 'vba.dse.vic.gov.au',
		'Connection': 'keep-alive',
		'Cache-Control': 'max-age=0',
		'Origin': 'https://vba.dse.vic.gov.au',
		'Upgrade-Insecure-Requests': '1'
	}

	request({
			jar: jar,
			url: url,
			method: 'POST',
			headers: header,
			form: {
				username: req.body.username,
				password: req.body.password
			}
		},
		function(error, response, body) {
			if (error) {
				console.log(error);
				res.redirect('/');
			} else {
				console.log("login response code : " + response.statusCode);
				let cookies = jar.getCookies(url);
				console.log(cookies);

				sess = req.session;
				//In this we are assigning email to sess.email variable.
				//email comes from HTML page.
				sess.username = req.body.username;
				sess.cookies = cookies;
				console.log('session email is setup to ' + sess.username)
				
				res.redirect('/')
			}
		});
};

exports.projectPage = function(req, res) {
	let session = req.session;
	let username = req.session.username

	!!username ? console.log("welcome back " + req.session.username) : console.log('new session');

	res.render('project', {
  		loggedIn : !!username,
  		helpers : {
  			username : session.username
  		}
	});
};

exports.newProject = function(req, res) {
	console.log(req.session.cookies)
	res.render('survey');
};

// let tokenGen = function(user, cookies){
// 	// create a token valid for 24 hours
// 	let payload = {
// 		username: user,
// 		cookies: cookies
// 	}
// 	console.log(config.secret)
//   return jwt.sign(payload, config.secret, { expiresIn: 60*60*24});
// }
