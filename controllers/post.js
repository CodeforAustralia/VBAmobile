const chalk = require('chalk');
const requestp = require('request-promise');

const post = {};

post.newTaxonRecord = function(taxonRecord, cookie) {
	let url = 'https://vba.dse.vic.gov.au/vba/vba/sc/IDACall?isc_rpc=1&isc_v=SC_SNAPSHOT-2010-08-03&isc_xhr=1'

	const tr = taxonRecord;
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
							<observerId xsi:type="xsd:long">${tr.observerId}</observerId>
							<taxonIdAdd xsi:type="xsd:long">${tr.taxonId}</taxonIdAdd>
							<totalCountInt xsi:type="xsd:long">${tr.totalCount}</totalCountInt>
							<typeCde>${tr.typeCde}</typeCde>
							<extraCde>${tr.extraInfo}</extraCde>
							<surveyComponent xsi:type="xsd:Object">
								<componentId xsi:type="xsd:long">${tr.componentId}</componentId>
								<survey xsi:type="xsd:Object">
									<surveyId xsi:type="xsd:long">${tr.surveyId}</surveyId>
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
							<observerId xsi:type="xsd:long">${tr.observerId}</observerId>
							<taxonIdAdd xsi:type="xsd:long">${tr.taxonId}</taxonIdAdd>
							<totalCountInt xsi:type="xsd:long">${tr.totalCount}</totalCountInt>
							<typeCde>${tr.typeCde}</typeCde>
							<extraCde>${tr.extraInfo}</extraCde>
							<surveyComponent xsi:type="xsd:Object">
								<componentId xsi:type="xsd:long">${tr.componentId}</componentId>
								<survey xsi:type="xsd:Object">
									<surveyId xsi:type="xsd:long">${tr.surveyId}</surveyId>
								</survey>
							</surveyComponent>
						</oldValues>
					</elem>
				</operations>
			</transaction>`,
			protocolVersion: '1.0'
		}
	}
	return requestp(options)
};

post.deleteTaxonRecord = function(surveyId, methodId, taxonRecordIds, cookie) {
	let url = 'https://vba.dse.vic.gov.au/vba/vba/sc/IDACall?isc_rpc=1&isc_v=SC_SNAPSHOT-2010-08-03&isc_xhr=1';
	
	let header = {
		'Host': 'vba.dse.vic.gov.au',
		'Connection': 'keep-alive',
		'Cache-Control': 'max-age=0',
		'Origin': 'https://vba.dse.vic.gov.au',
		'Upgrade-Insecure-Requests': '1',
		'Cookie': cookie
	};

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
							<SURVEY_ID>${surveyId}</SURVEY_ID>
							<SURVEY_COMPONENT_ID>${methodId}</SURVEY_COMPONENT_ID>
							<TAXON_RECORDED_ID>${taxonRecordIds.toString()}</TAXON_RECORDED_ID>
						</values>
						<operationConfig xsi:type="xsd:Object">
							<dataSource>TaxonRecorded_DS</dataSource>
							<operationType>custom</operationType>
						</operationConfig>
						<appID>builtinApplication</appID>
						<operation>deleteRecords</operation>
						<oldValues xsi:type="xsd:Object">
							<SURVEY_ID>1070245</SURVEY_ID>
							<SURVEY_COMPONENT_ID>1111431</SURVEY_COMPONENT_ID>
							<TAXON_RECORDED_ID>8437028,8437671</TAXON_RECORDED_ID>
						</oldValues>
					</elem>
				</operations>
			</transaction>`,
			protocolVersion: '1.0'
		}
	}
	console.log(chalk.yellow(JSON.stringify(options, null, 2)));
	return requestp(options)
};

post.saveSite = function( formData, cookie ){
	const url = 'https://vba.dse.vic.gov.au/dotmap/saveSite.json';

	const header = {
		'Host': 'vba.dse.vic.gov.au',
		'Connection': 'keep-alive',
		'Cache-Control': 'max-age=0',
		'Origin': 'https://vba.dse.vic.gov.au',
		'Upgrade-Insecure-Requests': '1',
		'Cookie': cookie
	};
	
	const options = {
		method: 'POST',
		resolveWithFullResponse: true,
		simple: false,
		json:true,
		url: url,
		headers: header,
		form: formData
	}
	console.log(chalk.yellow(JSON.stringify(options, null, 2)));
	return requestp(options)
};

post.createSurvey = function ( data, cookie ) {
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
			_transaction: `<transaction xmlns:xsi="http://www.w3.org/2000/10/XMLSchema-instance" xsi:type="xsd:Object">
    <operations xsi:type="xsd:List">
        <elem xsi:type="xsd:Object">
            <values xsi:type="xsd:Object">
            		<project xsi:type="xsd:Object">
										<projectId xsi:type="xsd:long">${data.projectId}</projectId>
								</project>
                <expertReviewStatusCde>draft</expertReviewStatusCde>
                <surveyNme>${data.surveyNme}</surveyNme>
                <surveyStartSdt xsi:type="xsd:date">${data.surveyStartSdt}</surveyStartSdt>
                <isGeneralObservation xsi:type="xsd:boolean">true</isGeneralObservation>
                <site xsi:type="xsd:Object">
                    <siteId xsi:type="xsd:long">${data.siteId}</siteId>
                </site>
                <surveyUserLinks xsi:type="xsd:List">
                    <elem xsi:type="xsd:Object">
                        <id xsi:type="xsd:Object">
                            <userUid xsi:type="xsd:long">${data.userUid}</userUid>
                            <projectId>${data.projectId}</projectId>
                        </id>
                    </elem>
                </surveyUserLinks>
                <primaryDisciplineCde>${data.primaryDisciplineCde}</primaryDisciplineCde>
            </values>
            <operationConfig xsi:type="xsd:Object">
                <dataSource>Survey_DS</dataSource>
                <operationType>custom</operationType>
            </operationConfig>
            <componentId>isc_DynamicForm_0</componentId>
            <appID>builtinApplication</appID>
            <operation>saveSurvey</operation>
        </elem>
    </operations>
	</transaction>`,
			protocolVersion: '1.0'
		}
	}
	console.log(chalk.green(JSON.stringify(options, null, 2)));
	return requestp(options)
};

module.exports = post;