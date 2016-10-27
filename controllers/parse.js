const chalk = require('chalk');
const parse = {};

parse.userDetails = function(string) {
	let regexs = {
		displayName: /displayName:"(.*?)"/,
		userUid: /userUid:(\d*)/
	}

	let userDetails = this.findAllMatches(regexs, string);
	console.log(`User detail : `, chalk.yellow(JSON.stringify(string, null, 4)));
	return userDetails;
};

parse.project = function(string){
	let project;
	let projects = [];

	let regexs = {
		id: /projectId:(\d*),/g,
		start: /projectStartSdt:Date\.parseServerDate\((\d*),(\d*),(\d*)\)/g,
		end: /projectEndSdt:Date\.parseServerDate\((\d*),(\d*),(\d*)\)/g,
		title: /projectNme:"([\s\S]*?)",projectStartSdt:/g,
		desc: /projectDesc:"([\s\S]*?)",projectEndSdt/g ,
	};

	while ( project = this.findAllMatches(regexs, string) ) {
		console.log(project);
		// debugger;
		projects.push(project);
	};

	projects.forEach(function(project){
		let start = project.start;
		let end = project.end;
		project.start = `${start[1]}/${start[2]}/${start[0]}`;
		project.end = !!project.end ? `${end[1]}/${end[2]}/${end[0]}` : '...';
	});

	return projects;
};

parse.surveys = function(string){
	console.log(string);
	let survey;
	let surveys = [];

	let regexs = {
		surveyId: /surveyId:(\d*),/g,
		start: /surveyStartSdt:Date\.parseServerDate\((\d*),(\d*),(\d*)\)/g,
		end: /surveyEndSdt:Date\.parseServerDate\((\d*),(\d*),(\d*)\)/g,
		title: /surveyNme:"([\s\S]*?)",/g,
		status: /expertReviewStatusCde:"([\s\S]*?)"/g
	}

	while( survey = this.findAllMatches(regexs, string) ) {
		surveys.push(survey);
	};

	return surveys;
};

parse.survey = function(string){
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

	let su = this.findAllMatches(regexs, string)
	return {
					surveyId: 		su.surveyId,
					surveyStart: 	`${su.surveyStart[1]}/${su.surveyStart[2]}/${su.surveyStart[0]}`,
					surveyEnd: 		!!su.surveyEnd ? `${su.surveyEnd[1]}/${su.surveyEnd[2]}/${su.surveyEnd[0]}` : '...',
					surveyNme: 		!!su.surveyNme ? su.surveyNme : 'Unknow survey name',
					surveyComm: 	!!su.surveyComm ? su.surveyComm : 'No comments provided',
					siteId: 			su.siteId,
					siteDesc: 		!!su.siteDesc ? su.siteDesc : 'No site description provided',
					lat: 					su.lat,
					long: 				su.long,
					siteId: 			su.siteId,
					accu: 				su.accu
	};
};

parse.surveyMethod = function(string) {

	let regexs = {
		methodId: /componentId:(\d*)/g,
		samplingMethodDesc: /samplingMethodDesc:"([\s\S]*?)"/,
		disciplineCde: /disciplineCde:"(.*?)"/, 
	}

	return this.findAllMatches(regexs, string)
};

parse.taxonList = function(string) {
	console.log(string);
	let taxon;
	let taxons = [];
	let regexs = {
		id: /id:(\d*)/g,
		taxonId: /taxonId:(\d*)/g,
		scientificNme: /scientificNme:"([\s\S]*?)"/g,
		commonNme: /commonNme:"([\s\S]*?)"/g,
		disciplineCde: /disciplineCde:"(.*?)"/g,
		totalCountInt: /totalCountInt:(\d*)/g
	}

	while( taxon = this.findAllMatches(regexs, string) ) {
		taxons.push(taxon);
	};

	return taxons;
};

parse.methodDetail = function(string) {

	console.log(chalk.gray(string))
	
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

	return this.findAllMatches(regexs, string)
};

parse.findAllMatches = function(regexs, string) {
	// build and object with prop for each matching regex, return {} if nothing found.
	let re = {};
	for (let prop in regexs) {
		let result = regexs[prop].exec(string);
		if ( result ) {
			// remove the first captured group
			result.shift();
			// remove the input
			delete result.input;
			if ( result.length === 1 ) result = result[0];
		}
		re[prop] = result;
	}

	// empty array if none prop are matching regex
	const matchedKeysCount = Object.keys(re).filter(key => re[key] !== null); 
	
	if ( matchedKeysCount.length > 0 ) {
		return re;
	} else return false;
};

module.exports = parse;
