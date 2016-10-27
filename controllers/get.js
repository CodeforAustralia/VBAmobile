const chalk = require('chalk');
const requestp = require('request-promise');
const get = {};

get.userDetails = function(cookie) {
	console.log(chalk.red(cookie))
	// debugger;
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
};

get.cookie = function(username, password, jar) {
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

get.project = function(cookie){
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

get.survey = function(surveyId, cookie) {
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

get.surveysList = function(projectId, cookie) {
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

get.surveyMethods = function(surveyId, cookie) {
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

get.methodTaxonList = function(methodID, cookie) {
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

get.methodDetail = function(methodID, cookie) {
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

module.exports = get;