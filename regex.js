const chalk = require('chalk');

let regexs = {
	surveyId: /surveyId:(\d*),/g,
	start: /surveyStartSdt:Date\.parseServerDate\((\d*),(\d*),(\d*)\)/g,
	end: /surveyEndSdt:Date\.parseServerDate\((\d*),(\d*),(\d*)\)/g,
	title: /surveyNme:"([\s\S]*?)",/g,
	status: /expertReviewStatusCde:"([\s\S]*?)"/g
}

let str = '//isc_RPCResponseStart-->[{isDSResponse:true,invalidateCache:false,status:0,data:[{surveyNme:"Property Survey July 2011",surveyEndSdt:Date.parseServerDate(2011,6,31),surveyId:1070245,primaryDisciplineCde:"tf",surveyStartSdt:Date.parseServerDate(2011,3,7),expertReviewStatusCde:"a"},{surveyNme:"Property Survey August 2011",surveyEndSdt:Date.parseServerDate(2011,7,21),surveyId:1070249,primaryDisciplineCde:"tf",surveyStartSdt:Date.parseServerDate(2011,4,8),expertReviewStatusCde:"a"},{surveyNme:"Property Survey September 2011",surveyEndSdt:Date.parseServerDate(2011,8,30),surveyId:1070500,primaryDisciplineCde:"tf",surveyStartSdt:Date.parseServerDate(2011,1,9),expertReviewStatusCde:"a"},{surveyNme:"Property Survey October 2011",surveyEndSdt:Date.parseServerDate(2011,9,31),surveyId:1070501,primaryDisciplineCde:"tf",surveyStartSdt:Date.parseServerDate(2011,0,10),expertReviewStatusCde:"a"}]}]//isc_RPCResponseEnd';
let tempData;
let parsedData = [];

let findALlMatches = function(regexs, string) {
	let re = {};
	for (let prop in regexs) {
		let result = regexs[prop].exec(string);
		if ( result ) {
			// remove the first captured group
			result.shift();
			// remove the input
			delete result.input;
			if ( result.length === 1 ) result = result[0];
			re[prop] = result;
		}
	}
	if (Object.keys(re).length === 0) return null;
	return re;
}

while((tempData = findALlMatches(regexs, str)) !== null ) {
	console.log(chalk.green(JSON.stringify(tempData, null, 2)));
	parsedData.push(tempData);
	// debugger;
};

console.log(chalk.yellow(JSON.stringify(parsedData, null, 2)));
debugger;

