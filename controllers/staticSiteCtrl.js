var express = require('express');
var request = require('request');
var requestp = require('request-promise');
var config = require('../config');
var session = require('express-session')
var chalk = require('chalk');

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
	let cookieJar = request.jar();

	fetchCookie(req.body.username, req.body.password, cookieJar)
	.then( fetchRes => {
		// Checking if login is succefull
		if (/\?error=1/.exec(fetchRes.body)) throw 'failed login';
		return req.session.cookies = cookieJar.getCookieString(fetchRes.request.href);
	})
	.then(fetchUserDetails)
	.then( fetchRes => parseUserDetails(fetchRes.body))
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
	// If user not logged in redirect to login page
	if(!isLoggedIn(req)) return res.redirect('/login');

	fetchProject(req.session.cookies)
	.then( fetchRes => parseProject(fetchRes.body))
	.then( projects => {
		// console.log(response.body)
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
		loggedIn : user,
		helpers : {
			username : user
		},
		method : { id : methodId },
		survey : { id : surveyId }
	});
};

exports.createTaxonRecord = function(req, res) {

	let url = 'https://vba.dse.vic.gov.au/vba/vba/sc/IDACall?isc_rpc=1&isc_v=SC_SNAPSHOT-2010-08-03&isc_xhr=1';
	let cookie = req.session.cookies;
	let typeCde = req.body.typeCde;
	let observerId = req.session.userUid;
	let taxonId = req.body.taxonId;
	let componentId = req.params.methodId;
	let surveyId = req.params.surveyId;
	let totalCount = req.body.count;

	console.log(chalk.green(JSON.stringify({
		typeCde: typeCde,
		observerId: observerId,
		taxonId: taxonId,
		componentId: componentId,
		surveyId: surveyId,
		totalCount: totalCount
	}, null, 4)));


	//Lets configure and request
	let header = {
		'Host': 'vba.dse.vic.gov.au',
		'Connection': 'keep-alive',
		'Cache-Control': 'max-age=0',
		'Origin': 'https://vba.dse.vic.gov.au',
		'Upgrade-Insecure-Requests': '1',
		'Cookie': cookie
	}

	let options = {
		method: 'POST',
		resolveWithFullResponse: true,
		simple: false,
		url: url,
		headers: header,
		form: {
			_transaction: `<transaction
				xmlns:xsi="http://www.w3.org/2000/10/XMLSchema-instance" xsi:type="xsd:Object">
				<operations xsi:type="xsd:List">
					<elem xsi:type="xsd:Object">
						<values xsi:type="xsd:Object">
							<observerId xsi:type="xsd:long">${observerId}</observerId>
							<taxonIdAdd xsi:type="xsd:long">${taxonId}</taxonIdAdd>
							<typeCde>${typeCde}</typeCde>
							<totalCountInt xsi:type="xsd:long">${totalCount}</totalCountInt>
							<surveyComponent xsi:type="xsd:Object">
								<componentId xsi:type="xsd:long">${componentId}</componentId>
								<survey xsi:type="xsd:Object">
									<surveyId xsi:type="xsd:long">${surveyId}</surveyId>
								</survey>
							</surveyComponent>
						</values>
						<operationConfig xsi:type="xsd:Object">
							<dataSource>TaxonRecorded_DS</dataSource>
							<operationType>custom</operationType>
						</operationConfig>
						<componentId>isc_DynamicForm_17</componentId>
						<appID>builtinApplication</appID>
						<operation>saveTaxonRecorded</operation>
						<oldValues xsi:type="xsd:Object">
							<observerId xsi:type="xsd:long">${observerId}</observerId>
							<taxonIdAdd xsi:type="xsd:long">${taxonId}</taxonIdAdd>
							<typeCde>${typeCde}</typeCde>
							<totalCountInt xsi:type="xsd:long">${totalCount}</totalCountInt>
							<surveyComponent xsi:type="xsd:Object">
								<componentId xsi:type="xsd:long">${componentId}</componentId>
								<survey xsi:type="xsd:Object">
									<surveyId xsi:type="xsd:long">${surveyId}</surveyId>
								</survey>
							</surveyComponent>
						</oldValues>
					</elem>
				</operations>
			</transaction>`,
			protocolVersion: '1.0'
		}
	}

	requestp(options)
	.then (response => {
		console.log(chalk.green(JSON.stringify(response, null, 4)));
		res.redirect(`/survey/${surveyId}/species`);
	})
};

