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
	if(!isLoggedIn(req)) return res.redirect('/login');
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

exports.incObsPage = function(req, res) {
	// If user not logged in redirect to login page
	// if(!isLoggedIn(req)) return res.redirect('/login');
	console.log(chalk.green(JSON.stringify(req.params, null, 4)));

	let user = isLoggedIn(req);
	let methodId = req.params.methodId;
	let surveyId = req.params.surveyId;

	res.render('newGeneralObs', {
		incObs: true,
		awesomplete: true,
		loggedIn : user,
		helpers : {
			username : user
		},
		method : { id : methodId },
		survey : { id : surveyId }
	});
};

exports.createIncObs = function(req, res) {
	// If user not logged in redirect to login page
	if(!isLoggedIn(req)) return res.redirect('/login');
	console.log('Params : ', chalk.green(JSON.stringify(req.params, null, 4)));
	const cookie = req.session.cookies;

	let user = isLoggedIn(req);
	// let methodId = req.params.methodId;
	// let surveyId = req.params.surveyId;
	let surveyId;
	const verifySiteOptions = 	{
		location: 'cc',
		cType: '1',
		Datum: 'g',
		zone: 54,
		Latitude: req.body.lat,
		Longitude: req.body.long,
		gps: true,
		Accuracy:1
	}

	// create new site
	get.verifySiteEditability( verifySiteOptions, cookie )
		.then(response => {
			// console.log( response.body )
			if ( !(response.body.wkt) ) {
				throw response.body
			}
			// "POINT(145.480171 -36.660507)"
			let pointsRegex = /POINT\(((?:-|)\d*\.\d*) ((?:-|)\d*.\d*)/
			let [,long, lat] = pointsRegex.exec(response.body.wkt);
			console.log(`long : ${long} lat : ${lat}`)
			return [long, lat]
		}).then(points => {
			return post.saveSite({
				// siteId:
				nme: req.body.locNme,
				desc: req.body.locDesc,
				// comment:
				type: 'Point',
				Accuracy:2,
				// isc_SpacerItem_0:
				// isc_CanvasItem_0:
				gps: true,
				location:'cc',
				cType:1,
				Datum:'g',
				Latitude: points[1],
				Longitude: points[0],
				// lati2:
				// longi2:
				zone:54,
				// mapNo:
				// Easting:
				// Northing:
				// edition:
				// pageGrid:
				// Validate:
				coordinateInfoChanged:true,
				geom:`${points[0]}${points[1]}`,
				userId: req.session.userUid
			}, cookie)
		}).then( saveSiteRes => {
			console.log( saveSiteRes.body);

			return post.createSurvey({
				surveyNme: req.body.locNme,
				surveyStartSdt: req.body.date,
				siteId: saveSiteRes.body.siteId,
				userUid: req.session.userUid,
				projectId: 1,
				primaryDisciplineCde: 'tf'
			}, cookie);
		}).then( createSurveyRes => {
			console.log(createSurveyRes.body)
			let surveyId = /SURVEY_ID:"(\d*)"/.exec(createSurveyRes.body)[1]
			return surveyId;
		}).then( surveyId => {
			return get.surveyForGeneralObs( surveyId, cookie );
		}).then( response => parseResponse( response.body) )
			// .then( surveyData => {
			// 	res.send( surveyData );
			// })
			.then( survey => {
				survey = survey[0];
				console.log(survey)

				surveyId = survey.data.surveyId;
				let taxonRecord = {
						typeCde : req.body.typeCde,
						observerId : req.session.userUid,
						taxonId : req.body.taxonId,
						componentId : survey.componentId,
						surveyId : surveyId,
						totalCount : req.body.count,
						extraInfo : req.body.extraInfo
					};
				console.log( taxonRecord );
				return post.newTaxonRecord(taxonRecord, cookie)
			}).then(response => {
				console.log( response.body )
				res.redirect(`/survey/${surveyId}/species`);
			})
		.catch( e => {
			console.log(e);
		});
	// create new survey for project 1
	// add taxon record
	// redirect to taxon list

	// res.send(`work in progress ... <br />
	// 					${ JSON.stringify(req.body, null, 2) }`);
	// res.redirect(`/survey/${taxonRecord.surveyId}/species`);
};

exports.createTaxonRecord = function(req, res) {

	console.log(chalk.red(JSON.stringify(req.body, null, 4)));
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
		console.log(chalk.green(JSON.stringify(response, null, 4)));
		console.log('survey ID : ', taxonRecord.surveyId);
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
		// only request details for the first 16 surveys
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
				taxon: taxonList.reverse(),
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

let parseResponse = function( data ) {
	// remove the begining and end of the string
	// //isc_RPCResponseStart--> //isc_RPCResponseEnd
	var trim = data.slice(25, data.length - 20);
	// Clean the data out of function
	var clean = trim.replace(/Date\.parseServerDate/g, 'new Date');
	return eval(clean);
};