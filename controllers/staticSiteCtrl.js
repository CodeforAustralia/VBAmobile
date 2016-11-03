const express = require('express');
const request = require('request');
const requestp = require('request-promise');
const config = require('../config');
const session = require('express-session')
const chalk = require('chalk');

const parse = require('./parse.js');
const get = require('./get.js');
const post = require('./post.js');

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
	let cookieJar = request.jar();

	get.cookie(req.body.username, req.body.password, cookieJar)
	.then( fetchRes => {
		// Checking if login is succefull
		if (/\?error=1/.exec(fetchRes.body)) throw 'failed login';
		return req.session.cookies = cookieJar.getCookieString(fetchRes.request.href);
	})
	.then( get.userDetails )
	.then( fetchRes => parse.userDetails(fetchRes.body))
	.then( userDetails => {
		// convert vba cookie to string and store into the vbamobile cookie.
		req.session.username = userDetails.displayName;
		req.session.userUid = userDetails.userUid;
		res.redirect('/');
	})
	.catch(function (err) {
		// need to let the user know login failled
		console.log(err)
		if (err === 'failed login') res.redirect('/login');
	});
};

exports.logout = function(req, res) {
	console.log('Logout request for ' + req.body.username);
	req.session.cookies = null
	req.session.username = null
	res.redirect('/');
};

exports.projectsPage = function(req, res) {
	// If user not logged in redirect to login page
	if(!isLoggedIn(req)) return res.redirect('/login');

	get.project(req.session.cookies)
	.then( fetchRes => parse.project(fetchRes.body))
	.then( projects => {
		let user = isLoggedIn(req);
		res.render('projects', {
			loggedIn : user,
			helpers : {
				username : user
			},
			project: projects
		});
	})
	.catch(function (err) {
			console.log(err) 
		});
};

exports.createTaxonRecordPage = function(req, res) {
	// If user not logged in redirect to login page
	if(!isLoggedIn(req)) return res.redirect('/login');
	console.log(chalk.green(JSON.stringify(req.params, null, 4)));

	let user = isLoggedIn(req);
	let methodId = req.params.methodId;
	let surveyId = req.params.surveyId;

	res.render('newTaxonRecord', {
		awesomplete: true,
		loggedIn : user,
		helpers : {
			username : user
		},
		method : { id : methodId },
		survey : { id : surveyId }
	});
};

exports.createTaxonRecord = function(req, res) {

	let cookie = req.session.cookies;
	let taxonRecord = {
		typeCde : req.body.typeCde,
		observerId : req.session.userUid,
		taxonId : req.body.taxonId,
		componentId : req.params.methodId,
		surveyId : req.params.surveyId,
		totalCount : req.body.count,
		extraInfo : req.body.extraInfo
	};

	console.log(`New taxon record : `, chalk.green(JSON.stringify(taxonRecord, null, 4)));

	post.newTaxonRecord(taxonRecord, cookie)
	.then (response => {
		// console.log(chalk.green(JSON.stringify(response, null, 4)));
		res.redirect(`/survey/${taxonRecord.surveyId}/species`);
	})
};

exports.deleteTaxonRecord = function(req, res) {
	let cookie = req.session.cookies;
	const surveyId = req.params.surveyId;
	const methodId = req.params.methodId;
	// const taxonIds = req.body;
	let taxonRecordIds = [];
	for (let taxonIds in req.body) {
		taxonRecordIds.push(taxonIds)
	};

	// TODO: error handling
	post.deleteTaxonRecord(surveyId, methodId, taxonRecordIds, cookie)
		.then(res.redirect(`/survey/${surveyId}/species`));
};