exports.surveys = function(req, res) {
	// If user not logged in redirect to login page
	if(!isLoggedIn(req)) return res.redirect('/login');

	let projectId = req.params.id;
	let cookie = req.session.cookies;

	fetchSurveysList(projectId, cookie)
	.then( fetchRes => parseSurveys(fetchRes.body))
	.then( surveys => {
		// console.log(response.body)
		console.log(`project #${chalk.green(projectId)} -> survey found : ${chalk.green(surveys.length)}.`)
		// To-do pagination
		// create an Array of requests
		let surveysRequests = surveys.map((survey) => {
			return new Promise((resolve) => {
				fetchSurvey(survey.id, req.session.cookies)
				.then( fetchRes => resolve(parseSurvey(fetchRes.body)))
			})
		});

		Promise.all(surveysRequests)
		.then( surveyData => {
			// console.log(chalk.red(surveyData))
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

	fetchSurveyMethods(surveyId, cookie)
	.then(fetchRes => parseSurveyMethod(fetchRes.body))
	.then((surveyMethods) => {

		// fetchMethodDetail
		let methodDetail = new Promise((resolve) => {
			fetchMethodDetail(surveyMethods.methodId, cookie)
			.then( fetchRes => resolve(parseMethodDetail(fetchRes.body)))
		});

		// fetchMethodTaxonList
		let taxonList = new Promise((resolve) => {
			fetchMethodTaxonList(surveyMethods.methodId, cookie)
			.then( fetchRes => resolve(parseTaxonList(fetchRes.body)));
		});

		Promise.all([methodDetail, taxonList])
		.then( PromisesArr => {
			let methodDetail = PromisesArr[0];
			let taxonList = PromisesArr[1];
			let user = isLoggedIn(req);

			console.log(`Taxon list : ${chalk.green(taxonList.length)} record found`);
			console.log(chalk.yellow(JSON.stringify(methodDetail, null, 4)));

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
				area: methodDetail.measurementValueNum,
				dateDisplay: !!(methodDetail.firstDateSdt || methodDetail.secondDateSdt),
				start: methodDetail.firstDateSdt,
				end: methodDetail.secondDateSdt,
				species: taxonList.length
			};

			console.log(chalk.cyan(JSON.stringify(method, null, 4)));
			res.render('species', {
				loggedIn : !!user,
				helpers : {
					username : user,
				},
				taxon: taxonList,
				method : method,
				survey : { id : surveyId}
			});
		})
	})
};

exports.newProject = function(req, res) {
	// console.log(req.session.cookies)
	res.redirect('/survey');
};

let isLoggedIn = function(req) {
	return req.session.username || false
}

let fetchUserDetails = function(cookie) {
	console.log(chalk.red(cookie))
	debugger;
	// This function is doing both the fetching and parsing, need to be splited up
	let url = 'https://vba.dse.vic.gov.au/vba/vba/sc/IDACall?isc_rpc=1&isc_v=SC_SNAPSHOT-2010-08-03&isc_xhr=1'
	let header = {
		'Host': 'vba.dse.vic.gov.au',
		'Connection': 'keep-alive',
		'Cache-Control': 'max-age=0',
		'Origin': 'https://vba.dse.vic.gov.au',
		'Upgrade-Insecure-Requests': '1',
		'Cookie': cookie
	}
	let options = {
		resolveWithFullResponse: true,
		simple: false,
		url: url,
		method: 'POST',
		headers: header,
		form: {
			_transaction: `
			<transaction
					xmlns:xsi="http://www.w3.org/2000/10/XMLSchema-instance" xsi:type="xsd:Object">
					<operations xsi:type="xsd:List">
						<elem xsi:type="xsd:Object">
							<criteria xsi:type="xsd:Object"></criteria>
							<operationConfig xsi:type="xsd:Object">
								<dataSource>UserSessionDetail_DS</dataSource>
								<operationType>fetch</operationType>
							</operationConfig>
							<appID>builtinApplication</appID>
							<operation>UserSessionDetail_DS_fetch</operation>
						</elem>
					</operations>
				</transaction>`,
			protocolVersion: '1.0'
		}
	}
	return requestp(options)
}

let parseUserDetails = function(string) {
	console.log(chalk.yellow(JSON.stringify(string, null, 4)));

	// let match = /displayName:"(.*?)"/.exec(string);
	// userUid:
	let regexs = {
		displayName: /displayName:"(.*?)"/,
		userUid: /userUid:(\d*)/
	}
	return execRegex(regexs, string);
};

let parseProject = function(string){
	// do some regex
	let str = string;
	let m;
	let projects = [];

	// what a terrible name for an array of regex...
	// /projectId:(\d*),projectNme:"/g could be use to increase security, I guess..
	let regexs = {
		projectId: /projectId:(\d*),/g,
		start: /projectStartSdt:Date\.parseServerDate\((\d*),(\d*),(\d*)\)/g,
		end: /projectEndSdt:Date\.parseServerDate\((\d*),(\d*),(\d*)\)/g,
		title: /projectNme:"([\s\S]*?)",projectStartSdt:/g,
		desc: /projectDesc:"([\s\S]*?)",projectEndSdt/g ,
	}

	// Executing every regex until no more matchs
	while ((m = regexs.projectId.exec(str)) !== null) {
		if (m.index === regexs.projectId.lastIndex) {
				regexs.projectId.lastIndex++;
		}
		// console.log(m);
		let id = m;
		let title = regexs.title.exec(str);
		let desc 	= regexs.desc.exec(str);
		let start = regexs.start.exec(str);
		let end 	= regexs.end.exec(str);

		projects.push({	title: 	title[1] ,
										id: 		id[1],
										desc: 	desc[1],
										end: 		end === null ? '...' : `${end[2]}/${end[3]}/${end[1]}`,
										start: `${start[2]}/${start[3]}/${start[1]}`
		});
	}
	return projects;
};

let parseSurveys = function(string){
	// do some regex
	let str = string;
	let m;
	let surveys = [];
	let decodeStatus = function (status) {
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
	}

	// what a terrible name for an array of regex...
	// /projectId:(\d*),projectNme:"/g could be use to increase security, I guess..
	let regexs = {
		surveyId: /surveyId:(\d*),/g,
		start: /surveyStartSdt:Date\.parseServerDate\((\d*),(\d*),(\d*)\)/g,
		end: /surveyEndSdt:Date\.parseServerDate\((\d*),(\d*),(\d*)\)/g,
		title: /surveyNme:"([\s\S]*?)",/g,
		status: /expertReviewStatusCde:"([\s\S]*?)"/g
	}
	
	// Executing every regex until no more matchs
	while ((m = regexs.surveyId.exec(str)) !== null) {
		if (m.index === regexs.surveyId.lastIndex) {
				regexs.surveyId.lastIndex++;
		}
		
		// create an object with the regex results
		let re = { id: m }
		for (let prop in regexs) {
			if (prop !== 'surveyId')
				re[prop] = regexs[prop].exec(str);
		}
		// console.log(`regex done for survey # ${re.id[1]}`)
		surveys.push({	
			title: 	re.title[1],
			id: 		re.id[1],
			status: decodeStatus(re.status[1]),
			end: 		re.end !== null ? `${re.end[2]}/${re.end[3]}/${re.end[1]}` : '...',
			start: 	`${re.start[2]}/${re.start[3]}/${re.start[1]}`
		});
	}
	// console.log(surveys)
	return surveys;
};

let parseSurvey = function(string){
	// do some regex
	let str = string;
	// what a terrible name for an array of regex...
	let regexs = {
		surveyId: /surveyId:(\d*),/g,
		surveyStart: /surveyStartSdt:Date\.parseServerDate\((\d*),(\d*),(\d*)\)/g,
		surveyEnd: /surveyEndSdt:Date\.parseServerDate\((\d*),(\d*),(\d*)\)/g,
		surveyNme: /surveyNme:"([\s\S]*?)",/g,
		surveyComm: /surveyCommentTxt:"([\s\S]*?)"/g,
		siteId: /siteId:(\d*),/g,
		siteName: /siteNme:"([\s\S]*?)"/g,
		siteDesc: /siteLocationDesc:"([\s\S]*?)"/g,
		lat: /latitudeddNum:(.*?),/g,
		long: /longitudeddNum:(.*?),/g,
		accu: /latLongAccuracyddNum:(.*?),/g,
	}

	// create an object with the regex results
	let re = {}
	for (let prop in regexs) {
		re[prop] = regexs[prop].exec(str)
	}

	return {
					surveyId: 		re.surveyId[1],
					surveyStart: 	`${re.surveyStart[2]}/${re.surveyStart[3]}/${re.surveyStart[1]}`,
					surveyEnd: 		re.surveyEnd === null ? '...' : `${re.surveyEnd[2]}/${re.surveyEnd[3]}/${re.surveyEnd[1]}`,
					surveyNme: 		re.surveyNme !== null ? re.surveyNme[1]: 'Unknow survey name',
					surveyComm: 	re.surveyComm !== null ? re.surveyComm[1]: 'No comments provided',
					siteId: 			re.siteId[1],
					siteDesc: 		re.siteDesc !== null ? re.siteDesc[1] : 'No site description provided',
					lat: 					re.lat[1],
					long: 				re.long[1],
					siteId: 			re.siteId[1],
					accu: 				re.accu[1]
	};
};

let parseSurveyMethod = function(string) {

	let regexs = {
		methodId: /componentId:(\d*)/g,
		samplingMethodDesc: /samplingMethodDesc:"([\s\S]*?)"/,
		disciplineCde: /disciplineCde:"(.*?)"/, 
	}

	return execRegex(regexs, string)
};

let parseTaxonList = function(string) {
	// do some regex
	let str = string;
	let m;
	let taxonList = [];

	// what a terrible name for an array of regex...
	let regexs = {
		taxonId: /taxonId:(\d*)/g,
		scientificNme: /scientificNme:"([\s\S]*?)"/g,
		commonNme: /commonNme:"([\s\S]*?)"/g,
		disciplineCde: /disciplineCde:"(.*?)"/g,
		totalCountInt: /totalCountInt:(\d*)/g
	}

	// create an object with the regex results
	// Executing every regex until no more matchs
	while ((m = regexs.taxonId.exec(str)) !== null) {
		if (m.index === regexs.taxonId.lastIndex) {
				regexs.taxonId.lastIndex++;
		}
		
		// create an object with the regex results
		// loop thru the regexs obj, except for the taxonId 
		let re = { taxonId: m }
		for (let prop in regexs) {
			if (prop !== 'taxonId')
				re[prop] = regexs[prop].exec(str);
		}
		taxonList.push({	
			taxonId: 				re.taxonId[1],
			scientificNme: 	re.scientificNme[1],
			commonNme: re.commonNme !== null ? re.commonNme[1] : '',
			disciplineCde: 	re.disciplineCde[1],
			totalCountInt: 	re.totalCountInt[1]
		});
	}
	// console.log(str)
	return taxonList;
};

let parseMethodDetail = function(string) {
	console.log(chalk.gray(string))
	// do some regex
	// let str = string;
	// let m;
	// let taxonList = [];

	// what a terrible name for an array of regex...
	let regexs = {
		componentId: /componentId:(\d*)/,
		measurementValueNum: /measurementValueNum:(\d*)/,
		samplingDetailCde: /samplingDetailCde:"(\d*)"/,
		scCommentTxt: /scCommentTxt:"([\s\S]*?)"/g,
		firstDateSdt: /firstDateSdt:Date\.parseServerDate\((\d*),(\d*),(\d*)\)/,
		secondDateSdt: /secondDateSdt:Date\.parseServerDate\((\d*),(\d*),(\d*)\)/,
		firstTimeSdt: /firstTimeSdt:"(\d*)"/,
		secondTimeSdt: /secondTimeSdt:"(\d*)"/,
	}
	return execRegex(regexs, string)
	// create an object with the regex results
	// let re = {}

	// for (let prop in regexs) {
	// 	let result = regexs[prop].exec(str)
	// 	if (result) {
	// 		if (result.length === 2) {
	// 			result = result[1]
	// 		} else result = result.slice(1)
	// 	}
	// 	re[prop] = result
	// }

	// return re;
};

let fetchCookie = function(username, password, jar) {
	let url = 'https://vba.dse.vic.gov.au/vba/login';
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
			username: username,
			password: password
		}
	}
	return requestp(options)
};

let fetchProject = function(cookie){
	let url = 'https://vba.dse.vic.gov.au/vba/vba/sc/IDACall?isc_rpc=1&isc_v=SC_SNAPSHOT-2010-08-03&isc_xhr=1'
	//Lets configure and request
	let header = {
		'Host': 'vba.dse.vic.gov.au',
		'Connection': 'keep-alive',
		'Cache-Control': 'max-age=0',
		'Origin': 'https://vba.dse.vic.gov.au',
		'Upgrade-Insecure-Requests': '1',
		'Cookie': cookie
	}

	let options = {
		method: 'POST',
		resolveWithFullResponse: true,
		simple: false,
		url: url,
		headers: header,
		form: {
			// <transaction xmlns:xsi="http://www.w3.org/2000/10/XMLSchema-instance" xsi:type="xsd:Object"><transactionNum xsi:type="xsd:long">194</transactionNum><operations xsi:type="xsd:List"><elem xsi:type="xsd:Object"><criteria xsi:type="xsd:Object"><projectStatusCde>pub</projectStatusCde><isMyProjectSearch xsi:type="xsd:boolean">true</isMyProjectSearch></criteria><operationConfig xsi:type="xsd:Object"><dataSource>Project_DS</dataSource><operationType>fetch</operationType><textMatchStyle>exact</textMatchStyle></operationConfig><startRow xsi:type="xsd:long">0</startRow><endRow xsi:type="xsd:long">75</endRow><componentId>isc_ManageProjectModule$2_2</componentId><appID>builtinApplication</appID><operation>mainProjectSearch</operation><oldValues xsi:type="xsd:Object"><projectStatusCde>pub</projectStatusCde><isMyProjectSearch xsi:type="xsd:boolean">true</isMyProjectSearch></oldValues></elem></operations></transaction>
			_transaction: `
			<transaction
						xmlns:xsi="http://www.w3.org/2000/10/XMLSchema-instance" xsi:type="xsd:Object">
						<operations xsi:type="xsd:List">
							<elem xsi:type="xsd:Object">
								<criteria xsi:type="xsd:Object">
									<projectStatusCde>pub</projectStatusCde>
									<isMyProjectSearch xsi:type="xsd:boolean">true</isMyProjectSearch>
								</criteria>
								<operationConfig xsi:type="xsd:Object">
									<dataSource>Project_DS</dataSource>
									<operationType>fetch</operationType>
									<textMatchStyle>exact</textMatchStyle>
								</operationConfig>
								<startRow xsi:type="xsd:long">0</startRow>
								<endRow xsi:type="xsd:long">75</endRow>
								<componentId>isc_ManageProjectModule$2_2</componentId>
								<appID>builtinApplication</appID>
								<operation>mainProjectSearch</operation>
							</elem>
						</operations>
					</transaction>
			`,
			protocolVersion: '1.0'
		}
	}
	return requestp(options)
};

let fetchSurvey = function(surveyId, cookie) {
	console.log(`fetching survey #${surveyId}`)
	let url = 'https://vba.dse.vic.gov.au/vba/vba/sc/IDACall?isc_rpc=1&isc_v=SC_SNAPSHOT-2010-08-03&isc_xhr=1'
	let header = {
		'Host': 'vba.dse.vic.gov.au',
		'Connection': 'keep-alive',
		'Cache-Control': 'max-age=0',
		'Origin': 'https://vba.dse.vic.gov.au',
		'Upgrade-Insecure-Requests': '1',
		'Cookie': cookie
	}
	let options = {
		method: 'POST',
		resolveWithFullResponse: true,
		simple: false,
		url: url,
		headers: header,
		form: {
			_transaction: `
			<transaction
				xmlns:xsi="http://www.w3.org/2000/10/XMLSchema-instance" xsi:type="xsd:Object">
				<transactionNum xsi:type="xsd:long">36</transactionNum>
				<operations xsi:type="xsd:List">
					<elem xsi:type="xsd:Object">
						<criteria xsi:type="xsd:Object">
							<surveyId>${surveyId}</surveyId>
						</criteria>
						<operationConfig xsi:type="xsd:Object">
							<dataSource>Survey_DS</dataSource>
							<operationType>fetch</operationType>
						</operationConfig>
						<appID>builtinApplication</appID>
						<operation>fetchSurvey</operation>
						<oldValues xsi:type="xsd:Object">
							<surveyId>${surveyId}</surveyId>
						</oldValues>
					</elem>
				</operations>
			</transaction>`,
			protocolVersion: '1.0'
		}
	}
	return requestp(options)
};

let fetchSurveysList = function(projectId, cookie) {
	let url = 'https://vba.dse.vic.gov.au/vba/vba/sc/IDACall?isc_rpc=1&isc_v=SC_SNAPSHOT-2010-08-03&isc_xhr=1'
	let header = {
		'Host': 'vba.dse.vic.gov.au',
		'Connection': 'keep-alive',
		'Cache-Control': 'max-age=0',
		'Origin': 'https://vba.dse.vic.gov.au',
		'Upgrade-Insecure-Requests': '1',
		'Cookie': cookie
	}
	let options = {
		method: 'POST',
		resolveWithFullResponse: true,
		simple: false,
		url: url,
		headers: header,
		form: {
			_transaction: `
			<transaction
				xmlns:xsi="http://www.w3.org/2000/10/XMLSchema-instance" xsi:type="xsd:Object">
				<transactionNum xsi:type="xsd:long">50</transactionNum>
				<operations xsi:type="xsd:List">
					<elem xsi:type="xsd:Object">
						<criteria xsi:type="xsd:Object">
							<projectId>${projectId}</projectId>
						</criteria>
						<operationConfig xsi:type="xsd:Object">
							<dataSource>Survey_DS</dataSource>
							<operationType>fetch</operationType>
							<textMatchStyle>exact</textMatchStyle>
						</operationConfig>
						<startRow xsi:type="xsd:long">0</startRow>
						<endRow xsi:type="xsd:long">10</endRow>
						<componentId>isc_SearchSurveyWindow$2_6</componentId>
						<appID>builtinApplication</appID>
						<operation>viewSurveySheetMain</operation>
					</elem>
				</operations>
			</transaction>`,
			protocolVersion: '1.0'
		}
	}
	return requestp(options)
};

let fetchSurveyMethods = function(surveyId, cookie) {
	let url = 'https://vba.dse.vic.gov.au/vba/vba/sc/IDACall?isc_rpc=1&isc_v=SC_SNAPSHOT-2010-08-03&isc_xhr=1'
	let header = {
		'Host': 'vba.dse.vic.gov.au',
		'Connection': 'keep-alive',
		'Cache-Control': 'max-age=0',
		'Origin': 'https://vba.dse.vic.gov.au',
		'Upgrade-Insecure-Requests': '1',
		'Cookie': cookie
	}
	let options = {
		method: 'POST',
		resolveWithFullResponse: true,
		simple: false,
		url: url,
		headers: header,
		form: {
			_transaction: `
			<transaction
				xmlns:xsi="http://www.w3.org/2000/10/XMLSchema-instance" xsi:type="xsd:Object">
				<transactionNum xsi:type="xsd:long">110</transactionNum>
				<operations xsi:type="xsd:List">
					<elem xsi:type="xsd:Object">
						<criteria xsi:type="xsd:Object">
							<surveyId>${surveyId}</surveyId>
						</criteria>
						<operationConfig xsi:type="xsd:Object">
							<dataSource>SurveyComponent_DS</dataSource>
							<operationType>fetch</operationType>
							<textMatchStyle>exact</textMatchStyle>
						</operationConfig>
						<startRow xsi:type="xsd:long">0</startRow>
						<endRow xsi:type="xsd:long">75</endRow>
						<componentId>isc_TaxonRecordedSummaryTab$20_0</componentId>
						<appID>builtinApplication</appID>
						<operation>fetchSurveyComponentBySurveyID</operation>
						<oldValues xsi:type="xsd:Object">
							<surveyId>${surveyId}</surveyId>
						</oldValues>
					</elem>
				</operations>
			</transaction>`,
			protocolVersion: '1.0'
		}
	}
	return requestp(options)
};

let fetchMethodTaxonList = function(methodID, cookie) {
	let url = 'https://vba.dse.vic.gov.au/vba/vba/sc/IDACall?isc_rpc=1&isc_v=SC_SNAPSHOT-2010-08-03&isc_xhr=1'
	let header = {
		'Host': 'vba.dse.vic.gov.au',
		'Connection': 'keep-alive',
		'Cache-Control': 'max-age=0',
		'Origin': 'https://vba.dse.vic.gov.au',
		'Upgrade-Insecure-Requests': '1',
		'Cookie': cookie
	}
	let options = {
		method: 'POST',
		resolveWithFullResponse: true,
		simple: false,
		url: url,
		headers: header,
		form: {
			_transaction:`<transaction
		xmlns:xsi="http://www.w3.org/2000/10/XMLSchema-instance" xsi:type="xsd:Object">
		<transactionNum xsi:type="xsd:long">30</transactionNum>
		<operations xsi:type="xsd:List">
			<elem xsi:type="xsd:Object">
				<criteria xsi:type="xsd:Object">
					<componentId>${methodID}</componentId>
				</criteria>
				<operationConfig xsi:type="xsd:Object">
					<dataSource>SurveyCompSummaryView_DS</dataSource>
					<operationType>fetch</operationType>
					<textMatchStyle>exact</textMatchStyle>
				</operationConfig>
				<startRow xsi:type="xsd:long">0</startRow>
				<endRow xsi:type="xsd:long">75</endRow>
				<componentId>isc_TaxonRecordedSummaryTab$23_0</componentId>
				<appID>builtinApplication</appID>
				<operation>fetchDataForSC</operation>
			</elem>
		</operations>
	</transaction>`,
	protocolVersion: '1.0'
		}
	}
	return requestp(options)
};

let fetchMethodDetail = function(methodID, cookie) {
	let url = 'https://vba.dse.vic.gov.au/vba/vba/sc/IDACall?isc_rpc=1&isc_v=SC_SNAPSHOT-2010-08-03&isc_xhr=1'
	let header = {
		'Host': 'vba.dse.vic.gov.au',
		'Connection': 'keep-alive',
		'Cache-Control': 'max-age=0',
		'Origin': 'https://vba.dse.vic.gov.au',
		'Upgrade-Insecure-Requests': '1',
		'Cookie': cookie
	}
	let options = {
		method: 'POST',
		resolveWithFullResponse: true,
		simple: false,
		url: url,
		headers: header,
		form: {
			_transaction: `
			<transaction
				xmlns:xsi="http://www.w3.org/2000/10/XMLSchema-instance" xsi:type="xsd:Object">
				<transactionNum xsi:type="xsd:long">35</transactionNum>
				<operations xsi:type="xsd:List">
					<elem xsi:type="xsd:Object">
						<criteria xsi:type="xsd:Object">
							<SURVEY_COMPONENT_ID xsi:type="xsd:long">${methodID}</SURVEY_COMPONENT_ID>
						</criteria>
						<operationConfig xsi:type="xsd:Object">
							<dataSource>CSamplingMethodDetail_DS</dataSource>
							<operationType>fetch</operationType>
						</operationConfig>
						<appID>builtinApplication</appID>
						<operation>CSamplingMethodDetail_DS_fetch</operation>
						<oldValues xsi:type="xsd:Object">
							<SURVEY_COMPONENT_ID xsi:type="xsd:long">${methodID}</SURVEY_COMPONENT_ID>
						</oldValues>
					</elem>
				</operations>
			</transaction>`,
			protocolVersion: '1.0'
		}
	}
	return requestp(options)
};

let postNewTaxonRecord = function(methodID, cookie) {
	let url = 'https://vba.dse.vic.gov.au/vba/vba/sc/IDACall?isc_rpc=1&isc_v=SC_SNAPSHOT-2010-08-03&isc_xhr=1'
	let header = {
		'Host': 'vba.dse.vic.gov.au',
		'Connection': 'keep-alive',
		'Cache-Control': 'max-age=0',
		'Origin': 'https://vba.dse.vic.gov.au',
		'Upgrade-Insecure-Requests': '1',
		'Cookie': cookie
	}
	let options = {
		method: 'POST',
		resolveWithFullResponse: true,
		simple: false,
		url: url,
		headers: header,
		form: {
			_transaction: `
			<transaction
				xmlns:xsi="http://www.w3.org/2000/10/XMLSchema-instance" xsi:type="xsd:Object">
				<transactionNum xsi:type="xsd:long">35</transactionNum>
				<operations xsi:type="xsd:List">
					<elem xsi:type="xsd:Object">
						<criteria xsi:type="xsd:Object">
							<SURVEY_COMPONENT_ID xsi:type="xsd:long">${methodID}</SURVEY_COMPONENT_ID>
						</criteria>
						<operationConfig xsi:type="xsd:Object">
							<dataSource>CSamplingMethodDetail_DS</dataSource>
							<operationType>fetch</operationType>
						</operationConfig>
						<appID>builtinApplication</appID>
						<operation>CSamplingMethodDetail_DS_fetch</operation>
						<oldValues xsi:type="xsd:Object">
							<SURVEY_COMPONENT_ID xsi:type="xsd:long">${methodID}</SURVEY_COMPONENT_ID>
						</oldValues>
					</elem>
				</operations>
			</transaction>`,
			protocolVersion: '1.0'
		}
	}
	return requestp(options)
};

let execRegex = function(regexs, string) {
	let re = {}
	for (let prop in regexs) {
		let result = regexs[prop].exec(string)
		if (result) {
			result.length === 2 ? result = result[1] : result = result.slice(1)
		}
		re[prop] = result
	}
	return re;
}





