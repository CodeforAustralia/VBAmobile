var express = require('express');
var request = require('request');
var requestp = require('request-promise');
var config = require('../config');
var session = require('express-session')

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
	// Checking if login is succefull
	.then(function(response){
		// looking for ?error=1 in the body, is not found login was succesfull
		let str = response.body
		let re = /\?error=1/
		if (re.exec(str)) throw 'failed login';
		return response;
	})
	// procces the response, extract cookie and pass it on
	.then(function(response) {
		// console.log(response)
		let cookies = jar.getCookies(url);
		return cookies
	})
	// Fetch the User Details this will make an extra http request
	.then(getUserSessionDetail)
	// setup session cookies and redirect to '/'
	.then(function(name) {
		let sess = req.session;
		sess.username = name;
		// convert vba login cookie to string and store into the vbamobile cookie.
		sess.cookies = jar.getCookieString(url);
		res.redirect('/')
	})
	.catch(function (err) {
	  console.log(err)
	  // need to let the user know login failled, this is bad ux
	  if (err === 'failed login') res.redirect('/login');
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
	// If user not logged in redirect to login page
	if(!isLoggedIn(req)) return res.redirect('/login');

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

	console.log(options)

	requestp(options)
	.then(function(response) {
		console.log(response.body)
		let projects = parseProject(response.body)
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

exports.surveysPage = function(req, res) {
	// If user not logged in redirect to login page
	if(!isLoggedIn(req)) return res.redirect('/login');

	let url = 'https://vba.dse.vic.gov.au/vba/vba/sc/IDACall?isc_rpc=1&isc_v=SC_SNAPSHOT-2010-08-03&isc_xhr=1'
	//Lets configure and request
	// console.log(req.session.cookies);
	let projectID = req.params.id;

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
			_transaction: `
			<transaction
				xmlns:xsi="http://www.w3.org/2000/10/XMLSchema-instance" xsi:type="xsd:Object">
				<transactionNum xsi:type="xsd:long">50</transactionNum>
				<operations xsi:type="xsd:List">
					<elem xsi:type="xsd:Object">
						<criteria xsi:type="xsd:Object">
							<projectId>${projectID}</projectId>
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

	requestp(options)
	.then(function(response) {
		// console.log(response.body)
		let surveys = parseSurveys(response.body)
		let user = isLoggedIn(req);
		
		console.log(`${user} requested surveys list for project #${projectID}\n${surveys.length} found.`)

		res.render('surveys', {
  		loggedIn : user,
  		helpers : {
  			username : user
  		},
  		// only return the first 10...
  		survey: surveys.splice(0,10)
		});
	})
	.catch(function (err) {
      console.log(err) 
    });
};

exports.surveys = function(req, res) {
	// If user not logged in redirect to login page
	if(!isLoggedIn(req)) return res.redirect('/login');

	let projectID = req.params.id;
	let url = 'https://vba.dse.vic.gov.au/vba/vba/sc/IDACall?isc_rpc=1&isc_v=SC_SNAPSHOT-2010-08-03&isc_xhr=1'
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
			_transaction: `
			<transaction
				xmlns:xsi="http://www.w3.org/2000/10/XMLSchema-instance" xsi:type="xsd:Object">
				<transactionNum xsi:type="xsd:long">50</transactionNum>
				<operations xsi:type="xsd:List">
					<elem xsi:type="xsd:Object">
						<criteria xsi:type="xsd:Object">
							<projectId>${projectID}</projectId>
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
	requestp(options)
	.then(function(response) {
		// console.log(response.body)
		let surveys = parseSurveys(response.body)
		console.log(`project #${projectID} -> survey found : ${surveys.length}.`)

		let surveysIdList = surveys.map(function(survey) {
			return survey.id
		})
		console.log(surveysIdList)

		let surveysData = []
		let surveysDataRequest = surveysIdList.map((id) => {

			return new Promise((resolve) => {
				fetchSurvey(id, req.session.cookies)
					.then(function(response) {
						console.log(response.body)
						return parseSurvey(response.body)
					})
					.then((surveys) => {
						console.log(surveys);
						surveysData.push(surveys)
						resolve()
					})
			})
		});

		Promise.all(surveysDataRequest).then(() => {
			console.log(surveysData)
			let user = isLoggedIn(req);

			res.render('survey', {
	  		loggedIn : user,
	  		helpers : {
	  			username : user
	  		},
	  		// only return the first 10...
	  		survey: surveysData
			});
		})

	})
	.catch(function (err) {
      console.log(err) 
    });
};

