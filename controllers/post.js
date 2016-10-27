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

module.exports = post;