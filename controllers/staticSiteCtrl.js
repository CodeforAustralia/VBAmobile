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
		let cookies = jar.getCookies(url);
		return cookies
	})
	// Fetch the User Details this will make an extra http request
	.then(fetchUserDetails)
	// setup session cookies and redirect to '/'
	.then(function(name) {
		req.session.username = name;
		// convert vba cookie to string and store into the vbamobile cookie.
		req.session.cookies = jar.getCookieString(url);
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

// exports.surveysPage = function(req, res) {
// 	// If user not logged in redirect to login page
// 	if(!isLoggedIn(req)) return res.redirect('/login');

// 	let url = 'https://vba.dse.vic.gov.au/vba/vba/sc/IDACall?isc_rpc=1&isc_v=SC_SNAPSHOT-2010-08-03&isc_xhr=1'
// 	//Lets configure and request
// 	// console.log(req.session.cookies);
// 	let projectID = req.params.id;

// 	let header = {
// 		'Host': 'vba.dse.vic.gov.au',
// 		'Connection': 'keep-alive',
// 		'Cache-Control': 'max-age=0',
// 		'Origin': 'https://vba.dse.vic.gov.au',
// 		'Upgrade-Insecure-Requests': '1',
// 		'Cookie': req.session.cookies
// 	}
// 	let options = {
// 		method: 'POST',
// 		resolveWithFullResponse: true,
// 		simple: false,
// 		url: url,
// 		headers: header,
// 		form: {
// 			_transaction: `
// 			<transaction
// 				xmlns:xsi="http://www.w3.org/2000/10/XMLSchema-instance" xsi:type="xsd:Object">
// 				<transactionNum xsi:type="xsd:long">50</transactionNum>
// 				<operations xsi:type="xsd:List">
// 					<elem xsi:type="xsd:Object">
// 						<criteria xsi:type="xsd:Object">
// 							<projectId>${projectID}</projectId>
// 						</criteria>
// 						<operationConfig xsi:type="xsd:Object">
// 							<dataSource>Survey_DS</dataSource>
// 							<operationType>fetch</operationType>
// 							<textMatchStyle>exact</textMatchStyle>
// 						</operationConfig>
// 						<startRow xsi:type="xsd:long">0</startRow>
// 						<endRow xsi:type="xsd:long">10</endRow>
// 						<componentId>isc_SearchSurveyWindow$2_6</componentId>
// 						<appID>builtinApplication</appID>
// 						<operation>viewSurveySheetMain</operation>
// 					</elem>
// 				</operations>
// 			</transaction>`,
// 			protocolVersion: '1.0'
// 		}
// 	}

// 	requestp(options)
// 	.then(function(response) {
// 		// console.log(response.body)
// 		let surveys = parseSurveys(response.body)
// 		let user = isLoggedIn(req);
		
// 		console.log(`${user} requested surveys list for project #${projectID}\n${surveys.length} found.`)

// 		res.render('surveys', {
//   		loggedIn : user,
//   		helpers : {
//   			username : user
//   		},
//   		// only return the first 10...
//   		survey: surveys.splice(0,10)
// 		});
// 	})
// 	.catch(function (err) {
//       console.log(err) 
//     });
// };

exports.surveys = function(req, res) {
	// If user not logged in redirect to login page
	if(!isLoggedIn(req)) return res.redirect('/login');

	let projectId = req.params.id;
	let cookie = req.session.cookies;

	fetchSurveysList(projectId, cookie)
	.then((response) => {
		console.log(response.body)
		let surveysData = [];
		let surveys = parseSurveys(response.body);
		console.log(`project #${projectId} -> survey found : ${surveys.length}.`)

		let surveysIdList = surveys.map((survey) => {
			return survey.id;
		})

		// filter down to the first 15 survey
		// To-do pagination
		surveysIdList.splice(15);

		// create an Array of requests
		let surveysDataRequests = surveysIdList.map((id) => {
			return new Promise((resolve) => {
				fetchSurvey(id, req.session.cookies)
				.then((response) => {
					surveyData = parseSurvey(response.body)
					surveysData.push(surveyData)
					resolve()
				})
			})
		});

		Promise.all(surveysDataRequests).then(() => {
			console.log(surveyData)
			let user = isLoggedIn(req);
			res.render('surveys', {
	  		loggedIn : user,
	  		helpers : {
	  			username : user
	  		},
	  		survey: surveysData
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
	.then((response) => {

		let surveyMethods = parseSurveyMethod(response.body);
		fetchMethodTaxonList(surveyMethods.methodId, cookie)
		.then((response) => {
			let taxonList = parseTaxonList(response.body);
			// res.send(taxonList)
			console.log(taxonList);
			let user = isLoggedIn(req);
			res.render('species', {
	  		loggedIn : !!user,
	  		helpers : {
	  			username : user
	  		},
	  		taxon: taxonList
			});
		})
	})
};

exports.newProject = function(req, res) {
	// console.log(req.session.cookies)
	res.redirect('/survey');
};

// exports.surveyPage = function(req, res) {
// 	let user = isLoggedIn(req);
// 	res.render('survey', {
//   		loggedIn : user,
//   		helpers : {
//   			username : user
//   		}
// 	});
// };

let isLoggedIn = function(req) {return req.session.username || false;
}

let fetchUserDetails = function(cookies) {
	let url = 'https://vba.dse.vic.gov.au/vba/vba/sc/IDACall?isc_rpc=1&isc_v=SC_SNAPSHOT-2010-08-03&isc_xhr=1'
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
		console.log(`regex done for survey # ${re.id[1]}`)
		surveys.push({	
			title: 	re.title[1],
			id: 		re.id[1],
			status: decodeStatus(re.status[1]),
			end: 		re.end !== null ? `${re.end[2]}/${re.end[3]}/${re.end[1]}` : '...',
			start: 	`${re.start[2]}/${re.start[3]}/${re.start[1]}`
		});
	}
	console.log(surveys)
	return surveys;
}

let parseSurvey = function(string){
	// do some regex
	let str = string;
	let m;
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
	// do some regex
	let str = string;
	let m;
	// what a terrible name for an array of regex...
	let regexs = {
		methodId: /componentId:(\d*)/g,
		samplingMethodDesc: /samplingMethodDesc:"([\s\S]*?)"/g,
		disciplineCde: /disciplineCde:"(.*?)"/g,
	}

	// create an object with the regex results
	let re = {}
	for (let prop in regexs) {
		re[prop] = regexs[prop].exec(str)
	}

	return {
		methodId: 				re.methodId[1],
		samplingMethodDesc: re.samplingMethodDesc[1],
		disciplineCde: 			re.disciplineCde[1]
		// siteDesc: 		re.siteDesc !== null ? re.siteDesc[1] : 'No site description provided',
	};
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
			disciplineCde: 	re.disciplineCde[1],
			totalCountInt: 	re.totalCountInt[1]
		});
	}
	return taxonList;
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







