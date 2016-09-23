var express = require('express');
var request = require('request');
var requestp = require('request-promise');
// var jwt = require('jsonwebtoken');
var config = require('../config');
var session = require('express-session')

// var     = require('../models/user.js'); // get our mongoose model

var app = express();

exports.landingPage = function(req, res) {
	let user = isLoggedIn(req);
	res.render('index', {
  		loggedIn : user,
  		helpers : {
  			username : user
  		}
	});
};

exports.login = function(req, res) {
	console.log('Login request for ' + req.body.username);

	// let username = req.body.username;
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

	let options = {
		method: 'POST',
		resolveWithFullResponse: true,
		simple: false,
		jar: jar,
		url: url,
		headers: header,
		form: {
			username: req.body.username,
			password: req.body.password
		}
	}

	requestp(options)
	// procces the response, excract cookie and pass it on
	.then(function(response) {
		debugger;
		let cookies = jar.getCookies(url);
		return cookies
	})
	// Fetch the User Details
	.then(getUserSessionDetail)
	// setup session cookies and redirect to '/'
	.then(function(name) {
		let sess = req.session;
		sess.username = name;
		// convert vba login cookie to string and store into the vbamobile cookie.
		sess.cookies = jar.getCookieString(url);
		// console.log("#########")
		// let c = jar.getCookies(url)
		// debugger;
		res.redirect('/')
	})
	// Handle failed request... need to work on this one
	.catch(function (err) {
        console.log(err) 
    });
};

exports.projectPage = function(req, res) {
	let user = isLoggedIn(req);
	res.render('project', {
  		loggedIn : user,
  		helpers : {
  			username : user
  		}
	});
};

exports.projectsPage = function(req, res) {
	let url = 'https://vba.dse.vic.gov.au/vba/vba/sc/IDACall?isc_rpc=1&isc_v=SC_SNAPSHOT-2010-08-03&isc_xhr=1'
	//Lets configure and request
	// console.log(req.session.cookies);
	let header = {
		'Host': 'vba.dse.vic.gov.au',
		'Connection': 'keep-alive',
		'Cache-Control': 'max-age=0',
		'Origin': 'https://vba.dse.vic.gov.au',
		'Upgrade-Insecure-Requests': '1',
		'Cookie': req.session.cookies
	}

	let options = {
		method: 'POST',
		resolveWithFullResponse: true,
		simple: false,
		url: url,
		headers: header,
		form: {
			_transaction: '<transaction xmlns:xsi="http://www.w3.org/2000/10/XMLSchema-instance" xsi:type="xsd:Object"><transactionNum xsi:type="xsd:long">194</transactionNum><operations xsi:type="xsd:List"><elem xsi:type="xsd:Object"><criteria xsi:type="xsd:Object"><projectStatusCde>pub</projectStatusCde><isMyProjectSearch xsi:type="xsd:boolean">true</isMyProjectSearch></criteria><operationConfig xsi:type="xsd:Object"><dataSource>Project_DS</dataSource><operationType>fetch</operationType><textMatchStyle>exact</textMatchStyle></operationConfig><startRow xsi:type="xsd:long">0</startRow><endRow xsi:type="xsd:long">75</endRow><componentId>isc_ManageProjectModule$2_2</componentId><appID>builtinApplication</appID><operation>mainProjectSearch</operation><oldValues xsi:type="xsd:Object"><projectStatusCde>pub</projectStatusCde><isMyProjectSearch xsi:type="xsd:boolean">true</isMyProjectSearch></oldValues></elem></operations></transaction>',
			protocolVersion: '1.0'
		}
	}

	requestp(options)
	.then(function(response) {
		// console.log(response)

		debugger;
		return response
	})
	.then(function(response) {
		console.log(response.body)
		// do some regex
		let regex = /displayName:("(.*?)")/; 
		let match = regex.exec(response.body);
 		console.log('displayName: ' + match[2])
		// do some eval
		// burn in hell
		res.send(response.body)
	})
	.catch(function (err) {
      console.log(err) 
    });

	// res.send('hello projects')
};

exports.newProject = function(req, res) {
	console.log(req.session.cookies)
	res.redirect('/survey');
};

exports.surveyPage = function(req, res) {
	let user = isLoggedIn(req);
	res.render('survey', {
  		loggedIn : user,
  		helpers : {
  			username : user
  		}
	});
};

let isLoggedIn = function(req) {
	// !!username ? console.log("welcome back " + req.session.username) : console.log('new session');
	return req.session.username || false;
}

let getUserSessionDetail = function(cookies) {
	let url = 'https://vba.dse.vic.gov.au/vba/vba/sc/IDACall?isc_rpc=1&isc_v=SC_SNAPSHOT-2010-08-03&isc_xhr=1'
	// console.log("------")
	// console.log(cookies)
	let header = {
		'Host': 'vba.dse.vic.gov.au',
		'Connection': 'keep-alive',
		'Cache-Control': 'max-age=0',
		'Origin': 'https://vba.dse.vic.gov.au',
		'Upgrade-Insecure-Requests': '1',
		'Cookie': cookies
	}

	let options = {
		resolveWithFullResponse: true,
		simple: false,
		url: url,
		method: 'POST',
		headers: header,
		form: {
			_transaction: '<transaction xmlns:xsi="http://www.w3.org/2000/10/XMLSchema-instance" xsi:type="xsd:Object"><transactionNum xsi:type="xsd:long">0</transactionNum><operations xsi:type="xsd:List"><elem xsi:type="xsd:Object"><criteria xsi:type="xsd:Object"></criteria><operationConfig xsi:type="xsd:Object"><dataSource>UserSessionDetail_DS</dataSource><operationType>fetch</operationType></operationConfig><appID>builtinApplication</appID><operation>UserSessionDetail_DS_fetch</operation><oldValues xsi:type="xsd:Object"></oldValues></elem></operations></transaction>',
			protocolVersion: '1.0'
		}
	}

	return requestp(options)
	.then(function(response) {
		let regex = /displayName:("(.*?)")/; 
		let match = regex.exec(response.body);
 		console.log('displayName: ' + match[2])
 		return match[2];
	})
	// Handle failed request... need to work on this one 
	.catch(function (err) {
      console.log(err) 
    });
}