exports.surveys = function(req, res) {
	// If user not logged in redirect to login page
	if(!isLoggedIn(req)) return res.redirect('/login');

	let projectId = req.params.id;
	let cookie = req.session.cookies;

	get.surveysList(projectId, cookie)
	.then( fetchRes => parse.surveys(fetchRes.body))
	.then( surveys => {
		console.log(`${chalk.green(surveys.length)} survey(s) found for project #${chalk.green(projectId)}`)
		// To-do pagination
		// create an Array of requests
		let surveysRequests = surveys.slice(0, 15).map((survey) => {
			return new Promise((resolve) => {
				get.survey(survey.surveyId, req.session.cookies)
				.then( fetchRes => resolve(parse.survey(fetchRes.body)))
			})
		});

		Promise.all(surveysRequests)
		.then( surveyData => {
			console.log(chalk.red(surveyData))
			let user = isLoggedIn(req);
			res.render('surveys', {
				loggedIn : user,
				helpers : {
					username : user
				},
				survey: surveyData
			});
		})
	})
	.catch(function (err) {
			console.log(err) 
	});
};

exports.species = function(req, res) {
	if(!isLoggedIn(req)) return res.redirect('/login');

	let surveyId = req.params.id;
	let cookie = req.session.cookies;

	get.surveyMethods(surveyId, cookie)
	.then( fetchRes => parse.surveyMethod(fetchRes.body))
	.then( (surveyMethods) => {
		if ( surveyMethods === null ) throw 'no method';
		console.log(surveyMethods);
		// fetchMethodDetail
		let methodDetail = new Promise((resolve) => {
			get.methodDetail(surveyMethods.methodId, cookie)
			.then( fetchRes => resolve(parse.methodDetail(fetchRes.body)));
			// .then( fetchRes => {
			// 	let methodDetail = parseMethodDetail(fetchRes.body);
			// 	console.log(chalk.red(JSON.stringify(methodDetail, null, 4)));
			// 	resolve(methodDetail);
			// });
		});
		// fetchMethodTaxonList
		let taxonList = new Promise((resolve) => {
			get.methodTaxonList(surveyMethods.methodId, cookie)
			.then( fetchRes => resolve(parse.taxonList(fetchRes.body)));
		});

		Promise.all([methodDetail, taxonList])
		.then( PromisesArr => {
			console.log(PromisesArr);
			debugger;
			let methodDetail = PromisesArr[0] || {};
			let taxonList = PromisesArr[1] || [];
			let user = isLoggedIn(req);
			console.log(`Taxon list : ${chalk.green(taxonList.length)} record found`);
			console.log('method detail : ', chalk.yellow(JSON.stringify(methodDetail, null, 4)));

			let decodeDiscipline = function(code) {
				switch (code) {
					case 'tf':
						return 'Terrestrial Fauna'
					break;
					case 'all':
						return 'all'
					break;
					default:
						return `Unknow code: ${code}`
				}
			}

			let method = {
				id: surveyMethods.methodId,
				name: surveyMethods.samplingMethodDesc,
				discipline: decodeDiscipline(surveyMethods.disciplineCde),
				area: !!methodDetail.measurementValueNum ? methodDetail.measurementValueNum : false,
				dateDisplay: !!methodDetail.firstDateSd && !!methodDetail.secondDateSdt,
				start: !!methodDetail.firstDateSdt ? methodDetail.firstDateSd : false,
				end: !!methodDetail.secondDateSdt ? methodDetail.secondDateSdt : false,
				species: taxonList.length
			};


			console.log(chalk.cyan(JSON.stringify(method, null, 4)));
			// debugger;
			res.render('species', {
				loggedIn : !!user,
				helpers : {
					username : user,
				},
				survey : { id : surveyId },
				method : method,
				taxon: taxonList,
				survey : { id : surveyId}
			});
		})
	})
	.catch( err => {
		console.log(err);
		if (err === 'no method') res.send(`no method assign to survey ${surveyId}`);
	});
};

exports.newProject = function(req, res) {
	// console.log(req.session.cookies)
	res.redirect('/survey');
};

const isLoggedIn = function(req) {
	return req.session.username || false
};

const decodeSurveyStatus = function (status) {
	switch (status) {
		case 'a':
			return 'Approved'
		break;
		case 'cr':
			return 'Change Requested'
		break;
		case 'del':
			return 'Deleted'
		break;
		case 'draft':
			return 'Draft'
		break;
		case 'na':
			return 'Not approved'
		break;			
		case 'rr':
			return 'Ready for review'
		break;
		case 'ur':
			return 'Under review'
		break;
		default:
			return `Unknow status: ${status}`
	}
};