exports.newProject = function(req, res) {
	// console.log(req.session.cookies)
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

let isLoggedIn = function(req) {return req.session.username || false;
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
	.then(function(response) {
		let regex = /displayName:("(.*?)")/; 
		let match = regex.exec(response.body);
 		// console.log('displayName: ' + match[2])
 		return match[2];
	})
	// Handle failed request... need to work on this one 
	.catch(function (err) {
      console.log(err) 
    });
}

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
}

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
				return 'Unknow'
		}
	}

	// what a terrible name for an array of regex...
	// /projectId:(\d*),projectNme:"/g could be use to increase security, I guess..
	let regexs = {
		surveyId: /surveyId:(\d*),/g,
		start: /surveyStartSdt:Date\.parseServerDate\((\d*),(\d*),(\d*)\)/g,
		end: /surveyEndSdt:Date\.parseServerDate\((\d*),(\d*),(\d*)\)/g,
		title: /surveyNme:"([\s\S]*?)",/g,
		status: /expertReviewStatusCde:"([\s\S]*?)"/g ,
	}
	console.time("re");
	// Executing every regex until no more matchs
	while ((m = regexs.surveyId.exec(str)) !== null) {
	  if (m.index === regexs.surveyId.lastIndex) {
	      regexs.surveyId.lastIndex++;
	  }
	  
	  let id = m;
	  let title = regexs.title.exec(str);
	  let status 	= regexs.status.exec(str);
	  let start = regexs.start.exec(str);
	  let end 	= regexs.end.exec(str);
	  // debugger;
		surveys.push({	title: 	title[1] || 'Unknow title' ,
										id: 		id[1],
										status: 	decodeStatus(status[1]),
										end: 		end === null ? '...' : `${end[2]}/${end[3]}/${end[1]}`,
										start: `${start[2]}/${start[3]}/${start[1]}`
		});
	}
	console.timeEnd("re");
	return surveys;
}

let parseSurvey = function(string){
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
				return 'Unknow'
		}
	}

	// what a terrible name for an array of regex...
	// /projectId:(\d*),projectNme:"/g could be use to increase security, I guess..
	let regexs = {
		surveyId: /surveyId:(\d*),/g,
		start: /surveyStartSdt:Date\.parseServerDate\((\d*),(\d*),(\d*)\)/g,
		end: /surveyEndSdt:Date\.parseServerDate\((\d*),(\d*),(\d*)\)/g,
		title: /surveyNme:"([\s\S]*?)",/g,
		status: /expertReviewStatusCde:"([\s\S]*?)"/g ,
		comment: /surveyCommentTxt:"([\s\S]*?)"/g,
		siteId: /siteId:"(\d*)"/g
	}

  let title = regexs.title.exec(str);
  let status 	= regexs.status.exec(str);
  let start = regexs.start.exec(str);
  let end 	= regexs.end.exec(str);
  // debugger;
	surveys.push({	title: 	title[1] || 'Unknow title' ,
									status: 	decodeStatus(status[1]),
									end: 		end === null ? '...' : `${end[2]}/${end[3]}/${end[1]}`,
									start: `${start[2]}/${start[3]}/${start[1]}`
	});
	
	return surveys;
}

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




